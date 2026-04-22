import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Exhibition from "@/lib/models/Exhibition";
import { getSession } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (session?.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await connectDB();
  await Exhibition.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
