import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Registration from "@/lib/models/Registration";
import { signSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const normalised = (email as string).trim().toLowerCase();

  /* ── Super-admin check ── */
  if (
    normalised === process.env.ADMIN_USERNAME?.toLowerCase() &&
    password   === process.env.ADMIN_PASSWORD
  ) {
    const token = await signSession({ id: "superadmin", email: normalised, role: "superadmin", name: "Super Admin" });
    await setSessionCookie(token);
    return NextResponse.json({ role: "superadmin" });
  }

  /* ── Registered user check ── */
  await connectDB();
  const user = await Registration.findOne({ email: normalised, status: "approved" });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials or account not yet approved." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password as string, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials or account not yet approved." }, { status: 401 });
  }

  const token = await signSession({ id: user._id.toString(), email: normalised, role: user.role, name: user.name });
  await setSessionCookie(token);
  return NextResponse.json({ role: user.role });
}
