"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CourseContext } from "../course-context";

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

const SEM_ORDER: Record<string, number> = {
  "Year 1 Semester 1": 1, "Year 1 Semester 2": 2,
  "Year 2 Semester 1": 3, "Year 2 Semester 2": 4,
  "Year 3 Semester 1": 5, "Year 3 Semester 2": 6,
  "Year 4 Semester 1": 7, "Year 4 Semester 2": 8,
};

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2);
}

function semBadgeColor(sem: string) {
  const idx = SEM_ORDER[sem] ?? 0;
  const palette = ["#2563eb", "#0891b2", "#059669", "#65a30d", "#ca8a04", "#d97706", "#ea580c", "#dc2626"];
  return palette[(idx - 1) % palette.length] ?? "#64748b";
}

function CoursePill({ c }: { c: EnrolledCourse }) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all hover:shadow-sm"
      style={{ background: "white", borderColor: "#dbeafe" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(37,99,235,0.1)" }}>
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
      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: "rgba(37,99,235,0.08)", color: "#2563eb" }}>
        {c.credits} cr
      </span>
    </div>
  );
}

function StudentRow({ student, expanded, onToggle }: {
  student:  Student;
  expanded: boolean;
  onToggle: () => void;
}) {
  const color = semBadgeColor(student.semester);
  const totalCred = student.courses.reduce((sum, course) => sum + course.credits, 0);

  return (
    <div
      className="bg-white rounded-2xl border overflow-hidden transition-shadow"
      style={{ borderColor: expanded ? "#bfdbfe" : "#e2e8f0", boxShadow: expanded ? "0 0 0 2px #dbeafe" : undefined }}
    >
      <button onClick={onToggle} className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-slate-50 transition-colors">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black shrink-0" style={{ background: `${color}18`, color }}>
          {initials(student.name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-bold truncate" style={{ color: "#1a3262" }}>{student.name}</div>
          <div className="text-xs truncate" style={{ color: "#94a3b8" }}>{student.email}</div>
        </div>

        <span className="hidden sm:inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0" style={{ background: `${color}15`, color }}>
          {student.semester || "No semester"}
        </span>

        <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0" style={{ background: "rgba(37,99,235,0.1)", color: "#2563eb" }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {totalCred} credits
        </div>

        <span className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ background: "#f8fafc", color: "#94a3b8" }}>
          <svg className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {expanded && (
        <div className="border-t" style={{ borderColor: "#f1f5f9", background: "#f8fbff" }}>
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

          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4" fill="none" stroke="#2563eb" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#2563eb" }}>Selected Course</span>
              <span className="ml-auto text-xs font-bold" style={{ color: "#94a3b8" }}>{totalCred} credits</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {student.courses.map((course) => <CoursePill key={course._id} c={course} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border p-4" style={{ borderColor: "#e2e8f0" }}>
      <div className="flex items-center gap-3 mb-1">
        <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}12`, color }}>
          {icon}
        </span>
        <div className="text-2xl font-black" style={{ color }}>{value}</div>
      </div>
      <div className="text-xs font-semibold" style={{ color: "#94a3b8" }}>{label}</div>
    </div>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

export default function LecturerStudentsPage() {
  const router = useRouter();
  const { selectedCourse } = useContext(CourseContext);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [semFilter, setSemFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const courseId = selectedCourse?.id ?? "";

  const fetchData = useCallback(async () => {
    if (!courseId) {
      setStudents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/lecturer/students?courseId=${encodeURIComponent(courseId)}`);
    if (res.status === 403) {
      router.push("/login");
      return;
    }
    const data = await res.json();
    setStudents(Array.isArray(data.students) ? data.students : []);
    setLoading(false);
  }, [courseId, router]);

  useEffect(() => {
    const timer = setTimeout(() => { void fetchData(); }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const semesters = useMemo(() => {
    const list = [...new Set(students.map((student) => student.semester).filter(Boolean))];
    return list.sort((a, b) => (SEM_ORDER[a] ?? 99) - (SEM_ORDER[b] ?? 99));
  }, [students]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter((student) => {
      if (semFilter !== "all" && student.semester !== semFilter) return false;
      if (q && !student.name.toLowerCase().includes(q) && !student.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [students, search, semFilter]);

  const avgAge = useMemo(() => {
    const ages = students.map((student) => student.age).filter((age): age is number => typeof age === "number");
    return ages.length ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : "N/A";
  }, [students]);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black" style={{ color: "#1a3262" }}>Students</h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
            View approved students enrolled in the selected course.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={!selectedCourse || loading}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 border disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderColor: "#e2e8f0", color: "#1a3262", background: "white" }}
        >
          <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border bg-white p-5" style={{ borderColor: "#e2e8f0" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>Active Course</div>
            <div className="text-lg font-black mt-1" style={{ color: "#1a3262" }}>{selectedCourse?.code ?? "No course selected"}</div>
            <div className="text-sm" style={{ color: "#64748b" }}>{selectedCourse?.name ?? "Use the header dropdown to choose a course."}</div>
          </div>
          {selectedCourse && (
            <div className="flex flex-wrap gap-2">
              {selectedCourse.semester && (
                <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "rgba(37,99,235,0.10)", color: "#2563eb" }}>
                  {selectedCourse.semester}
                </span>
              )}
              {selectedCourse.credits != null && (
                <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "rgba(232,160,32,0.14)", color: "#b45309" }}>
                  {selectedCourse.credits} credits
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Course Students" value={students.length} color="#2563eb" icon={<UsersIcon />} />
        <StatCard label="Filtered Results" value={filtered.length} color="#059669" icon={<SearchIcon />} />
        <StatCard label="Semesters Found" value={semesters.length} color="#e8a020" icon={<UsersIcon />} />
        <StatCard label="Average Age" value={avgAge} color="#7c3aed" icon={<UsersIcon />} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 border flex-1" style={{ background: "white", borderColor: "#e2e8f0" }}>
          <span style={{ color: "#94a3b8" }}><SearchIcon /></span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email..."
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

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setSemFilter("all")}
            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all border"
            style={semFilter === "all"
              ? { background: "#1a3262", color: "#e8a020", borderColor: "#1a3262" }
              : { background: "white", color: "#64748b", borderColor: "#e2e8f0" }}
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

      <div className="text-xs font-semibold" style={{ color: "#94a3b8" }}>
        {filtered.length} student{filtered.length !== 1 ? "s" : ""}
        {(search || semFilter !== "all") ? " matching filters" : selectedCourse ? ` in ${selectedCourse.code}` : ""}
      </div>

      {!selectedCourse ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border text-center px-6" style={{ borderColor: "#e2e8f0" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(26,50,98,0.08)", color: "#1a3262" }}>
            <UsersIcon />
          </div>
          <p className="font-black" style={{ color: "#1a3262" }}>Select a course first</p>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>The list will show students from the course selected in the header.</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" style={{ color: "#1a3262" }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border" style={{ borderColor: "#e2e8f0" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(232,160,32,0.12)", color: "#b45309" }}>
            <UsersIcon />
          </div>
          <p className="font-bold" style={{ color: "#64748b" }}>No students match the current filters.</p>
          {(search || semFilter !== "all") && (
            <button onClick={() => { setSearch(""); setSemFilter("all"); }} className="mt-3 text-sm font-bold underline" style={{ color: "#2563eb" }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((student) => (
            <StudentRow
              key={student._id}
              student={student}
              expanded={expanded === student._id}
              onToggle={() => setExpanded(expanded === student._id ? null : student._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
