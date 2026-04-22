import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/lib/models/Course";
import { getSession } from "@/lib/auth";

interface PopulatedStudent {
  _id:       unknown;
  name:      string;
  email:     string;
  contact:   string;
  semester?: string;
  gender?:   string;
  age?:      number;
  createdAt: Date;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (session?.role !== "lecturer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json({ error: "Course is required." }, { status: 400 });
  }

  await connectDB();

  const course = await Course.findOne({ _id: courseId, lecturers: session.id, active: true })
    .select("name code semester credits active students")
    .populate({
      path: "students",
      match: { role: "student", status: "approved" },
      select: "name email contact semester gender age createdAt",
      options: { sort: { name: 1 } },
    })
    .lean();

  if (!course) {
    return NextResponse.json({ error: "Course not found for this lecturer." }, { status: 404 });
  }

  const students = (course.students as unknown as PopulatedStudent[]).map((student) => ({
    _id:       String(student._id),
    name:      student.name,
    email:     student.email,
    contact:   student.contact,
    semester:  student.semester ?? "",
    gender:    student.gender,
    age:       student.age,
    createdAt: student.createdAt,
    courses: [
      {
        _id:      String(course._id),
        name:     course.name,
        code:     course.code,
        semester: course.semester,
        credits:  course.credits,
        active:   course.active,
      },
    ],
  }));

  return NextResponse.json({
    course: {
      id:       String(course._id),
      name:     course.name,
      code:     course.code,
      semester: course.semester,
      credits:  course.credits,
      active:   course.active,
    },
    students,
  });
}
