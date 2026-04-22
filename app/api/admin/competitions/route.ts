import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Competition from "@/lib/models/Competition";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const competitions = await Competition.find().sort({ date: 1 }).lean();
  return NextResponse.json(competitions);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session?.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, date, description, whoCanParticipate, mainImage, subImages } = body;

  if (!name?.trim())              return NextResponse.json({ error: "Competition name is required." }, { status: 400 });
  if (!date)                      return NextResponse.json({ error: "Competition date is required." }, { status: 400 });
  if (!whoCanParticipate?.trim()) return NextResponse.json({ error: "Participation eligibility is required." }, { status: 400 });
  if (!mainImage)                 return NextResponse.json({ error: "Main image is required." }, { status: 400 });

  await connectDB();
  const competition = await Competition.create({
    name:              name.trim(),
    date:              new Date(date),
    description:       description?.trim() || undefined,
    whoCanParticipate: whoCanParticipate.trim(),
    mainImage,
    subImages:         Array.isArray(subImages) ? subImages : [],
  });

  return NextResponse.json(competition, { status: 201 });
}
