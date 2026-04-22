"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

interface EnrolledCourse {
  _id:      string;
  name:     string;
  code:     string;
  semester: string;
  credits:  number;
  active:   boolean;
}

interface Student {
  _id:       string;
  name:      string;
  email:     string;
  contact:   string;
  semester:  string;
  gender?:   string;
  age?:      number;
  createdAt: string;
  courses:   EnrolledCourse[];
}

/* ── Semester sort order ─────────────────────────────────────────── */
const SEM_ORDER: Record<string, number> = {
  "Year 1 Semester 1": 1, "Year 1 Semester 2": 2,
  "Year 2 Semester 1": 3, "Year 2 Semester 2": 4,
  "Year 3 Semester 1": 5, "Year 3 Semester 2": 6,
  "Year 4 Semester 1": 7, "Year 4 Semester 2": 8,
};

/* ── Helpers ─────────────────────────────────────────────────────── */
function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function semBadgeColor(sem: string) {
  const idx = SEM_ORDER[sem] ?? 0;
  const palette = [
    "#2563eb","#0891b2","#059669","#65a30d",
    "#ca8a04","#d97706","#ea580c","#dc2626",
  ];
  return palette[(idx - 1) % palette.length] ?? "#64748b";
}

/* ── Course pill ─────────────────────────────────────────────────── */
function CoursePill({ c }: { c: EnrolledCourse }) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all hover:shadow-sm"
      style={{
        background:   c.active ? "white" : "#f8fafc",
        borderColor:  c.active ? "#dbeafe" : "#e2e8f0",
        opacity:      c.active ? 1 : 0.65,
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Course icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(37,99,235,0.1)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="#2563eb" viewBox="0 0 24 24">
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

/* ── Student row ─────────────────────────────────────────────────── */
function StudentRow({ student, expanded, onToggle }: {
  student:  Student;
  expanded: boolean;
  onToggle: () => void;
}) {
  const color     = semBadgeColor(student.semester);
  const totalCred = student.courses.reduce((s, c) => s + c.credits, 0);

  return (
    <div
      className="bg-white rounded-2xl border overflow-hidden transition-shadow"
      style={{ borderColor: expanded ? "#bfdbfe" : "#e2e8f0", boxShadow: expanded ? "0 0 0 2px #dbeafe" : undefined }}
    >
      {/* ── Main row ── */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-slate-50 transition-colors"
      >
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black shrink-0"
          style={{ background: `${color}18`, color }}
        >
          {initials(student.name)}
        </div>

        {/* Name / email */}
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate" style={{ color: "#1a3262" }}>{student.name}</div>
          <div className="text-xs truncate" style={{ color: "#94a3b8" }}>{student.email}</div>
        </div>

        {/* Semester badge */}
        <span
          className="hidden sm:inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0"
          style={{ background: `${color}15`, color }}
        >
          {student.semester}
        </span>

        {/* Course count pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{ background: student.courses.length > 0 ? "rgba(37,99,235,0.1)" : "#f1f5f9", color: student.courses.length > 0 ? "#2563eb" : "#94a3b8" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {student.courses.length} course{student.courses.length !== 1 ? "s" : ""}
          </div>

          {student.courses.length > 0 && (
            <span className="text-[11px] hidden md:block" style={{ color: "#cbd5e1" }}>
              {totalCred} cr total
            </span>
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
        <div className="border-t" style={{ borderColor: "#f1f5f9", background: "#f8fbff" }}>
          {/* Profile details strip */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 px-5 pt-4 pb-3 border-b" style={{ borderColor: "#e9f0fb" }}>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "#94a3b8" }}>Contact</div>
              <div className="text-sm font-semibold" style={{ color: "#334155" }}>{student.contact}</div>
            </div>
            {student.gender && (
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "#94a3b8" }}>Gender</div>
                <div className="text-sm font-semibold capitalize" style={{ color: "#334155" }}>{student.gender}</div>
              </div>
            )}
            {student.age && (
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "#94a3b8" }}>Age</div>
                <div className="text-sm font-semibold" style={{ color: "#334155" }}>{student.age}</div>
              </div>
            )}
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "#94a3b8" }}>Joined</div>
              <div className="text-sm font-semibold" style={{ color: "#334155" }}>
                {new Date(student.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* Enrolled courses */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4" fill="none" stroke="#2563eb" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#2563eb" }}>
                Enrolled Courses
              </span>
              {student.courses.length > 0 && (
                <span className="ml-auto text-xs font-bold" style={{ color: "#94a3b8" }}>
                  {totalCred} total credits
                </span>
              )}
            </div>

            {student.courses.length === 0 ? (
              <div className="flex flex-col items-center py-6 rounded-xl border border-dashed" style={{ borderColor: "#dbeafe", color: "#94a3b8" }}>
                <svg className="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-xs font-semibold">No courses enrolled yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {student.courses.map((c) => <CoursePill key={c._id} c={c} />)}
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
export default function StudentsPage() {
  const router = useRouter();
  const [students,  setStudents ] = useState<Student[]>([]);
  const [loading,   setLoading  ] = useState(true);
  const [search,    setSearch   ] = useState("");
  const [semFilter, setSemFilter] = useState<string>("all");
  const [expanded,  setExpanded ] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/students");
    if (res.status === 403) { router.push("/login"); return; }
    setStudents(await res.json());
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* Unique semester list for filter */
  const semesters = useMemo(() => {
    const s = [...new Set(students.map((s) => s.semester).filter(Boolean))];
    return s.sort((a, b) => (SEM_ORDER[a] ?? 99) - (SEM_ORDER[b] ?? 99));
  }, [students]);

  /* Filtered list */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter((s) => {
      if (semFilter !== "all" && s.semester !== semFilter) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [students, search, semFilter]);

  /* Stats */
  const totalCourses   = students.reduce((s, st) => s + st.courses.length, 0);
  const enrolled       = students.filter((s) => s.courses.length > 0).length;
  const avgCourses     = students.length ? (totalCourses / students.length).toFixed(1) : "0";

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-350">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black" style={{ color: "#1a3262" }}>Students</h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
            All approved student accounts with their enrolled courses.
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
          { label: "Total Students",    value: students.length,   icon: "👨‍🎓", color: "#2563eb" },
          { label: "Enrolled in Courses", value: enrolled,         icon: "", color: "#059669" },
          { label: "Not Yet Enrolled",  value: students.length - enrolled, icon: "", color: "#e8a020" },
          { label: "Avg Courses / Student", value: avgCourses,    icon: "", color: "#7c3aed" },
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

      {/* ── Filters row ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2 border flex-1"
          style={{ background: "white", borderColor: "#e2e8f0" }}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#94a3b8" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
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

        {/* Semester filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setSemFilter("all")}
            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all border"
            style={semFilter === "all"
              ? { background: "#1a3262", color: "#e8a020", borderColor: "#1a3262" }
              : { background: "white",   color: "#64748b",  borderColor: "#e2e8f0" }}
          >
            All Semesters
          </button>
          {semesters.map((sem) => {
            const color = semBadgeColor(sem);
            return (
              <button
                key={sem}
                onClick={() => setSemFilter(sem)}
                className="text-xs font-bold px-3 py-1.5 rounded-full transition-all border whitespace-nowrap"
                style={semFilter === sem
                  ? { background: color, color: "white", borderColor: color }
                  : { background: "white", color: "#64748b", borderColor: "#e2e8f0" }}
              >
                {sem}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result count */}
      <div className="text-xs font-semibold" style={{ color: "#94a3b8" }}>
        {filtered.length} student{filtered.length !== 1 ? "s" : ""}
        {(search || semFilter !== "all") ? " matching filters" : " total"}
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
          <div className="text-5xl mb-4">🎓</div>
          <p className="font-bold" style={{ color: "#64748b" }}>No students match the current filters.</p>
          <button
            onClick={() => { setSearch(""); setSemFilter("all"); }}
            className="mt-3 text-sm font-bold underline"
            style={{ color: "#2563eb" }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <StudentRow
              key={s._id}
              student={s}
              expanded={expanded === s._id}
              onToggle={() => setExpanded(expanded === s._id ? null : s._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
