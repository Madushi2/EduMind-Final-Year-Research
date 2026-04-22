"use client";

import { useContext, useEffect, useState } from "react";
import { CourseContext } from "../course-context";

interface Notification {
  id:          string;
  title:       string;
  description: string;
  priority:    "low" | "normal" | "high" | "urgent";
  isRead:      boolean;
  createdAt:   string;
  lecturer: {
    name:     string;
    position: string | null;
  };
}

const PRIORITY_CFG = {
  low:    { label: "Low",    bg: "rgba(148,163,184,0.12)", text: "#475569", dot: "#94a3b8" },
  normal: { label: "Normal", bg: "rgba(37,99,235,0.10)",  text: "#1d4ed8", dot: "#2563eb" },
  high:   { label: "High",   bg: "rgba(234,88,12,0.12)",  text: "#c2410c", dot: "#ea580c" },
  urgent: { label: "Urgent", bg: "rgba(220,38,38,0.12)",  text: "#b91c1c", dot: "#dc2626" },
} as const;

function PriorityBadge({ p }: { p: Notification["priority"] }) {
  const cfg = PRIORITY_CFG[p];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function SingleCheck() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
      <path d="M1 6L6 11L16 1" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DoubleCheck() {
  return (
    <svg width="23" height="12" viewBox="0 0 23 12" fill="none">
      <path d="M1 6L6 11L16 1"   stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 6L12 11L22 1"  stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border p-5 space-y-3 animate-pulse" style={{ borderColor: "#e2e8f0" }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full shrink-0" style={{ background: "#f1f5f9" }} />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-40 rounded-full" style={{ background: "#e2e8f0" }} />
          <div className="h-3 w-24 rounded-full" style={{ background: "#f1f5f9" }} />
        </div>
        <div className="h-6 w-16 rounded-full" style={{ background: "#f1f5f9" }} />
      </div>
      <div className="h-3 w-full rounded-full" style={{ background: "#f1f5f9" }} />
      <div className="h-3 w-4/5 rounded-full" style={{ background: "#f1f5f9" }} />
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function StudentNotificationsPage() {
  const { selectedCourse, markNotifRead } = useContext(CourseContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [readSet, setReadSet]             = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!selectedCourse) {
      setNotifications([]);
      setReadSet(new Set());
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/student/notifications?courseId=${selectedCourse.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load notifications");
        return res.json();
      })
      .then((data: Notification[]) => {
        setNotifications(Array.isArray(data) ? data : []);
        setReadSet(new Set(data.filter((n) => n.isRead).map((n) => n.id)));
      })
      .catch(() => setError("Could not load notifications. Please try again."))
      .finally(() => setLoading(false));
  }, [selectedCourse?.id]);

  async function handleMarkRead(n: Notification) {
    if (readSet.has(n.id)) return;
    setReadSet((prev) => new Set([...prev, n.id]));
    if (selectedCourse) markNotifRead(selectedCourse.id);
    await fetch("/api/student/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: n.id }),
    }).catch(() => {});
  }

  const unreadCount = notifications.filter((n) => !readSet.has(n.id)).length;
  const urgentCount = notifications.filter((n) => n.priority === "urgent").length;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-350">

      {/* Banner */}
      <section
        className="relative rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0e1f45 0%, #1a3262 55%, #1e3d72 100%)", minHeight: 140 }}
      >
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-10" style={{ background: "#e8a020" }} />
        <div className="absolute -bottom-12 right-32 w-32 h-32 rounded-full opacity-10" style={{ background: "#e8a020" }} />
        <div className="relative z-10 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span
              className="inline-flex text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border mb-2"
              style={{ background: "rgba(220,38,38,0.18)", borderColor: "rgba(220,38,38,0.35)", color: "#fca5a5" }}
            >
              Notifications
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {selectedCourse ? `${selectedCourse.code} — Announcements` : "Notifications"}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
              {selectedCourse ? selectedCourse.name : "Select a course to see announcements."}
            </p>
          </div>

          {selectedCourse && !loading && notifications.length > 0 && (
            <div className="flex gap-3 shrink-0">
              <div className="rounded-2xl border px-5 py-3 text-center" style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" }}>
                <div className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Total</div>
                <div className="text-2xl font-black text-white">{notifications.length}</div>
              </div>
              {unreadCount > 0 && (
                <div className="rounded-2xl border px-5 py-3 text-center" style={{ borderColor: "rgba(37,99,235,0.4)", background: "rgba(37,99,235,0.15)" }}>
                  <div className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: "rgba(147,197,253,0.8)" }}>Unread</div>
                  <div className="text-2xl font-black" style={{ color: "#93c5fd" }}>{unreadCount}</div>
                </div>
              )}
              {urgentCount > 0 && (
                <div className="rounded-2xl border px-5 py-3 text-center" style={{ borderColor: "rgba(220,38,38,0.4)", background: "rgba(220,38,38,0.15)" }}>
                  <div className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: "rgba(252,165,165,0.8)" }}>Urgent</div>
                  <div className="text-2xl font-black" style={{ color: "#fca5a5" }}>{urgentCount}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      {!selectedCourse ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(220,38,38,0.08)" }}>
            <BellIcon className="w-8 h-8" />
          </div>
          <p className="font-semibold text-sm" style={{ color: "#94a3b8" }}>No course selected.</p>
          <p className="text-xs mt-1" style={{ color: "#cbd5e1" }}>Use the header dropdown to choose a course.</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border p-6 text-sm font-semibold text-center"
          style={{ borderColor: "#fecaca", background: "#fef2f2", color: "#b91c1c" }}>
          {error}
        </div>
      ) : loading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(220,38,38,0.08)" }}>
            <BellIcon className="w-8 h-8" />
          </div>
          <p className="font-semibold text-sm" style={{ color: "#94a3b8" }}>No announcements yet.</p>
          <p className="text-xs mt-1" style={{ color: "#cbd5e1" }}>Your lecturers haven&apos;t posted anything for this course.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const read = readSet.has(n.id);
            const borderColor = n.priority === "urgent" ? "rgba(220,38,38,0.25)" : read ? "#e2e8f0" : "rgba(37,99,235,0.2)";
            return (
              <article
                key={n.id}
                onClick={() => handleMarkRead(n)}
                className="bg-white rounded-2xl border p-5 transition-all hover:shadow-md"
                style={{
                  borderTopColor:    borderColor,
                  borderRightColor:  borderColor,
                  borderBottomColor: borderColor,
                  borderLeftWidth:   n.priority === "urgent" || n.priority === "high" ? 3 : 1,
                  borderLeftColor:   PRIORITY_CFG[n.priority].dot,
                  background:        read ? "white" : "rgba(37,99,235,0.025)",
                  cursor:            read ? "default" : "pointer",
                }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    {!read && (
                      <span className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ background: "#2563eb" }} />
                    )}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                      style={{ background: "rgba(124,58,237,0.12)", color: "#7c3aed" }}
                    >
                      {initials(n.lecturer.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate" style={{ color: "#1a3262" }}>{n.lecturer.name}</div>
                      {n.lecturer.position && (
                        <div className="text-[10px]" style={{ color: "#94a3b8" }}>{n.lecturer.position}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge p={n.priority} />
                    <span className="text-[11px]" style={{ color: "#cbd5e1" }}>{timeAgo(n.createdAt)}</span>
                  </div>
                </div>

                <h3
                  className="text-sm mt-3"
                  style={{ color: "#1a3262", fontWeight: read ? 600 : 900 }}
                >
                  {n.title}
                </h3>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: read ? "#94a3b8" : "#475569" }}>{n.description}</p>

                <div className="flex items-center justify-end mt-3 gap-1.5">
                  {read ? (
                    <>
                      <span className="text-[10px] font-semibold" style={{ color: "#2563eb" }}>Read</span>
                      <DoubleCheck />
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-semibold" style={{ color: "#94a3b8" }}>Tap to mark as read</span>
                      <SingleCheck />
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
