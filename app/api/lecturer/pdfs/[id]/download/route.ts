import { NextRequest, NextResponse } from "next/server";
import LecturePdf from "@/lib/models/LecturePdf";
import Course from "@/lib/models/Course";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";

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

  const pdf = await LecturePdf.findById(id);
  if (!pdf) {
    return NextResponse.json({ error: "PDF not found." }, { status: 404 });
  }

  const allowed = await Course.exists({ _id: pdf.course, lecturers: session.id, active: true });
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const fileName = encodeURIComponent(pdf.fileName);
  return new NextResponse(new Uint8Array(pdf.fileData), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.size),
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
