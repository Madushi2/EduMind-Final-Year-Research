import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Registration from "@/lib/models/Registration";
import Course from "@/lib/models/Course";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const students = await Registration.find({ role: "student", status: "approved" })
    .select("-passwordHash")
    .sort({ name: 1 })
    .lean();

  const studentIds = students.map((s) => s._id);

  const courses = await Course.find({ students: { $in: studentIds } })
    .select("name code semester credits active students")
    .lean();

  // Build a map: studentId → courses[]
  const courseMap: Record<string, { _id: string; name: string; code: string; semester: string; credits: number; active: boolean }[]> = {};
  for (const c of courses) {
    for (const sid of c.students as unknown as string[]) {
      const key = String(sid);
      if (!courseMap[key]) courseMap[key] = [];
      courseMap[key].push({
        _id:      String(c._id),
        name:     c.name,
        code:     c.code,
        semester: c.semester,
        credits:  c.credits,
        active:   c.active,
      });
    }
  }

  const result = students.map((s) => ({
    ...s,
    _id:     String(s._id),
    courses: courseMap[String(s._id)] ?? [],
  }));

  return NextResponse.json(result);
}
