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

  const lecturers = await Registration.find({ role: "lecturer", status: "approved" })
    .select("-passwordHash")
    .sort({ name: 1 })
    .lean();

  const lecturerIds = lecturers.map((l) => l._id);

  const courses = await Course.find({ lecturers: { $in: lecturerIds } })
    .select("name code semester credits active lecturers students")
    .lean();

  // Build a map: lecturerId → courses[]
  const courseMap: Record<string, { _id: string; name: string; code: string; semester: string; credits: number; active: boolean; studentCount: number }[]> = {};
  for (const c of courses) {
    for (const lid of c.lecturers as unknown as string[]) {
      const key = String(lid);
      if (!courseMap[key]) courseMap[key] = [];
      courseMap[key].push({
        _id:          String(c._id),
        name:         c.name,
        code:         c.code,
        semester:     c.semester,
        credits:      c.credits,
        active:       c.active,
        studentCount: (c.students as unknown as string[]).length,
      });
    }
  }

  const result = lecturers.map((l) => ({
    ...l,
    _id:     String(l._id),
    courses: courseMap[String(l._id)] ?? [],
  }));

  return NextResponse.json(result);
}
