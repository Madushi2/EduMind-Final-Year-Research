import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Registration from "@/lib/models/Registration";
import { sendNewRegistrationAlert } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { role, name, email, contact, password } = body;

  /* Basic server-side validation */
  if (!role || !name || !email || !contact || !password) {
    return NextResponse.json({ error: "All required fields must be provided." }, { status: 400 });
  }
  if (!["student", "lecturer"].includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  await connectDB();

  /* Prevent duplicate pending/approved requests */
  const existing = await Registration.findOne({
    email: email.trim().toLowerCase(),
    status: { $in: ["pending", "approved"] },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A registration request for this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const doc: Record<string, unknown> = {
    role,
    name:         name.trim(),
    email:        email.trim().toLowerCase(),
    contact:      contact.trim(),
    passwordHash,
  };

  if (role === "student") {
    doc.semester = body.semester;
    doc.gender   = body.gender;
    doc.age      = Number(body.age);
  } else {
    doc.position = body.position;
  }

  await Registration.create(doc);

  // Notify super admin – fire and forget (don't block the response)
  sendNewRegistrationAlert(name.trim(), email.trim().toLowerCase(), role).catch(() => {});

  return NextResponse.json({ ok: true }, { status: 201 });
}
