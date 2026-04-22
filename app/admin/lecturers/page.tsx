"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

interface AssignedCourse {
  _id:          string;
  name:         string;
  code:         string;
  semester:     string;
  credits:      number;
  active:       boolean;
  studentCount: number;
}

interface Lecturer {
  _id:       string;
  name:      string;
  email:     string;
  contact:   string;
  position?: string;
  createdAt: string;
  courses:   AssignedCourse[];
}

/* ── Helpers ─────────────────────────────────────────────────────── */
function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

/* ── Course pill ─────────────────────────────────────────────────── */
function CoursePill({ c }: { c: AssignedCourse }) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all hover:shadow-sm"
      style={{
        background:  c.active ? "white" : "#f8fafc",
        borderColor: c.active ? "#ede9fe" : "#e2e8f0",
        opacity:     c.active ? 1 : 0.65,
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Course icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(124,58,237,0.1)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="#7c3aed" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold truncate" style={{ color: "#1e293b" }}>{c.name}</div>
          <div className="text-[11px]" style={{ color: "#94a3b8" }}>{c.code} · {c.semester}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Student count */}
        <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(124,58,237,0.08)", color: "#7c3aed" }}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          {c.studentCount}
        </div>
        {/* Credits */}
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(37,99,235,0.08)", color: "#2563eb" }}>
          {c.credits} cr
        </span>
        {!c.active && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(100,116,139,0.1)", color: "#64748b" }}>
            Inactive
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Lecturer row ────────────────────────────────────────────────── */
function LecturerRow({ lecturer, expanded, onToggle }: {
  lecturer: Lecturer;
  expanded: boolean;
  onToggle: () => void;
}) {
  const totalStudents = lecturer.courses.reduce((s, c) => s + c.studentCount, 0);
  const activeCourses = lecturer.courses.filter((c) => c.active).length;

  return (
    <div
      className="bg-white rounded-2xl border overflow-hidden transition-shadow"
      style={{ borderColor: expanded ? "#c4b5fd" : "#e2e8f0", boxShadow: expanded ? "0 0 0 2px #ede9fe" : undefined }}
    >
      {/* ── Main row ── */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-slate-50 transition-colors"
      >
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black shrink-0"
          style={{ background: "rgba(124,58,237,0.12)", color: "#7c3aed" }}
        >
          {initials(lecturer.name)}
        </div>

        {/* Name / email */}
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate" style={{ color: "#1a3262" }}>{lecturer.name}</div>
          <div className="text-xs truncate" style={{ color: "#94a3b8" }}>{lecturer.email}</div>
        </div>

        {/* Position badge */}
        {lecturer.position && (
          <span className="hidden sm:inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0"
            style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}>
            {lecturer.position}
          </span>
        )}

        {/* Course count + student count */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{ background: lecturer.courses.length > 0 ? "rgba(124,58,237,0.1)" : "#f1f5f9", color: lecturer.courses.length > 0 ? "#7c3aed" : "#94a3b8" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {lecturer.courses.length} course{lecturer.courses.length !== 1 ? "s" : ""}
          </div>

          {totalStudents > 0 && (
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{ background: "rgba(37,99,235,0.08)", color: "#2563eb" }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              {totalStudents} student{totalStudents !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Chevron */}
        <span
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: "#f8fafc", color: "#94a3b8" }}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* ── Expanded panel ── */}
      {expanded && (
        <div className="border-t" style={{ borderColor: "#f1f5f9", background: "#fdf8ff" }}>
          {/* Profile details strip */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 px-5 pt-4 pb-3 border-b" style={{ borderColor: "#f3eeff" }}>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "#94a3b8" }}>Contact</div>
              <div className="text-sm font-semibold" style={{ color: "#334155" }}>{lecturer.contact}</div>
            </div>
            {lecturer.position && (
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "#94a3b8" }}>Position</div>
                <div className="text-sm font-semibold" style={{ color: "#334155" }}>{lecturer.position}</div>
              </div>
            )}
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "#94a3b8" }}>Joined</div>
              <div className="text-sm font-semibold" style={{ color: "#334155" }}>
                {new Date(lecturer.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            </div>
            {lecturer.courses.length > 0 && (
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "#94a3b8" }}>Active Courses</div>
                <div className="text-sm font-semibold" style={{ color: activeCourses > 0 ? "#059669" : "#94a3b8" }}>
                  {activeCourses} / {lecturer.courses.length}
                </div>
              </div>
            )}
            {totalStudents > 0 && (
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "#94a3b8" }}>Total Students</div>
                <div className="text-sm font-semibold" style={{ color: "#2563eb" }}>{totalStudents}</div>
              </div>
            )}
          </div>

          {/* Assigned courses */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4" fill="none" stroke="#7c3aed" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#7c3aed" }}>
                Assigned Courses
              </span>
              {totalStudents > 0 && (
                <span className="ml-auto text-xs font-bold" style={{ color: "#94a3b8" }}>
                  {totalStudents} students across {lecturer.courses.length} courses
                </span>
              )}
            </div>

            {lecturer.courses.length === 0 ? (
              <div className="flex flex-col items-center py-6 rounded-xl border border-dashed" style={{ borderColor: "#ede9fe", color: "#94a3b8" }}>
                <svg className="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-xs font-semibold">No courses assigned yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {lecturer.courses.map((c) => <CoursePill key={c._id} c={c} />)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/* PAGE                                                               */
/* ══════════════════════════════════════════════════════════════════ */
export default function LecturersPage() {
  const router = useRouter();
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading,   setLoading  ] = useState(true);
  const [search,    setSearch   ] = useState("");
  const [expanded,  setExpanded ] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/lecturers");
    if (res.status === 403) { router.push("/login"); return; }
    setLecturers(await res.json());
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* Filtered list */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return lecturers;
    return lecturers.filter((l) =>
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      (l.position ?? "").toLowerCase().includes(q)
    );
  }, [lecturers, search]);

  /* Stats */
  const withCourses    = lecturers.filter((l) => l.courses.length > 0).length;
  const totalAssigned  = lecturers.reduce((s, l) => s + l.courses.length, 0);
  const avgLoad        = lecturers.length ? (totalAssigned / lecturers.length).toFixed(1) : "0";
  const totalStudents  = lecturers.reduce((s, l) => l.courses.reduce((c, course) => c + course.studentCount, s), 0);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-350">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black" style={{ color: "#1a3262" }}>Lecturers</h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
            All approved lecturer profiles with their assigned courses.
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

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Lecturers",      value: lecturers.length, icon: "", color: "#7c3aed" },
          { label: "Teaching Courses",     value: withCourses,      icon: "", color: "#059669" },
          { label: "Avg Course Load",      value: avgLoad,          icon: "", color: "#e8a020" },
          { label: "Total Students Taught",value: totalStudents,    icon: "🎓", color: "#2563eb" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border p-4" style={{ borderColor: "#e2e8f0" }}>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xl">{s.icon}</span>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            </div>
            <div className="text-[18px] font-semibold" style={{ color: "#94a3b8" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2 border"
        style={{ background: "white", borderColor: "#e2e8f0", maxWidth: 480 }}
      >
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#94a3b8" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or position…"
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: "#1e293b" }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ color: "#94a3b8" }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Result count */}
      <div className="text-xs font-semibold" style={{ color: "#94a3b8" }}>
        {filtered.length} lecturer{filtered.length !== 1 ? "s" : ""}
        {search ? " matching search" : " total"}
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" style={{ color: "#1a3262" }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border" style={{ borderColor: "#e2e8f0" }}>
          <div className="text-5xl mb-4">👨‍🏫</div>
          <p className="font-bold" style={{ color: "#64748b" }}>No lecturers match the search.</p>
          <button
            onClick={() => setSearch("")}
            className="mt-3 text-sm font-bold underline"
            style={{ color: "#7c3aed" }}
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((l) => (
            <LecturerRow
              key={l._id}
              lecturer={l}
              expanded={expanded === l._id}
              onToggle={() => setExpanded(expanded === l._id ? null : l._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
