"use client";

import Link from "next/link";
import { useContext, useEffect, useMemo, useState } from "react";
import { CourseContext, LecturerCourse } from "./course-context";

interface Pdf {
  id: string;
  title: string;
  description: string;
  specialNote: string;
  fileName: string;
  size: number;
  active: boolean;
  createdAt: string;
  isOwner: boolean;
  lecturer: { id: string; name: string; email: string; position: string };
}

interface Notification {
  id: string;
  title: string;
  description: string;
  priority: string;
  createdAt: string;
  isOwner: boolean;
  lecturer: { id: string; name: string; email: string; position: string };
}

interface Student {
  _id: string;
  name: string;
  email: string;
  contact: string;
  semester: string;
  gender?: string;
  age?: number;
  createdAt: string;
}

interface StudentResponse {
  course: LecturerCourse;
  students: Student[];
}

interface CourseMetrics {
  course: LecturerCourse;
  pdfs: Pdf[];
  notifications: Notification[];
  students: Student[];
}

const actions = [
  { href: "/lecturer/manage-pdf", label: "Manage PDF", desc: "Publish and maintain materials.", accent: "#2563eb" },
  { href: "/lecturer/generate-quiz", label: "Generate Quiz", desc: "Prepare course assessment practice.", accent: "#059669" },
  { href: "/lecturer/students", label: "Students", desc: "Review enrollment and contacts.", accent: "#7c3aed" },
  { href: "/lecturer/notifications", label: "Notifications", desc: "Send targeted course updates.", accent: "#dc2626" },
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

function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
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

async function loadCourseMetrics(course: LecturerCourse): Promise<CourseMetrics> {
  const [pdfs, notifications, studentResponse] = await Promise.all([
    getJson<Pdf[]>(`/api/lecturer/pdfs?courseId=${course.id}`, []),
    getJson<Notification[]>(`/api/lecturer/notifications?courseId=${course.id}`, []),
    getJson<StudentResponse | null>(`/api/lecturer/students?courseId=${course.id}`, null),
  ]);

  return {
    course,
    pdfs: Array.isArray(pdfs) ? pdfs : [],
    notifications: Array.isArray(notifications) ? notifications : [],
    students: studentResponse && Array.isArray(studentResponse.students) ? studentResponse.students : [],
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

export default function LecturerDashboard() {
  const { selectedCourse } = useContext(CourseContext);
  const [courses, setCourses] = useState<LecturerCourse[]>([]);
  const [metrics, setMetrics] = useState<CourseMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getJson<LecturerCourse[]>("/api/lecturer/courses", [])
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
  const totalStudents = metrics.reduce((sum, item) => sum + item.students.length, 0);
  const activePdfs = allPdfs.filter((pdfItem) => pdfItem.active !== false).length;
  const hiddenPdfs = allPdfs.length - activePdfs;
  const urgentNotices = allNotifications.filter((notification) => ["urgent", "high"].includes(notification.priority)).length;
  const latestPdf = [...allPdfs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const latestNotification = [...allNotifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const selectedActivePdfs = selectedMetrics?.pdfs.filter((pdfItem) => pdfItem.active !== false).length ?? 0;
  const selectedStudentCount = selectedMetrics?.students.length ?? 0;
  const selectedNoticeCount = selectedMetrics?.notifications.length ?? 0;
  const selectedCoverage = selectedStudentCount > 0 ? (selectedActivePdfs / selectedStudentCount).toFixed(1) : "0.0";

  const semesterBreakdown = useMemo(() => {
    const students = selectedMetrics?.students ?? [];
    const counts = new Map<string, number>();
    for (const student of students) {
      const key = student.semester || "Unassigned";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [selectedMetrics]);

  const rankedCourses = [...metrics].sort((a, b) => {
    const aScore = a.students.length + a.notifications.filter((n) => ["urgent", "high"].includes(n.priority)).length * 3 + a.pdfs.length;
    const bScore = b.students.length + b.notifications.filter((n) => ["urgent", "high"].includes(n.priority)).length * 3 + b.pdfs.length;
    return bScore - aScore;
  });

  const recentNotifications = [...allNotifications]
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
            <span className="inline-flex text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border mb-3" style={{ background: "rgba(232,160,32,0.15)", borderColor: "rgba(232,160,32,0.35)", color: "#e8a020" }}>Lecturer Analytics</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {selectedCourse ? `${selectedCourse.code} teaching dashboard` : "Your teaching dashboard"}
            </h1>
            <p className="text-sm mt-2 max-w-2xl" style={{ color: "rgba(255,255,255,0.58)" }}>
              Live course load, student reach, published content, and announcement priority across your assigned courses.
            </p>
            <p className="text-xs font-semibold mt-3" style={{ color: "rgba(255,255,255,0.42)" }}>{dateStr}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 min-w-[280px]">
            <div className="rounded-2xl border px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" }}>
              <div className="text-[10px] font-black tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Courses</div>
              <div className="text-2xl font-black text-white mt-1">{loading ? "..." : courses.length}</div>
            </div>
            <div className="rounded-2xl border px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" }}>
              <div className="text-[10px] font-black tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Students</div>
              <div className="text-2xl font-black text-white mt-1">{loading ? "..." : totalStudents}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Assigned Courses" value={loading ? "..." : courses.length} hint={`${courses.reduce((sum, course) => sum + (course.credits ?? 0), 0)} credits in your active teaching load.`} color="#2563eb" icon={<BookIcon />} />
        <StatCard label="Students Reached" value={loading ? "..." : totalStudents} hint="Total enrollments across assigned courses." color="#7c3aed" icon={<UsersIcon />} />
        <StatCard label="Published PDFs" value={loading ? "..." : activePdfs} hint={hiddenPdfs > 0 ? `${hiddenPdfs} PDF${hiddenPdfs === 1 ? "" : "s"} currently hidden from students.` : "All uploaded PDFs are visible."} color="#059669" icon={<FileIcon />} />
        <StatCard label="Priority Notices" value={loading ? "..." : urgentNotices} hint="High and urgent announcements across your courses." color="#dc2626" icon={<BellIcon />} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-sm font-black" style={{ color: "#1a3262" }}>Selected Course Pulse</h2>
              <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{selectedCourse ? `${selectedCourse.name} teaching snapshot.` : "Select a course in the header to focus this panel."}</p>
            </div>
            {selectedCourse && <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: "#f1f5f9", color: "#475569" }}>{selectedCourse.code}</span>}
          </div>

          {!selectedCourse ? (
            <EmptyState title="No course selected" text="Choose a course to inspect students, materials, notices, and coverage." />
          ) : loading || !selectedMetrics ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((item) => <div key={item} className="h-24 rounded-2xl animate-pulse" style={{ background: "#f1f5f9" }} />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-2xl p-4" style={{ background: "#f8fafc" }}>
                  <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>Students</div>
                  <div className="text-2xl font-black mt-1" style={{ color: "#7c3aed" }}>{selectedStudentCount}</div>
                </div>
                <div className="rounded-2xl p-4" style={{ background: "#f8fafc" }}>
                  <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>Active PDFs</div>
                  <div className="text-2xl font-black mt-1" style={{ color: "#059669" }}>{selectedActivePdfs}</div>
                </div>
                <div className="rounded-2xl p-4" style={{ background: "#f8fafc" }}>
                  <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>Notices</div>
                  <div className="text-2xl font-black mt-1" style={{ color: "#dc2626" }}>{selectedNoticeCount}</div>
                </div>
                <div className="rounded-2xl p-4" style={{ background: "#f8fafc" }}>
                  <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>PDF / Student</div>
                  <div className="text-2xl font-black mt-1" style={{ color: "#2563eb" }}>{selectedCoverage}</div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl p-4" style={{ background: selectedActivePdfs === 0 ? "rgba(220,38,38,0.07)" : "rgba(5,150,105,0.08)", border: `1px solid ${selectedActivePdfs === 0 ? "rgba(220,38,38,0.15)" : "rgba(5,150,105,0.16)"}` }}>
                <div className="text-sm font-black" style={{ color: selectedActivePdfs === 0 ? "#991b1b" : "#047857" }}>
                  {selectedActivePdfs === 0 ? "This course has no visible PDFs." : "Course materials are available to students."}
                </div>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: selectedActivePdfs === 0 ? "#b91c1c" : "#047857" }}>
                  {selectedActivePdfs === 0 ? "Upload at least one core reading or lecture PDF so students have a clear starting point." : `${selectedActivePdfs} visible material${selectedActivePdfs === 1 ? "" : "s"} support ${selectedStudentCount} enrolled student${selectedStudentCount === 1 ? "" : "s"}.`}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h2 className="text-sm font-black" style={{ color: "#1a3262" }}>Recent Teaching Signals</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl p-4" style={{ background: "#f8fafc" }}>
              <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>Latest Upload</div>
              <div className="text-sm font-black mt-1 truncate" style={{ color: "#1a3262" }}>{latestPdf?.title ?? "No PDFs yet"}</div>
              <div className="text-xs mt-1" style={{ color: "#64748b" }}>{latestPdf ? `${latestPdf.course.code} - ${daysAgo(latestPdf.createdAt)}` : "Uploaded materials will appear here."}</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: "#f8fafc" }}>
              <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>Latest Notice</div>
              <div className="text-sm font-black mt-1 truncate" style={{ color: "#1a3262" }}>{latestNotification?.title ?? "No notifications yet"}</div>
              <div className="text-xs mt-1" style={{ color: "#64748b" }}>{latestNotification ? `${latestNotification.course.code} by ${latestNotification.lecturer.name} - ${daysAgo(latestNotification.createdAt)}` : "Announcements will appear here."}</div>
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

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border p-6 xl:col-span-2" style={{ borderColor: "#e2e8f0" }}>
          <h2 className="text-sm font-black mb-4" style={{ color: "#1a3262" }}>Course Workload</h2>
          {rankedCourses.length === 0 ? (
            <EmptyState title={loading ? "Loading courses" : "No assigned courses"} text={loading ? "Gathering your teaching dashboard data." : "Contact admin if your courses are missing."} />
          ) : (
            <div className="space-y-3">
              {rankedCourses.map((item) => {
                const highPriority = item.notifications.filter((notification) => ["urgent", "high"].includes(notification.priority)).length;
                const visiblePdfs = item.pdfs.filter((pdfItem) => pdfItem.active !== false).length;
                return (
                  <div key={item.course.id} className="rounded-2xl p-4" style={{ background: selectedCourse?.id === item.course.id ? "rgba(26,50,98,0.06)" : "#f8fafc", border: selectedCourse?.id === item.course.id ? "1px solid rgba(26,50,98,0.12)" : "1px solid transparent" }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-black truncate" style={{ color: "#1a3262" }}>{item.course.code} - {item.course.name}</div>
                        <div className="text-xs mt-1" style={{ color: "#64748b" }}>{item.students.length} students, {visiblePdfs} visible PDFs, {item.notifications.length} notices</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ background: highPriority ? "rgba(220,38,38,0.10)" : "rgba(5,150,105,0.10)", color: highPriority ? "#dc2626" : "#059669" }}>{highPriority} priority</span>
                        <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ background: "#eef2ff", color: "#4338ca" }}>{pct(visiblePdfs, Math.max(1, item.students.length))}% coverage</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: "#e2e8f0" }}>
          <h2 className="text-sm font-black mb-4" style={{ color: "#1a3262" }}>Selected Cohort</h2>
          {!selectedCourse ? (
            <EmptyState title="No course selected" text="Select a course to see the semester makeup." />
          ) : semesterBreakdown.length === 0 ? (
            <EmptyState title={loading ? "Loading cohort" : "No students found"} text={loading ? "Gathering student records." : "Approved enrollments will appear here."} />
          ) : (
            <div className="space-y-3">
              {semesterBreakdown.map(([semester, count]) => (
                <div key={semester}>
                  <div className="flex items-center justify-between text-xs font-black mb-1">
                    <span style={{ color: "#475569" }}>{semester}</span>
                    <span style={{ color: "#1a3262" }}>{count}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct(count, selectedStudentCount)}%`, background: "#7c3aed" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-2xl border p-6" style={{ borderColor: "#e2e8f0" }}>
        <h2 className="text-sm font-black mb-4" style={{ color: "#1a3262" }}>Priority Announcements</h2>
        {recentNotifications.length === 0 ? (
          <EmptyState title="No announcements found" text="High-impact announcements across your courses will be ranked here." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {recentNotifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 rounded-2xl p-4" style={{ background: "#f8fafc" }}>
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
      </section>
    </div>
  );
}
