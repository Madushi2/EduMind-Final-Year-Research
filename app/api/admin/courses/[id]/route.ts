import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/lib/models/Course";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (session?.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
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

  const course = await Course.findByIdAndUpdate(
    id,
    {
      name:      name.trim(),
      code:      code.trim().toUpperCase(),
      semester,
      credits:   parsedCredits,
      lecturers: Array.isArray(lecturerIds) ? lecturerIds : [],
    },
    { returnDocument: "after" }
  )
    .populate("lecturers", "name email position")
    .populate("students",  "name email semester");

  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  return NextResponse.json(course);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (session?.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { active } = await req.json();

  await connectDB();

  const course = await Course.findByIdAndUpdate(
    id,
    { active },
    { returnDocument: "after" }
  )
    .populate("lecturers", "name email position")
    .populate("students",  "name email semester");

  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  return NextResponse.json(course);
}
