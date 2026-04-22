import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/lib/models/Course";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (session?.role !== "student") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await connectDB();

  const course = await Course.findOne({ _id: id, students: session.id, active: true })
    .populate("lecturers", "name email position contact")
    .lean();

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const lecturers = (course.lecturers as unknown as Array<{
    _id: unknown;
    name: string;
    email: string;
    position?: string;
    contact?: string;
  }>).map((l) => ({
    id:       String(l._id),
    name:     l.name,
    email:    l.email,
    position: l.position ?? null,
    contact:  l.contact ?? null,
  }));

  return NextResponse.json(lecturers);
}
