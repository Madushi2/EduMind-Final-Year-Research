import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/lib/models/Course";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "lecturer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const courses = await Course.find({ lecturers: session.id, active: true })
    .select("name code semester credits")
    .sort({ code: 1 })
    .lean();

  return NextResponse.json(
    courses.map((course) => ({
      id: String(course._id),
      code: course.code,
      name: course.name,
      semester: course.semester,
      credits: course.credits,
    }))
  );
}
