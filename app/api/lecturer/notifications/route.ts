import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/lib/models/Course";
import CourseNotification, { NotificationPriority } from "@/lib/models/CourseNotification";
import { getSession } from "@/lib/auth";

const PRIORITIES: NotificationPriority[] = ["low", "normal", "high", "urgent"];

type NotificationLecturer = {
  _id?: unknown;
  name?: string;
  email?: string;
  position?: string;
};

async function canAccessCourse(courseId: string, lecturerId: string) {
  return Course.exists({ _id: courseId, lecturers: lecturerId, active: true });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (session?.role !== "lecturer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json({ error: "Course is required." }, { status: 400 });
  }

  await connectDB();
  const allowed = await canAccessCourse(courseId, session.id);
  if (!allowed) {
    return NextResponse.json({ error: "Course not found for this lecturer." }, { status: 404 });
  }

  const notifications = await CourseNotification.find({ course: courseId })
    .populate("lecturer", "name email position")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    notifications.map((notification) => {
      const lecturer = notification.lecturer as unknown as NotificationLecturer;
      const lecturerId = String(lecturer?._id ?? notification.lecturer);

      return {
        id: String(notification._id),
        title: notification.title,
        description: notification.description,
        priority: notification.priority,
        createdAt: notification.createdAt,
        isOwner: lecturerId === session.id,
        lecturer: {
          id: lecturerId,
          name: lecturer?.name ?? "Lecturer",
          email: lecturer?.email ?? "",
          position: lecturer?.position ?? "",
        },
      };
    })
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session?.role !== "lecturer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const courseId = String(body.courseId ?? "");
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const priority = String(body.priority ?? "normal") as NotificationPriority;

  if (!courseId) {
    return NextResponse.json({ error: "Please select a course first." }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  if (!description) {
    return NextResponse.json({ error: "Description is required." }, { status: 400 });
  }
  if (!PRIORITIES.includes(priority)) {
    return NextResponse.json({ error: "Invalid priority selected." }, { status: 400 });
  }

  await connectDB();
  const allowed = await canAccessCourse(courseId, session.id);
  if (!allowed) {
    return NextResponse.json({ error: "Course not found for this lecturer." }, { status: 404 });
  }

  const notification = await CourseNotification.create({
    course: courseId,
    lecturer: session.id,
    title,
    description,
    priority,
  });

  return NextResponse.json(
    {
      id: String(notification._id),
      title: notification.title,
      description: notification.description,
      priority: notification.priority,
      createdAt: notification.createdAt,
    },
    { status: 201 }
  );
}
