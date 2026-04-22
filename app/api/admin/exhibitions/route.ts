import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Exhibition from "@/lib/models/Exhibition";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const exhibitions = await Exhibition.find().sort({ "dates.0": 1 }).lean();
  return NextResponse.json(exhibitions);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session?.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, dates, description, mainImage, subImages } = body;

  if (!name?.trim())                        return NextResponse.json({ error: "Exhibition name is required." }, { status: 400 });
  if (!Array.isArray(dates) || !dates[0])   return NextResponse.json({ error: "At least one date is required." }, { status: 400 });
  if (!mainImage)                           return NextResponse.json({ error: "Main image is required." }, { status: 400 });

  await connectDB();
  const exhibition = await Exhibition.create({
    name:        name.trim(),
    dates:       dates.map((d: string) => new Date(d)),
    description: description?.trim() || undefined,
    mainImage,
    subImages:   Array.isArray(subImages) ? subImages : [],
  });

  return NextResponse.json(exhibition, { status: 201 });
}
