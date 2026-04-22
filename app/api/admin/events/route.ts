import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/lib/models/Event";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const events = await Event.find().sort({ date: 1 }).lean();
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session?.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, date, description, mainImage, subImages } = body;

  if (!name?.trim())  return NextResponse.json({ error: "Event name is required." }, { status: 400 });
  if (!date)          return NextResponse.json({ error: "Event date is required." }, { status: 400 });
  if (!mainImage)     return NextResponse.json({ error: "Main image is required." }, { status: 400 });

  await connectDB();
  const event = await Event.create({
    name:        name.trim(),
    date:        new Date(date),
    description: description?.trim() || undefined,
    mainImage,
    subImages:   Array.isArray(subImages) ? subImages : [],
  });

  return NextResponse.json(event, { status: 201 });
}
