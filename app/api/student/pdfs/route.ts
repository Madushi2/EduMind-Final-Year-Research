import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/lib/models/Course";
import LecturePdf from "@/lib/models/LecturePdf";
import { getSession } from "@/lib/auth";

async function canAccessCourse(courseId: string, studentId: string) {
  return Course.exists({ _id: courseId, students: studentId, active: true });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (session?.role !== "student") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json({ error: "Course is required." }, { status: 400 });
  }

  await connectDB();
  const allowed = await canAccessCourse(courseId, session.id);
  if (!allowed) {
    return NextResponse.json({ error: "Course not found for this student." }, { status: 404 });
  }

  const pdfs = await LecturePdf.find({ course: courseId, active: { $ne: false } })
    .select("-fileData")
    .populate("lecturer", "name email position")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    pdfs.map((pdf) => {
      const lecturer = pdf.lecturer as unknown as { name?: string; email?: string; position?: string };
      return {
        id: String(pdf._id),
        title: pdf.title,
        description: pdf.description ?? "",
        specialNote: pdf.specialNote ?? "",
        fileName: pdf.fileName,
        size: pdf.size,
        createdAt: pdf.createdAt,
        lecturer: {
          name: lecturer?.name ?? "Lecturer",
          email: lecturer?.email ?? "",
          position: lecturer?.position ?? "",
        },
      };
    })
  );
}
