"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Status = "pending" | "approved" | "rejected";
type Role   = "student" | "lecturer";

interface Registration {
  _id:          string;
  role:         Role;
  name:         string;
  email:        string;
  contact:      string;
  status:       Status;
  semester?:    string;
  gender?:      string;
  age?:         number;
  position?:    string;
  createdAt:    string;
}

const STATUS_CFG: Record<Status, { bg: string; text: string; dot: string; label: string }> = {
  pending:  { bg: "rgba(232,160,32,0.12)", text: "#b45309", dot: "#e8a020",  label: "Pending"  },
  approved: { bg: "rgba(5,150,105,0.12)", text: "#065f46",  dot: "#059669",  label: "Approved" },
  rejected: { bg: "rgba(220,38,38,0.10)", text: "#991b1b",  dot: "#dc2626",  label: "Rejected" },
};

const ROLE_CFG: Record<Role, { bg: string; text: string }> = {
  student:  { bg: "rgba(37,99,235,0.10)",   text: "#2563eb" },
  lecturer: { bg: "rgba(124,58,237,0.10)",  text: "#7c3aed" },
};

function StatusBadge({ s }: { s: Status }) {
  const c = STATUS_CFG[s];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize"
      style={{ background: c.bg, color: c.text }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

function DetailItem({ label, value }: { label: string; value?: string | number }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: "#1e293b" }}>{value}</span>
    </div>
  );
}

export default function RegistrationsPage() {
  const router = useRouter();
  const [records,      setRecords     ] = useState<Registration[]>([]);
  const [loading,      setLoading     ] = useState(true);
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterRole,   setFilterRole  ] = useState<Role   | "all">("all");
  const [actionId,     setActionId    ] = useState<string | null>(null);
  const [expanded,     setExpanded    ] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/registrations");
    if (res.status === 403) { router.push("/login"); return; }
    setRecords(await res.json());
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAction(id: string, status: "approved" | "rejected") {
    setActionId(id);
    await fetch(`/api/admin/registrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await fetchData();
    setActionId(null);
  }

  const filtered = records.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (filterRole   !== "all" && r.role   !== filterRole)   return false;
    return true;
  });

  const counts = {
    all:      records.length,
    pending:  records.filter((r) => r.status === "pending").length,
    approved: records.filter((r) => r.status === "approved").length,
    rejected: records.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black" style={{ color: "#1a3262" }}>Registration Requests</h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
            Review and manage incoming student and lecturer registrations.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 border"
          style={{ borderColor: "#e2e8f0", color: "#1a3262", background: "white" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Stat tiles ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["all", "pending", "approved", "rejected"] as const).map((s) => {
          const active = filterStatus === s;
          const cfg = s !== "all" ? STATUS_CFG[s] : null;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="text-left p-4 rounded-2xl border-2 transition-all hover:shadow-sm"
              style={{
                background:  active ? "#1a3262"  : "white",
                borderColor: active ? "#1a3262"  : cfg ? cfg.dot : "#e2e8f0",
              }}
            >
              <div className="text-2xl font-black mb-0.5"
                style={{ color: active ? "#e8a020" : cfg?.text ?? "#1a3262" }}>
                {counts[s]}
              </div>
              <div className="text-xs font-semibold capitalize"
                style={{ color: active ? "rgba(255,255,255,0.55)" : "#94a3b8" }}>
                {s === "all" ? "All Requests" : `${s}`}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Role filter ── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Role:</span>
        {(["all", "student", "lecturer"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setFilterRole(r)}
            className="text-xs font-bold px-3.5 py-1.5 rounded-full capitalize transition-all border"
            style={
              filterRole === r
                ? { background: "#1a3262", color: "#e8a020", borderColor: "#1a3262" }
                : { background: "white",   color: "#64748b",  borderColor: "#e2e8f0" }
            }
          >
            {r === "all" ? "All Roles" : r === "student" ? "Students" : "Lecturers"}
          </button>
        ))}
        <span className="ml-auto text-xs" style={{ color: "#94a3b8" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Records ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" style={{ color: "#1a3262" }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border" style={{ borderColor: "#e2e8f0" }}>
          <div className="text-5xl mb-4">📭</div>
          <p className="font-bold" style={{ color: "#64748b" }}>No registrations match the current filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((reg) => {
            const initials = reg.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
            const rcfg     = ROLE_CFG[reg.role];
            const isExpanded = expanded === reg._id;
            const busy = actionId === reg._id;

            return (
              <div
                key={reg._id}
                className="bg-white rounded-2xl border overflow-hidden transition-shadow hover:shadow-md"
                style={{ borderColor: "#e2e8f0" }}
              >
                {/* Row */}
                <div className="flex items-center gap-4 p-4 sm:p-5">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                    style={{ background: `${rcfg.text}15`, color: rcfg.text }}
                  >
                    {initials}
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate" style={{ color: "#1a3262" }}>{reg.name}</div>
                    <div className="text-xs truncate" style={{ color: "#94a3b8" }}>{reg.email}</div>
                  </div>

                  {/* Role */}
                  <span className="hidden sm:inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full capitalize"
                    style={{ background: rcfg.bg, color: rcfg.text }}>
                    {reg.role}
                  </span>

                  {/* Status */}
                  <StatusBadge s={reg.status} />

                  {/* Date */}
                  <span className="text-xs shrink-0 hidden md:block" style={{ color: "#cbd5e1" }}>
                    {new Date(reg.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>

                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : reg._id)}
                    className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: "#f8fafc", color: "#94a3b8" }}
                  >
                    <svg className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t px-5 py-4" style={{ borderColor: "#f1f5f9", background: "#fafbfc" }}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                      <DetailItem label="Contact"  value={reg.contact} />
                      {reg.role === "student" ? (
                        <>
                          <DetailItem label="Semester" value={reg.semester} />
                          <DetailItem label="Gender"   value={reg.gender} />
                          <DetailItem label="Age"      value={reg.age} />
                        </>
                      ) : (
                        <DetailItem label="Position" value={reg.position} />
                      )}
                    </div>

                    {reg.status === "pending" && (
                      <div className="flex gap-2 pt-2 border-t" style={{ borderColor: "#e2e8f0" }}>
                        <button
                          onClick={() => handleAction(reg._id, "approved")}
                          disabled={busy}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50"
                          style={{ background: "rgba(5,150,105,0.12)", color: "#065f46" }}
                        >
                          {busy
                            ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          }
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(reg._id, "rejected")}
                          disabled={busy}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50"
                          style={{ background: "rgba(220,38,38,0.08)", color: "#991b1b" }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
