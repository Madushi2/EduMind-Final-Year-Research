import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/lib/models/Course";
import CourseNotification from "@/lib/models/CourseNotification";
import NotificationRead from "@/lib/models/NotificationRead";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (session?.role !== "student") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json({ error: "courseId is required." }, { status: 400 });
  }

  await connectDB();

  const enrolled = await Course.exists({ _id: courseId, students: session.id, active: true });
  if (!enrolled) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const notifications = await CourseNotification.find({ course: courseId })
    .populate("lecturer", "name position")
    .sort({ createdAt: -1 })
    .lean();

  const notifIds = notifications.map((n) => n._id);
  const readRecords = await NotificationRead.find(
    { student: session.id, notification: { $in: notifIds } },
    "notification"
  ).lean();
  const readSet = new Set(readRecords.map((r) => String(r.notification)));

  return NextResponse.json(
    notifications.map((n) => {
      const lec = n.lecturer as { name?: string; position?: string } | null;
      return {
        id:          String(n._id),
        title:       n.title,
        description: n.description,
        priority:    n.priority,
        isRead:      readSet.has(String(n._id)),
        createdAt:   n.createdAt,
        lecturer: {
          name:     lec?.name     ?? "Lecturer",
          position: lec?.position ?? null,
        },
      };
    })
  );
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (session?.role !== "student") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const { notificationId } = body ?? {};
  if (!notificationId) {
    return NextResponse.json({ error: "notificationId is required." }, { status: 400 });
  }

  await connectDB();

  const notif = await CourseNotification.findById(notificationId, "course").lean();
  if (!notif) {
    return NextResponse.json({ error: "Notification not found." }, { status: 404 });
  }

  const enrolled = await Course.exists({ _id: notif.course, students: session.id, active: true });
  if (!enrolled) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await NotificationRead.updateOne(
    { student: session.id, notification: notificationId },
    { $setOnInsert: { student: session.id, notification: notificationId, readAt: new Date() } },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
