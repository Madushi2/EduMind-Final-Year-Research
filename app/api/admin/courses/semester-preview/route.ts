import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Registration from "@/lib/models/Registration";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (session?.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const semester = req.nextUrl.searchParams.get("semester");
  if (!semester) {
    return NextResponse.json({ count: 0 });
  }

  await connectDB();

  const count = await Registration.countDocuments({
    role:     "student",
    status:   "approved",
    semester,
  });

  return NextResponse.json({ count });
}
