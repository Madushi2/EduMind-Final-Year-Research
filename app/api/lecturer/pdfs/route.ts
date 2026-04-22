import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/lib/models/Course";
import LecturePdf from "@/lib/models/LecturePdf";
import { getSession } from "@/lib/auth";

const MAX_PDF_SIZE = 15 * 1024 * 1024;

async function canAccessCourse(courseId: string, lecturerId: string) {
  return Course.exists({ _id: courseId, lecturers: lecturerId, active: true });
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
  const allowed = await canAccessCourse(courseId, session.id);
  if (!allowed) {
    return NextResponse.json({ error: "Course not found for this lecturer." }, { status: 404 });
  }

  const pdfs = await LecturePdf.find({ course: courseId, lecturer: session.id })
    .select("-fileData")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    pdfs.map((pdf) => ({
      id: String(pdf._id),
      title: pdf.title,
      description: pdf.description ?? "",
      specialNote: pdf.specialNote ?? "",
      fileName: pdf.fileName,
      size: pdf.size,
      active: pdf.active ?? true,
      createdAt: pdf.createdAt,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session?.role !== "lecturer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const courseId = String(form.get("courseId") ?? "");
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const specialNote = String(form.get("specialNote") ?? "").trim();
  const file = form.get("pdf");

  if (!courseId) {
    return NextResponse.json({ error: "Please select a course first." }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "PDF file is required." }, { status: 400 });
  }
  if (file.size > MAX_PDF_SIZE) {
    return NextResponse.json({ error: "PDF must be 15 MB or smaller." }, { status: 400 });
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
  }

  await connectDB();
  const allowed = await canAccessCourse(courseId, session.id);
  if (!allowed) {
    return NextResponse.json({ error: "Course not found for this lecturer." }, { status: 404 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const pdf = await LecturePdf.create({
    course:   courseId,
    lecturer: session.id,
    title,
    description,
    specialNote,
    fileName: file.name,
    mimeType: "application/pdf",
    size:     file.size,
    fileData: bytes,
    active:   true,
  });

  return NextResponse.json(
    {
      id: String(pdf._id),
      title: pdf.title,
      description: pdf.description ?? "",
      specialNote: pdf.specialNote ?? "",
      fileName: pdf.fileName,
      size: pdf.size,
      active: pdf.active,
      createdAt: pdf.createdAt,
    },
    { status: 201 }
  );
}
