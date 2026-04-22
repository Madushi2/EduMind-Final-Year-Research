import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/lib/models/Course";
import Registration from "@/lib/models/Registration";
import { getSession } from "@/lib/auth";
import { sendCourseAssignmentEmail } from "@/lib/email";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const courses = await Course.find()
    .populate("lecturers", "name email position")
    .populate("students",  "name email semester")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session?.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, code, semester, credits, lecturerIds } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Course name is required." }, { status: 400 });
  }
  if (!code?.trim()) {
    return NextResponse.json({ error: "Course code is required." }, { status: 400 });
  }
  if (!semester) {
    return NextResponse.json({ error: "Semester is required." }, { status: 400 });
  }
  const parsedCredits = Number(credits);
  if (!parsedCredits || parsedCredits < 1) {
    return NextResponse.json({ error: "Number of credits must be at least 1." }, { status: 400 });
  }

  await connectDB();

  // Auto-enroll every approved student whose registered semester matches
  const matchingStudents = await Registration.find({
    role:     "student",
    status:   "approved",
    semester,
  }).select("_id");

  const assignedLecturerIds = Array.isArray(lecturerIds) ? lecturerIds : [];

  const course = await Course.create({
    name:      name.trim(),
    code:      code.trim().toUpperCase(),
    semester,
    credits:   parsedCredits,
    lecturers: assignedLecturerIds,
    students:  matchingStudents.map((s) => s._id),
  });

  const populated = await course.populate([
    { path: "lecturers", select: "name email position" },
    { path: "students",  select: "name email semester" },
  ]);

  // Notify assigned lecturers via email (fire-and-forget)
  if (assignedLecturerIds.length > 0) {
    const lecturers = populated.lecturers as unknown as Array<{ name: string; email: string }>;
    Promise.allSettled(
      lecturers.map((l) =>
        sendCourseAssignmentEmail(l.name, l.email, populated.name, populated.code, populated.semester, populated.credits)
      )
    ).catch(() => {/* silent */});
  }

  return NextResponse.json(
    {
      course:         populated,
      enrolledCount:  matchingStudents.length,
      lecturerCount:  assignedLecturerIds.length,
    },
    { status: 201 }
  );
}
