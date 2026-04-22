import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Registration from "@/lib/models/Registration";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "student") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const student = await Registration.findById(session.id)
    .select("name email contact semester gender age")
    .lean();

  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: String(student._id),
    name: student.name,
    email: student.email,
    contact: student.contact,
    semester: student.semester ?? "",
    gender: student.gender ?? "",
    age: student.age ?? null,
  });
}
