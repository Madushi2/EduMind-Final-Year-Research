import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/lib/models/Course";
import LecturePdf from "@/lib/models/LecturePdf";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (session?.role !== "lecturer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const active = Boolean(body.active);

  await connectDB();

  const pdf = await LecturePdf.findById(id);
  if (!pdf) {
    return NextResponse.json({ error: "PDF not found." }, { status: 404 });
  }

  const allowed = await Course.exists({ _id: pdf.course, lecturers: session.id, active: true });
  if (!allowed || String(pdf.lecturer) !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  pdf.active = active;
  await pdf.save();

  return NextResponse.json({
    id: String(pdf._id),
    active: pdf.active,
  });
}
