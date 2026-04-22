"use client";

import Link from "next/link";
import { useContext, useEffect, useMemo, useState } from "react";
import { CourseContext, StudentCourse } from "./course-context";

interface Pdf {
  id: string;
  title: string;
  description: string;
  specialNote: string;
  fileName: string;
  size: number;
  createdAt: string;
  lecturer: { name: string; position: string };
}

interface Notification {
  id: string;
  title: string;
  description: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  lecturer: { name: string; position: string | null };
}

interface Lecturer {
  id: string;
  name: string;
  email: string;
  position: string | null;
}

interface CourseMetrics {
  course: StudentCourse;
  pdfs: Pdf[];
  notifications: Notification[];
  lecturers: Lecturer[];
}

const actions = [
  { href: "/student/course-pdf", label: "Course PDF", desc: "Open learning materials.", accent: "#2563eb" },
  { href: "/student/generate-quiz", label: "Generate Quiz", desc: "Practice from course content.", accent: "#059669" },
  { href: "/student/lectures", label: "Lectures", desc: "Continue lecture work.", accent: "#7c3aed" },
  { href: "/student/notifications", label: "Notifications", desc: "Read course updates.", accent: "#dc2626" },
];

const priorityRank: Record<string, number> = { urgent: 4, high: 3, normal: 2, medium: 2, low: 1 };
const priorityColor: Record<string, string> = { urgent: "#b91c1c", high: "#dc2626", normal: "#2563eb", medium: "#e8a020", low: "#059669" };

function ArrowIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5L19 8.5V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2a5 5 0 00-10 0v2m8-13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function daysAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.max(0, Math.floor(diff / 86400000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function pct(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

async function getJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

async function loadCourseMetrics(course: StudentCourse): Promise<CourseMetrics> {
  const [pdfs, notifications, lecturers] = await Promise.all([
    getJson<Pdf[]>(`/api/student/pdfs?courseId=${course.id}`, []),
    getJson<Notification[]>(`/api/student/notifications?courseId=${course.id}`, []),
    getJson<Lecturer[]>(`/api/student/courses/${course.id}/lecturers`, []),
  ]);

  return {
    course,
    pdfs: Array.isArray(pdfs) ? pdfs : [],
    notifications: Array.isArray(notifications) ? notifications : [],
    lecturers: Array.isArray(lecturers) ? lecturers : [],
  };
}

function StatCard({ label, value, hint, color, icon }: { label: string; value: string | number; hint: string; color: string; icon: React.ReactNode }) {
  return (
    <article className="bg-white rounded-2xl border p-5 min-h-[132px]" style={{ borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>{label}</div>
          <div className="text-3xl font-black mt-2" style={{ color }}>{value}</div>
        </div>
        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}12`, color }}>{icon}</span>
      </div>
      <p className="text-xs font-semibold mt-3 leading-relaxed" style={{ color: "#64748b" }}>{hint}</p>
    </article>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white rounded-2xl border px-6 py-10 text-center" style={{ borderColor: "#e2e8f0" }}>
      <div className="text-sm font-black" style={{ color: "#1a3262" }}>{title}</div>
      <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{text}</p>
    </div>
  );
}

export default function StudentDashboard() {
  const { selectedCourse } = useContext(CourseContext);
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [metrics, setMetrics] = useState<CourseMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getJson<StudentCourse[]>("/api/student/courses", [])
      .then(async (courseList) => {
        const safeCourses = Array.isArray(courseList) ? courseList : [];
        const loaded = await Promise.all(safeCourses.map(loadCourseMetrics));
        if (!alive) return;
        setCourses(safeCourses);
        setMetrics(loaded);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const selectedMetrics = useMemo(() => {
    if (!selectedCourse) return null;
    return metrics.find((item) => item.course.id === selectedCourse.id) ?? null;
  }, [metrics, selectedCourse]);

  const allPdfs = metrics.flatMap((item) => item.pdfs.map((pdfItem) => ({ ...pdfItem, course: item.course })));
  const allNotifications = metrics.flatMap((item) => item.notifications.map((notification) => ({ ...notification, course: item.course })));
  const unread = allNotifications.filter((notification) => !notification.isRead);
  const urgentUnread = unread.filter((notification) => ["urgent", "high"].includes(notification.priority)).length;
  const totalCredits = courses.reduce((sum, course) => sum + (course.credits ?? 0), 0);
  const totalSize = allPdfs.reduce((sum, pdfItem) => sum + (pdfItem.size ?? 0), 0);
  const latestPdf = [...allPdfs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const latestNotification = [...allNotifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const selectedUnread = selectedMetrics?.notifications.filter((notification) => !notification.isRead).length ?? 0;
  const selectedReadRate = selectedMetrics ? pct(selectedMetrics.notifications.length - selectedUnread, selectedMetrics.notifications.length) : 0;

  const sortedNotifications = [...allNotifications]
    .sort((a, b) => {
      const priorityDiff = (priorityRank[b.priority] ?? 0) - (priorityRank[a.priority] ?? 0);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 5);

  const dateStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1400px]">
      <section className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0e1f45 0%, #1a3262 55%, #1e3d72 100%)", minHeight: 210 }}>
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-10" style={{ background: "#e8a020" }} />
        <div className="absolute -bottom-12 right-32 w-32 h-32 rounded-full opacity-10" style={{ background: "#e8a020" }} />
        <div className="relative z-10 p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border mb-3" style={{ background: "rgba(232,160,32,0.15)", borderColor: "rgba(232,160,32,0.35)", color: "#e8a020" }}>Student Analytics</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {selectedCourse ? `${selectedCourse.code} learning dashboard` : "Your learning dashboard"}
            </h1>
            <p className="text-sm mt-2 max-w-2xl" style={{ color: "rgba(255,255,255,0.58)" }}>
              Real course activity, unread priorities, materials, and lecturer coverage in one clear view.
            </p>
            <p className="text-xs font-semibold mt-3" style={{ color: "rgba(255,255,255,0.42)" }}>{dateStr}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 min-w-[280px]">
            <div className="rounded-2xl border px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" }}>
              <div className="text-[10px] font-black tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Courses</div>
              <div className="text-2xl font-black text-white mt-1">{loading ? "..." : courses.length}</div>
            </div>
            <div className="rounded-2xl border px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" }}>
              <div className="text-[10px] font-black tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Unread</div>
              <div className="text-2xl font-black text-white mt-1">{loading ? "..." : unread.length}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Enrolled Courses" value={loading ? "..." : courses.length} hint={`${totalCredits || 0} registered credits across active courses.`} color="#2563eb" icon={<BookIcon />} />
        <StatCard label="PDF Library" value={loading ? "..." : allPdfs.length} hint={`${formatBytes(totalSize)} of materials available to study.`} color="#059669" icon={<FileIcon />} />
        <StatCard label="Unread Updates" value={loading ? "..." : unread.length} hint={urgentUnread > 0 ? `${urgentUnread} high priority item${urgentUnread === 1 ? "" : "s"} need attention.` : "No urgent unread course updates."} color="#dc2626" icon={<BellIcon />} />
        <StatCard label="Lecturer Touchpoints" value={loading ? "..." : new Set(metrics.flatMap((item) => item.lecturers.map((lecturer) => lecturer.id))).size} hint="Unique lecturers connected to your enrolled courses." color="#7c3aed" icon={<UsersIcon />} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-sm font-black" style={{ color: "#1a3262" }}>Selected Course Health</h2>
              <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{selectedCourse ? `${selectedCourse.name} activity snapshot.` : "Select a course in the header to focus this panel."}</p>
            </div>
            {selectedCourse && <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: "#f1f5f9", color: "#475569" }}>{selectedCourse.code}</span>}
          </div>

          {!selectedCourse ? (
            <EmptyState title="No course selected" text="Choose a course to see materials, unread status, lecturers, and activity freshness." />
          ) : loading || !selectedMetrics ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((item) => <div key={item} className="h-24 rounded-2xl animate-pulse" style={{ background: "#f1f5f9" }} />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-2xl p-4" style={{ background: "#f8fafc" }}>
                  <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>Materials</div>
                  <div className="text-2xl font-black mt-1" style={{ color: "#2563eb" }}>{selectedMetrics.pdfs.length}</div>
                </div>
                <div className="rounded-2xl p-4" style={{ background: "#f8fafc" }}>
                  <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>Unread</div>
                  <div className="text-2xl font-black mt-1" style={{ color: selectedUnread ? "#dc2626" : "#059669" }}>{selectedUnread}</div>
                </div>
                <div className="rounded-2xl p-4" style={{ background: "#f8fafc" }}>
                  <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>Read Rate</div>
                  <div className="text-2xl font-black mt-1" style={{ color: "#059669" }}>{selectedReadRate}%</div>
                </div>
                <div className="rounded-2xl p-4" style={{ background: "#f8fafc" }}>
                  <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>Lecturers</div>
                  <div className="text-2xl font-black mt-1" style={{ color: "#7c3aed" }}>{selectedMetrics.lecturers.length}</div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl p-4" style={{ background: selectedUnread ? "rgba(220,38,38,0.07)" : "rgba(5,150,105,0.08)", border: `1px solid ${selectedUnread ? "rgba(220,38,38,0.15)" : "rgba(5,150,105,0.16)"}` }}>
                <div className="text-sm font-black" style={{ color: selectedUnread ? "#991b1b" : "#047857" }}>
                  {selectedUnread ? "Start with unread course notices." : "You are caught up on course notices."}
                </div>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: selectedUnread ? "#b91c1c" : "#047857" }}>
                  {selectedUnread ? `${selectedUnread} update${selectedUnread === 1 ? "" : "s"} may affect deadlines, new materials, or lecturer instructions.` : "Use the PDF library or quiz generator for the next study block."}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h2 className="text-sm font-black" style={{ color: "#1a3262" }}>Recent Signals</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl p-4" style={{ background: "#f8fafc" }}>
              <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>Latest Material</div>
              <div className="text-sm font-black mt-1 truncate" style={{ color: "#1a3262" }}>{latestPdf?.title ?? "No PDFs yet"}</div>
              <div className="text-xs mt-1" style={{ color: "#64748b" }}>{latestPdf ? `${latestPdf.course.code} by ${latestPdf.lecturer.name} - ${daysAgo(latestPdf.createdAt)}` : "New materials will appear here."}</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: "#f8fafc" }}>
              <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>Latest Notice</div>
              <div className="text-sm font-black mt-1 truncate" style={{ color: "#1a3262" }}>{latestNotification?.title ?? "No notifications yet"}</div>
              <div className="text-xs mt-1" style={{ color: "#64748b" }}>{latestNotification ? `${latestNotification.course.code} - ${daysAgo(latestNotification.createdAt)}` : "Course updates will appear here."}</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "#94a3b8" }}>Course Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Link key={action.href} href={selectedCourse ? action.href : "#"} onClick={(event) => { if (!selectedCourse) event.preventDefault(); }} className="group bg-white rounded-2xl border p-5 transition-all hover:shadow-md" style={{ borderColor: "#e2e8f0", opacity: selectedCourse ? 1 : 0.58, cursor: selectedCourse ? "pointer" : "not-allowed" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black" style={{ background: `${action.accent}12`, color: action.accent }}>{action.label.slice(0, 1)}</div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#1a3262" }}><ArrowIcon /></span>
              </div>
              <h3 className="text-sm font-black mt-4" style={{ color: "#1a3262" }}>{action.label}</h3>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "#94a3b8" }}>{action.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: "#e2e8f0" }}>
          <h2 className="text-sm font-black mb-4" style={{ color: "#1a3262" }}>Priority Inbox</h2>
          {sortedNotifications.length === 0 ? (
            <EmptyState title="No notifications found" text="When lecturers post updates, the most important ones will be ranked here." />
          ) : (
            <div className="space-y-3">
              {sortedNotifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 rounded-2xl p-4" style={{ background: notification.isRead ? "#f8fafc" : "rgba(220,38,38,0.06)" }}>
                  <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: priorityColor[notification.priority] ?? "#94a3b8" }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase" style={{ color: priorityColor[notification.priority] ?? "#64748b" }}>{notification.priority}</span>
                      <span className="text-[10px] font-bold" style={{ color: "#94a3b8" }}>{notification.course.code}</span>
                    </div>
                    <div className="text-sm font-black truncate mt-1" style={{ color: "#1a3262" }}>{notification.title}</div>
                    <div className="text-xs mt-1" style={{ color: "#64748b" }}>{formatDate(notification.createdAt)} by {notification.lecturer.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: "#e2e8f0" }}>
          <h2 className="text-sm font-black mb-4" style={{ color: "#1a3262" }}>Course Load</h2>
          {metrics.length === 0 ? (
            <EmptyState title={loading ? "Loading courses" : "No enrolled courses"} text={loading ? "Gathering your dashboard data." : "Contact admin if your courses are missing."} />
          ) : (
            <div className="space-y-3">
              {metrics.map((item) => {
                const pending = item.notifications.filter((notification) => !notification.isRead).length;
                return (
                  <div key={item.course.id} className="rounded-2xl p-4" style={{ background: selectedCourse?.id === item.course.id ? "rgba(26,50,98,0.06)" : "#f8fafc", border: selectedCourse?.id === item.course.id ? "1px solid rgba(26,50,98,0.12)" : "1px solid transparent" }}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-black truncate" style={{ color: "#1a3262" }}>{item.course.code} - {item.course.name}</div>
                        <div className="text-xs mt-1" style={{ color: "#64748b" }}>{item.pdfs.length} PDFs, {item.notifications.length} notices, {item.lecturers.length} lecturers</div>
                      </div>
                      <span className="text-xs font-black px-2.5 py-1 rounded-full shrink-0" style={{ background: pending ? "rgba(220,38,38,0.10)" : "rgba(5,150,105,0.10)", color: pending ? "#dc2626" : "#059669" }}>{pending} unread</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
