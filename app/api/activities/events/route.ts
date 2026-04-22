import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/lib/models/Event";

export async function GET() {
  await connectDB();
  const events = await Event.find()
    .select("name date description mainImage subImages")
    .sort({ date: 1 })
    .lean();
  return NextResponse.json(events);
}
