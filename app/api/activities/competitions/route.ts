import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Competition from "@/lib/models/Competition";

export async function GET() {
  await connectDB();
  const competitions = await Competition.find()
    .select("name date description whoCanParticipate mainImage subImages")
    .sort({ date: 1 })
    .lean();
  return NextResponse.json(competitions);
}
