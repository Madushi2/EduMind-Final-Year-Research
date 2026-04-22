"use client";

import { FormEvent, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CourseContext } from "../course-context";

type Priority = "low" | "normal" | "high" | "urgent";
type ToastType = "success" | "error" | "info";

interface CourseNotification {
  id:          string;
  title:       string;
  description: string;
  priority:    Priority;
  createdAt:   string;
  isOwner?:     boolean;
  lecturer?: {
    id:        string;
    name:      string;
    email:     string;
    position?: string;
  };
}

interface Toast {
  id:      number;
  type:    ToastType;
  title:   string;
  message: string;
}

const PRIORITY_CFG: Record<Priority, { label: string; desc: string; color: string; bg: string }> = {
  low:    { label: "Low",    desc: "General update",      color: "#2563eb", bg: "rgba(37,99,235,0.10)" },
  normal: { label: "Normal", desc: "Standard notice",     color: "#059669", bg: "rgba(5,150,105,0.10)" },
  high:   { label: "High",   desc: "Important reminder",  color: "#d97706", bg: "rgba(217,119,6,0.12)" },
  urgent: { label: "Urgent", desc: "Needs attention now", color: "#dc2626", bg: "rgba(220,38,38,0.10)" },
};

const TOAST_COLORS = {
  success: { bg: "rgba(5,150,105,0.10)", border: "rgba(5,150,105,0.25)", text: "#065f46", dot: "#059669" },
  error:   { bg: "rgba(220,38,38,0.09)", border: "rgba(220,38,38,0.22)", text: "#991b1b", dot: "#dc2626" },
  info:    { bg: "rgba(26,50,98,0.08)", border: "rgba(26,50,98,0.18)", text: "#1a3262", dot: "#1a3262" },
} as const;

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="fixed top-20 right-5 z-[80] space-y-3 w-[min(360px,calc(100vw-40px))]">
      {toasts.map((toast) => {
        const colors = TOAST_COLORS[toast.type];
        return (
          <button
            key={toast.id}
            onClick={() => dismiss(toast.id)}
            className="w-full text-left rounded-2xl border p-4 shadow-lg"
            style={{ background: colors.bg, borderColor: colors.border, color: colors.text }}
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ background: colors.dot }} />
              <span>
                <span className="block text-sm font-black">{toast.title}</span>
                <span className="block text-xs mt-0.5 leading-relaxed opacity-80">{toast.message}</span>
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((type: ToastType, title: string, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 4500);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, push, dismiss };
}

function BellIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function PriorityPill({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CFG[priority];
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider" style={{ background: cfg.bg, color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function SkeletonItem() {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "#e2e8f0" }}>
      <div className="flex gap-4">
        <div className="w-11 h-11 rounded-xl" style={{ background: "#f1f5f9" }} />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-44 rounded-full" style={{ background: "#e2e8f0" }} />
          <div className="h-3 w-full rounded-full" style={{ background: "#f1f5f9" }} />
          <div className="h-3 w-2/3 rounded-full" style={{ background: "#f1f5f9" }} />
        </div>
      </div>
    </div>
  );
}

export default function LecturerNotificationsPage() {
  const { selectedCourse } = useContext(CourseContext);
  const { toasts, push, dismiss } = useToast();

  const [notifications, setNotifications] = useState<CourseNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");

  const courseId = selectedCourse?.id ?? "";
  const canSubmit = useMemo(
    () => Boolean(courseId && title.trim() && description.trim() && !saving),
    [courseId, description, saving, title]
  );

  useEffect(() => {
    if (!courseId) {
      const timer = setTimeout(() => {
        setNotifications([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => setLoading(true), 0);

    fetch(`/api/lecturer/notifications?courseId=${encodeURIComponent(courseId)}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load notifications.");
        return res.json();
      })
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch((error) => {
        if (error.name !== "AbortError") push("error", "Could not load notifications", "Please refresh and try again.");
      })
      .finally(() => setLoading(false));

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [courseId, push]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("normal");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCourse) {
      push("info", "Select a course", "Choose a course from the header before adding notifications.");
      return;
    }
    if (!title.trim()) {
      push("error", "Title required", "Add a title for this notification.");
      return;
    }
    if (!description.trim()) {
      push("error", "Description required", "Add the notification message.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/lecturer/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          title: title.trim(),
          description: description.trim(),
          priority,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        push("error", "Notification not added", data.error ?? "Please try again.");
        return;
      }

      setNotifications((prev) => [data, ...prev]);
      resetForm();
      push("success", "Notification added", `${data.title} was added to ${selectedCourse.code}.`);
    } catch {
      push("error", "Notification not added", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-black" style={{ color: "#1a3262" }}>Manage Notifications</h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
            Add course announcements with clear priority levels.
          </p>
        </div>
        <div className="rounded-2xl border px-4 py-3 min-w-[220px]" style={{ background: "white", borderColor: "#e2e8f0" }}>
          <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>Active Course</div>
          <div className="text-sm font-black mt-1" style={{ color: "#1a3262" }}>{selectedCourse?.code ?? "Not selected"}</div>
          <div className="text-xs truncate max-w-[260px]" style={{ color: "#64748b" }}>
            {selectedCourse?.name ?? "Select a course from the header."}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-1 bg-white rounded-2xl border p-5 space-y-5"
          style={{ borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
        >
          <div>
            <h2 className="text-sm font-black" style={{ color: "#1a3262" }}>Add Notification</h2>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>Title, description, and priority are required.</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#1a3262" }}>Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={!selectedCourse || saving}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all disabled:opacity-60"
              style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#1e293b" }}
              placeholder="Assignment deadline reminder"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#1a3262" }}>Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={!selectedCourse || saving}
              rows={5}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none transition-all disabled:opacity-60"
              style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#1e293b" }}
              placeholder="Write the message students should see..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#1a3262" }}>Priority</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PRIORITY_CFG) as Priority[]).map((item) => {
                const cfg = PRIORITY_CFG[item];
                const active = priority === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPriority(item)}
                    disabled={!selectedCourse || saving}
                    className="rounded-xl border p-3 text-left transition-all disabled:opacity-60"
                    style={{
                      background: active ? cfg.bg : "#f8fafc",
                      borderColor: active ? cfg.color : "#e2e8f0",
                      boxShadow: active ? `0 0 0 2px ${cfg.color}18` : undefined,
                    }}
                  >
                    <span className="block text-xs font-black" style={{ color: active ? cfg.color : "#1a3262" }}>{cfg.label}</span>
                    <span className="block text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>{cfg.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl px-4 py-3 text-sm font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "#1a3262", color: "#e8a020" }}
          >
            {saving ? "Adding..." : "Add Notification"}
          </button>
        </form>

        <section className="xl:col-span-2 bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b" style={{ borderColor: "#f1f5f9" }}>
            <div>
              <h2 className="text-sm font-black" style={{ color: "#1a3262" }}>Course Notifications</h2>
              <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                {selectedCourse ? `${notifications.length} notification${notifications.length !== 1 ? "s" : ""} in ${selectedCourse.code}` : "Select a course to view notifications"}
              </p>
            </div>
          </div>

          {!selectedCourse ? (
            <div className="py-20 px-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(26,50,98,0.08)", color: "#1a3262" }}>
                <BellIcon className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black" style={{ color: "#1a3262" }}>No course selected</h3>
              <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Use the header dropdown to choose a course first.</p>
            </div>
          ) : loading ? (
            <div className="p-4 space-y-3">
              <SkeletonItem />
              <SkeletonItem />
              <SkeletonItem />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 px-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(232,160,32,0.12)", color: "#b45309" }}>
                <BellIcon className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black" style={{ color: "#1a3262" }}>No notifications yet</h3>
              <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Add the first notification for this course using the form.</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map((notification) => {
                const cfg = PRIORITY_CFG[notification.priority];
                return (
                  <article key={notification.id} className="rounded-2xl border p-4 transition-all hover:shadow-md" style={{ borderColor: "#e8edf4", background: "#ffffff" }}>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                        <BellIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <h3 className="text-base font-black" style={{ color: "#1a3262" }}>{notification.title}</h3>
                          <PriorityPill priority={notification.priority} />
                        </div>
                        <p className="text-sm mt-2 leading-relaxed" style={{ color: "#475569" }}>{notification.description}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold" style={{ color: "#94a3b8" }}>
                          <span>
                            Added by {notification.isOwner ? "you" : notification.lecturer?.name ?? "Lecturer"}
                          </span>
                          <span style={{ color: "#cbd5e1" }}>•</span>
                          <span>
                            {new Date(notification.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                          {notification.lecturer?.position && (
                            <span className="rounded-full px-2 py-0.5" style={{ background: "rgba(26,50,98,0.06)", color: "#64748b" }}>
                              {notification.lecturer.position}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
