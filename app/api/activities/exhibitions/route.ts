import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Exhibition from "@/lib/models/Exhibition";

export async function GET() {
  await connectDB();
  const exhibitions = await Exhibition.find()
    .select("name dates description mainImage subImages")
    .sort({ "dates.0": 1 })
    .lean();
  return NextResponse.json(exhibitions);
}
