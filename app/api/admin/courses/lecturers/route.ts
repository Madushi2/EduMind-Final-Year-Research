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

  const lecturers = await Registration.find({ role: "lecturer", status: "approved" })
    .select("_id name email position")
    .sort({ name: 1 })
    .lean();

  return NextResponse.json(lecturers);
}
