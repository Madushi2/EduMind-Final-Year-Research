import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Registration from "@/lib/models/Registration";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const [students, lecturers, pending, approved, rejected] = await Promise.all([
    Registration.countDocuments({ role: "student",  status: "approved" }),
    Registration.countDocuments({ role: "lecturer", status: "approved" }),
    Registration.countDocuments({ status: "pending"  }),
    Registration.countDocuments({ status: "approved" }),
    Registration.countDocuments({ status: "rejected" }),
  ]);

  return NextResponse.json({ students, lecturers, pending, approved, rejected, total: students + lecturers });
}
