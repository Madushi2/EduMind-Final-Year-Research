import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/lib/models/Course";
import CourseNotification from "@/lib/models/CourseNotification";
import NotificationRead from "@/lib/models/NotificationRead";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "student") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const enrolledCourses = await Course.find(
    { students: session.id, active: true },
    "_id"
  ).lean();
  const courseIds = enrolledCourses.map((c) => c._id);

  const allNotifs = await CourseNotification.find(
    { course: { $in: courseIds } },
    "_id course"
  ).lean();

  if (allNotifs.length === 0) {
    return NextResponse.json({ total: 0, byCourse: {} });
  }

  const readRecords = await NotificationRead.find(
    { student: session.id, notification: { $in: allNotifs.map((n) => n._id) } },
    "notification"
  ).lean();
  const readSet = new Set(readRecords.map((r) => String(r.notification)));

  const byCourse: Record<string, number> = {};
  let total = 0;

  for (const notif of allNotifs) {
    if (!readSet.has(String(notif._id))) {
      const cid = String(notif.course);
      byCourse[cid] = (byCourse[cid] ?? 0) + 1;
      total++;
    }
  }

  return NextResponse.json({ total, byCourse });
}
