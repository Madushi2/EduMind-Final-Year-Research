"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* ── Types ────────────────────────────────────────────────────── */
interface Stats {
  students: number; lecturers: number;
  pending: number; approved: number;
  rejected: number; total: number;
}
interface Registration {
  _id: string; role: "student" | "lecturer"; name: string;
  email: string; status: "pending" | "approved" | "rejected"; createdAt: string;
}

/* ── Stat card ────────────────────────────────────────────────── */
function StatCard({
  label, value, sub, icon, accent, delay,
}: {
  label: string; value: number | string; sub?: string;
  icon: React.ReactNode; accent: string; delay: number;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShown(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div
      className="bg-white rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-500"
      style={{
        borderColor: "#e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(12px)",
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}18` }}
        >
          <span style={{ color: accent }}>{icon}</span>
        </div>
        <span
          className="text-[10px] font-black px-2 py-1 rounded-full"
          style={{ background: `${accent}18`, color: accent }}
        >
          {sub ?? "Total"}
        </span>
      </div>
      <div>
        <div className="text-3xl font-black" style={{ color: "#1a3262" }}>{value}</div>
        <div className="text-sm font-medium mt-0.5" style={{ color: "#64748b" }}>{label}</div>
      </div>
    </div>
  );
}

/* ── Tiny status badge ────────────────────────────────────────── */
const STATUS_CFG = {
  pending: { bg: "rgba(232,160,32,0.12)", text: "#b45309", dot: "#e8a020" },
  approved: { bg: "rgba(5,150,105,0.12)", text: "#065f46", dot: "#059669" },
  rejected: { bg: "rgba(220,38,38,0.10)", text: "#991b1b", dot: "#dc2626" },
} as const;

function StatusPill({ s }: { s: keyof typeof STATUS_CFG }) {
  const cfg = STATUS_CFG[s];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize"
      style={{ background: cfg.bg, color: cfg.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {s}
    </span>
  );
}

/* ── Icons ────────────────────────────────────────────────────── */
const IcStudents = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);
const IcLecturer = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const IcPending = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IcTotal = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IcApproved = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IcRejected = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IcArrow = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

/* ── Quick-action card ────────────────────────────────────────── */
function QuickAction({
  label, desc, href, bg, text,
}: { label: string; desc: string; href: string; bg: string; text: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-4 rounded-xl border bg-white transition-all hover:shadow-md"
      style={{ borderColor: "#e2e8f0" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1a3262"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#e2e8f0"; }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: bg }}>
        <span style={{ color: text, fontSize: 18 }}>→</span>
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold" style={{ color: "#1a3262" }}>{label}</div>
        <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{desc}</div>
      </div>
      <span className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#1a3262" }}>
        <IcArrow />
      </span>
    </Link>
  );
}

/* ── Skeleton loader ──────────────────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-lg ${className ?? ""}`}
      style={{ background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* PAGE                                                           */
/* ══════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/registrations").then((r) => r.json()),
    ]).then(([s, regs]) => {
      setStats(s);
      setRecent(Array.isArray(regs) ? regs.slice(0, 6) : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  /* Date string */
  const dateStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1400px]">

      {/* ── Welcome banner ── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0e1f45 0%, #1a3262 50%, #1e3d72 100%)",
          minHeight: 160,
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-10"
          style={{ background: "#e8a020" }} />
        <div className="absolute -bottom-12 right-32 w-32 h-32 rounded-full opacity-10"
          style={{ background: "#e8a020" }} />
        <div className="absolute top-4 right-16 w-2 h-2 rounded-full opacity-40"
          style={{ background: "#e8a020" }} />
        <div className="absolute bottom-8 right-52 w-1.5 h-1.5 rounded-full opacity-30"
          style={{ background: "#e8a020" }} />

        <div className="relative z-10 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border"
                style={{ background: "rgba(232,160,32,0.15)", borderColor: "rgba(232,160,32,0.35)", color: "#e8a020" }}
              >
                Super Administrator
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
              Welcome back to management panel, EduMind!
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{dateStr}</p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            {stats?.pending != null && stats.pending > 0 && (
              <Link
                href="/admin/registrations"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{ background: "#e8a020", color: "#0e1f45" }}
              >
                {stats.pending} Pending Request{stats.pending !== 1 ? "s" : ""}
                <IcArrow />
              </Link>
            )}
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              EduMind Admin Panel · v1.0
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "#94a3b8" }}>
          Platform Overview
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border p-5 space-y-3" style={{ borderColor: "#e2e8f0" }}>
                <Skeleton className="w-11 h-11" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard label="Total Members" value={stats?.total ?? 0} accent="#1a3262" icon={<IcTotal />} delay={0} sub="All" />
            <StatCard label="Students" value={stats?.students ?? 0} accent="#2563eb" icon={<IcStudents />} delay={80} sub="Approved" />
            <StatCard label="Lecturers" value={stats?.lecturers ?? 0} accent="#7c3aed" icon={<IcLecturer />} delay={160} sub="Approved" />
            <StatCard label="Pending" value={stats?.pending ?? 0} accent="#e8a020" icon={<IcPending />} delay={240} sub="Awaiting" />
            <StatCard label="Approved" value={stats?.approved ?? 0} accent="#059669" icon={<IcApproved />} delay={320} sub="Active" />
            <StatCard label="Rejected" value={stats?.rejected ?? 0} accent="#dc2626" icon={<IcRejected />} delay={400} sub="Declined" />
          </div>
        )}
      </div>

      {/* ── Bottom grid: recent requests + quick actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent registrations */}
        <div className="lg:col-span-2 bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#f1f5f9" }}>
            <div>
              <h3 className="font-black text-sm" style={{ color: "#1a3262" }}>Recent Registration Requests</h3>
              <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>Latest 6 submissions</p>
            </div>
            <Link
              href="/admin/registrations"
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
              style={{ background: "rgba(26,50,98,0.07)", color: "#1a3262" }}
            >
              View All <IcArrow />
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="font-semibold text-sm" style={{ color: "#94a3b8" }}>No registrations yet</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#f8fafc" }}>
              {recent.map((reg) => {
                const initials = reg.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                const roleColor = reg.role === "student" ? "#2563eb" : "#7c3aed";
                return (
                  <div key={reg._id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-[#fafbfc] transition-colors">
                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                      style={{ background: `${roleColor}15`, color: roleColor }}
                    >
                      {initials}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate" style={{ color: "#1e293b" }}>{reg.name}</div>
                      <div className="text-xs truncate" style={{ color: "#94a3b8" }}>{reg.email}</div>
                    </div>
                    {/* Role pill */}
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0"
                      style={{ background: `${roleColor}12`, color: roleColor }}
                    >
                      {reg.role}
                    </span>
                    {/* Status */}
                    <StatusPill s={reg.status} />
                    {/* Time */}
                    <span className="text-[10px] shrink-0 hidden sm:block" style={{ color: "#cbd5e1" }}>
                      {new Date(reg.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "#f1f5f9" }}>
              <h3 className="font-black text-sm" style={{ color: "#1a3262" }}>Quick Actions</h3>
              <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>Jump to key sections</p>
            </div>
            <div className="p-4 space-y-2">
              <QuickAction href="/admin/registrations" label="Review Requests"
                desc="Approve or reject pending registrations"
                bg="rgba(232,160,32,0.12)" text="#b45309" />
              <QuickAction href="/admin/students" label="Manage Students"
                desc="View and manage student accounts"
                bg="rgba(37,99,235,0.10)" text="#2563eb" />
              <QuickAction href="/admin/lecturers" label="Manage Lecturers"
                desc="View and manage lecturer profiles"
                bg="rgba(124,58,237,0.10)" text="#7c3aed" />
              <QuickAction href="/admin/courses" label="Courses"
                desc="Organise and manage courses"
                bg="rgba(5,150,105,0.10)" text="#059669" />
              <QuickAction href="/admin/notifications" label="Notifications"
                desc="Send announcements to users"
                bg="rgba(220,38,38,0.08)" text="#dc2626" />
            </div>
          </div>

          {/* System info card */}
          <div
            className="rounded-2xl p-5 border"
            style={{ background: "linear-gradient(135deg, #1a3262, #0e1f45)", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>System Status</span>
            </div>
            <div className="space-y-2">
              {[
                { label: "Database", ok: true },
                { label: "Auth Service", ok: true },
                { label: "Email Server", ok: true },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: ok ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)", color: ok ? "#4ade80" : "#f87171" }}>
                    {ok ? "Online" : "Offline"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </div>
  );
}
