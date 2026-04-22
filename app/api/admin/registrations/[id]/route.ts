import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Registration from "@/lib/models/Registration";
import { getSession } from "@/lib/auth";
import { sendRegistrationStatusEmail } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (session?.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
  }

  await connectDB();
  const updated = await Registration.findByIdAndUpdate(id, { status }, { new: true }).select("-passwordHash");

  if (!updated) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  }

  // Notify the applicant – fire and forget
  sendRegistrationStatusEmail(updated.name, updated.email, status as "approved" | "rejected").catch(() => {});

  return NextResponse.json(updated);
}
