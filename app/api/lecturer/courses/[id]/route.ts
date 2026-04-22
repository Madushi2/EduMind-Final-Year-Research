import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/lib/models/Course";
import { getSession } from "@/lib/auth";

interface PopulatedLecturer {
  _id:       unknown;
  name:      string;
  email:     string;
  position?: string;
  contact?:  string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (session?.role !== "lecturer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await connectDB();

  const course = await Course.findOne({ _id: id, lecturers: session.id, active: true })
    .select("name code semester credits active lecturers students")
    .populate({
      path: "lecturers",
      match: { role: "lecturer", status: "approved" },
      select: "name email position contact",
      options: { sort: { name: 1 } },
    })
    .lean();

  if (!course) {
    return NextResponse.json({ error: "Course not found for this lecturer." }, { status: 404 });
  }

  const lecturers = (course.lecturers as unknown as PopulatedLecturer[]).map((lecturer) => ({
    id:        String(lecturer._id),
    name:      lecturer.name,
    email:     lecturer.email,
    position:  lecturer.position ?? null,
    contact:   lecturer.contact ?? null,
    isCurrent: String(lecturer._id) === session.id,
  }));

  return NextResponse.json({
    id:           String(course._id),
    name:         course.name,
    code:         course.code,
    semester:     course.semester,
    credits:      course.credits,
    active:       course.active,
    studentCount: Array.isArray(course.students) ? course.students.length : 0,
    lecturers,
  });
}
