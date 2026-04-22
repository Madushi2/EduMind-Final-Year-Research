"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

/* ─────────────────────────── Types ─────────────────────────── */
interface Lecturer {
  _id:       string;
  name:      string;
  email:     string;
  position?: string;
}

interface Student {
  _id:      string;
  name:     string;
  email:    string;
  semester: string;
}

interface Course {
  _id:       string;
  name:      string;
  code:      string;
  semester:  string;
  credits:   number;
  active:    boolean;
  lecturers: Lecturer[];
  students:  Student[];
  createdAt: string;
}

type ToastType = "success" | "error" | "info";
interface Toast { id: number; type: ToastType; title: string; message: string }

/* ─────────────────────────── Constants ─────────────────────── */
const SEMESTERS = [
  "Year 1 Semester 1", "Year 1 Semester 2",
  "Year 2 Semester 1", "Year 2 Semester 2",
  "Year 3 Semester 1", "Year 3 Semester 2",
  "Year 4 Semester 1", "Year 4 Semester 2",
];

/* ─────────────────────────── Toast system ───────────────────── */
function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl min-w-[300px] max-w-[380px] border animate-slide-in"
          style={{
            background:  t.type === "success" ? "#f0fdf4" : t.type === "error" ? "#fef2f2" : "#eff6ff",
            borderColor: t.type === "success" ? "#bbf7d0" : t.type === "error" ? "#fecaca" : "#bfdbfe",
          }}
        >
          <span
            className="shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black"
            style={{
              background: t.type === "success" ? "#dcfce7" : t.type === "error" ? "#fee2e2" : "#dbeafe",
              color:      t.type === "success" ? "#15803d" : t.type === "error" ? "#b91c1c" : "#1d4ed8",
            }}
          >
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "i"}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold leading-tight"
              style={{ color: t.type === "success" ? "#14532d" : t.type === "error" ? "#7f1d1d" : "#1e3a5f" }}>
              {t.title}
            </div>
            <div className="text-xs mt-0.5 leading-relaxed"
              style={{ color: t.type === "success" ? "#166534" : t.type === "error" ? "#991b1b" : "#1d4ed8" }}>
              {t.message}
            </div>
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black opacity-40 hover:opacity-100 transition-opacity mt-0.5"
            style={{ color: t.type === "success" ? "#14532d" : t.type === "error" ? "#7f1d1d" : "#1e3a5f" }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const push = useCallback((type: ToastType, title: string, message: string) => {
    const id = ++counter.current;
    setToasts((prev) => [...prev.slice(-2), { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, push, dismiss };
}

/* ─────────────────────────── Lecturer multi-select ────────── */
function LecturerSelect({
  lecturers,
  selected,
  onChange,
}: {
  lecturers: Lecturer[];
  selected:  string[];
  onChange:  (ids: string[]) => void;
}) {
  const [open,   setOpen  ] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = lecturers.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }

  const selectedNames = lecturers.filter((l) => selected.includes(l._id)).map((l) => l.name);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all"
        style={{
          borderColor: open ? "#1a3262" : "#e2e8f0",
          background:  "white",
          color:       selected.length ? "#1a3262" : "#94a3b8",
          boxShadow:   open ? "0 0 0 3px rgba(26,50,98,0.1)" : "none",
        }}
      >
        <span className="truncate text-left">
          {selected.length === 0
            ? "Select lecturers…"
            : selected.length === 1
              ? selectedNames[0]
              : `${selected.length} lecturers selected`}
        </span>
        <svg className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-50 w-full mt-1.5 rounded-2xl border shadow-xl overflow-hidden"
          style={{ background: "white", borderColor: "#e2e8f0" }}
        >
          {/* Search */}
          <div className="p-2 border-b" style={{ borderColor: "#f1f5f9" }}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#f8fafc" }}>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ color: "#94a3b8" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lecturers…"
                className="flex-1 text-sm bg-transparent outline-none"
                style={{ color: "#1a3262" }}
              />
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-48">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm" style={{ color: "#94a3b8" }}>
                No approved lecturers found.
              </div>
            ) : (
              filtered.map((l) => {
                const checked  = selected.includes(l._id);
                const initials = l.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <label
                    key={l._id}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors"
                    style={{ background: checked ? "rgba(26,50,98,0.05)" : "white" }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(l._id)}
                      className="shrink-0 w-4 h-4 rounded"
                      style={{ accentColor: "#1a3262" }}
                    />
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                      style={{ background: "rgba(124,58,237,0.12)", color: "#7c3aed" }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: "#1a3262" }}>{l.name}</div>
                      <div className="text-[11px] truncate" style={{ color: "#94a3b8" }}>
                        {l.position ?? l.email}
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>

          {selected.length > 0 && (
            <div
              className="px-3 py-2 border-t flex items-center justify-between"
              style={{ borderColor: "#f1f5f9", background: "#fafbfc" }}
            >
              <span className="text-xs font-semibold" style={{ color: "#64748b" }}>
                {selected.length} selected
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-bold"
                style={{ color: "#dc2626" }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Add Course Modal ───────────────── */
function AddCourseModal({
  lecturers,
  onClose,
  onCreated,
}: {
  lecturers:  Lecturer[];
  onClose:    () => void;
  onCreated:  (course: Course, enrolledCount: number, lecturerCount: number) => void;
}) {
  const [name,           setName          ] = useState("");
  const [code,           setCode          ] = useState("");
  const [semester,       setSemester      ] = useState("");
  const [credits,        setCredits       ] = useState<number | "">("");
  const [selectedLecs,   setSelectedLecs  ] = useState<string[]>([]);
  const [preview,        setPreview       ] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting,     setSubmitting    ] = useState(false);
  const [errors,         setErrors        ] = useState<Record<string, string>>({});

  /* Live student count preview when semester changes */
  useEffect(() => {
    if (!semester) { setPreview(null); return; }
    setPreviewLoading(true);
    fetch(`/api/admin/courses/semester-preview?semester=${encodeURIComponent(semester)}`)
      .then((r) => r.json())
      .then((d) => setPreview(typeof d.count === "number" ? d.count : null))
      .catch(() => setPreview(null))
      .finally(() => setPreviewLoading(false));
  }, [semester]);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())                       e.name     = "Course name is required.";
    if (!code.trim())                       e.code     = "Course code is required.";
    if (!semester)                          e.semester = "Please select a semester.";
    if (!credits || Number(credits) < 1)    e.credits  = "Enter a valid number of credits (minimum 1).";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, code, semester, credits: Number(credits), lecturerIds: selectedLecs }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ form: data.error ?? "Something went wrong. Please try again." });
        return;
      }
      onCreated(data.course, data.enrolledCount, data.lecturerCount);
    } catch {
      setErrors({ form: "Network error. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  const inputBase = "w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden bg-white">

        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: "#f1f5f9" }}
        >
          <div>
            <h2 className="text-lg font-black" style={{ color: "#1a3262" }}>Add New Course</h2>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
              Lecturers are assigned immediately · Students are auto-enrolled by semester.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: "#f1f5f9", color: "#64748b" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable fields */}
        <div className="px-6 pt-5 pb-4 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(85vh - 160px)" }}>

          {/* Global error */}
          {errors.form && (
            <div
              className="flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm"
              style={{ background: "#fef2f2", borderColor: "#fecaca", color: "#991b1b" }}
            >
              <span className="font-bold shrink-0 mt-px">✕</span>
              <span>{errors.form}</span>
            </div>
          )}

          {/* Course Name + Code */}
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: "#64748b" }}>
                Course Name <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                placeholder="e.g. Introduction to Software Engineering"
                className={inputBase}
                style={{ borderColor: errors.name ? "#dc2626" : "#e2e8f0", color: "#1a3262" }}
                onFocus={(e)  => { (e.target as HTMLInputElement).style.borderColor = "#1a3262"; (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(26,50,98,0.1)"; }}
                onBlur={(e)   => { (e.target as HTMLInputElement).style.borderColor = errors.name ? "#dc2626" : "#e2e8f0"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
              />
              {errors.name && <p className="mt-1 text-xs font-medium" style={{ color: "#dc2626" }}>{errors.name}</p>}
            </div>
            <div style={{ width: "130px" }}>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: "#64748b" }}>
                Code <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setErrors((p) => ({ ...p, code: "" })); }}
                placeholder="e.g. CS101"
                className={inputBase}
                style={{ borderColor: errors.code ? "#dc2626" : "#e2e8f0", color: "#1a3262" }}
                onFocus={(e)  => { (e.target as HTMLInputElement).style.borderColor = "#1a3262"; (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(26,50,98,0.1)"; }}
                onBlur={(e)   => { (e.target as HTMLInputElement).style.borderColor = errors.code ? "#dc2626" : "#e2e8f0"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
              />
              {errors.code && <p className="mt-1 text-xs font-medium" style={{ color: "#dc2626" }}>{errors.code}</p>}
            </div>
          </div>

          {/* Semester + Credits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: "#64748b" }}>
                Semester <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <select
                value={semester}
                onChange={(e) => { setSemester(e.target.value); setErrors((p) => ({ ...p, semester: "" })); }}
                className={inputBase}
                style={{ borderColor: errors.semester ? "#dc2626" : "#e2e8f0", color: semester ? "#1a3262" : "#94a3b8", cursor: "pointer" }}
              >
                <option value="">Select…</option>
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.semester && <p className="mt-1 text-xs font-medium" style={{ color: "#dc2626" }}>{errors.semester}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: "#64748b" }}>
                No. of Credits <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={credits}
                onChange={(e) => { setCredits(e.target.value === "" ? "" : Number(e.target.value)); setErrors((p) => ({ ...p, credits: "" })); }}
                placeholder="e.g. 3"
                className={inputBase}
                style={{ borderColor: errors.credits ? "#dc2626" : "#e2e8f0", color: "#1a3262" }}
                onFocus={(e)  => { (e.target as HTMLInputElement).style.borderColor = "#1a3262"; (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(26,50,98,0.1)"; }}
                onBlur={(e)   => { (e.target as HTMLInputElement).style.borderColor = errors.credits ? "#dc2626" : "#e2e8f0"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
              />
              {errors.credits && <p className="mt-1 text-xs font-medium" style={{ color: "#dc2626" }}>{errors.credits}</p>}
            </div>
          </div>

          {/* Student auto-enrol preview */}
          {semester && (
            <div
              className="flex items-start gap-2.5 px-4 py-3 rounded-xl border"
              style={{ background: "rgba(37,99,235,0.04)", borderColor: "rgba(37,99,235,0.18)" }}
            >
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ color: "#3b82f6" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs leading-relaxed" style={{ color: "#1d4ed8" }}>
                {previewLoading ? (
                  "Checking student count…"
                ) : preview === null ? (
                  "Could not fetch student count."
                ) : preview === 0 ? (
                  <>No approved students are currently registered in <strong>{semester}</strong>. They can be enrolled later.</>
                ) : (
                  <><strong>{preview} approved student{preview !== 1 ? "s" : ""}</strong> from <strong>{semester}</strong> will be automatically enrolled when this course is created.</>
                )}
              </p>
            </div>
          )}

          {/* Assign Lecturers */}
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: "#64748b" }}>
              Assign Lecturers
              <span className="ml-1.5 normal-case font-normal" style={{ color: "#94a3b8" }}>(optional)</span>
            </label>
            <LecturerSelect
              lecturers={lecturers}
              selected={selectedLecs}
              onChange={setSelectedLecs}
            />
            {lecturers.length === 0 && (
              <p className="mt-1.5 text-xs" style={{ color: "#94a3b8" }}>
                No approved lecturers available. Approve lecturer registrations first to assign them.
              </p>
            )}
          </div>
        </div>

        {/* Action buttons — always visible outside the scroll area */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: "#f1f5f9" }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all hover:scale-[1.02]"
              style={{ borderColor: "#e2e8f0", color: "#64748b", background: "white" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
              style={{ background: "#1a3262", color: "#e8a020" }}
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating course…
                </>
              ) : (
                "Create Course"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────── Edit Course Modal ──────────────── */
function EditCourseModal({
  course,
  lecturers,
  onClose,
  onUpdated,
}: {
  course:    Course;
  lecturers: Lecturer[];
  onClose:   () => void;
  onUpdated: (updated: Course) => void;
}) {
  const [name,         setName        ] = useState(course.name);
  const [code,         setCode        ] = useState(course.code);
  const [semester,     setSemester    ] = useState(course.semester);
  const [credits,      setCredits     ] = useState<number | "">(course.credits);
  const [selectedLecs, setSelectedLecs] = useState<string[]>(course.lecturers.map((l) => l._id));
  const [submitting,   setSubmitting  ] = useState(false);
  const [errors,       setErrors      ] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())                    e.name     = "Course name is required.";
    if (!code.trim())                    e.code     = "Course code is required.";
    if (!semester)                       e.semester = "Please select a semester.";
    if (!credits || Number(credits) < 1) e.credits  = "Enter a valid number of credits (minimum 1).";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/courses/${course._id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, code, semester, credits: Number(credits), lecturerIds: selectedLecs }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ form: data.error ?? "Something went wrong. Please try again." });
        return;
      }
      onUpdated(data);
    } catch {
      setErrors({ form: "Network error. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  const inputBase = "w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden bg-white">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#f1f5f9" }}>
          <div>
            <h2 className="text-lg font-black" style={{ color: "#1a3262" }}>Edit Course</h2>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
              Changes apply immediately to all enrolled members.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: "#f1f5f9", color: "#64748b" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable fields */}
        <div className="px-6 pt-5 pb-4 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(85vh - 160px)" }}>
          {errors.form && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm"
              style={{ background: "#fef2f2", borderColor: "#fecaca", color: "#991b1b" }}>
              <span className="font-bold shrink-0 mt-px">✕</span>
              <span>{errors.form}</span>
            </div>
          )}

          {/* Name + Code */}
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: "#64748b" }}>
                Course Name <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                placeholder="e.g. Introduction to Software Engineering"
                className={inputBase}
                style={{ borderColor: errors.name ? "#dc2626" : "#e2e8f0", color: "#1a3262" }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#1a3262"; (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(26,50,98,0.1)"; }}
                onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = errors.name ? "#dc2626" : "#e2e8f0"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
              />
              {errors.name && <p className="mt-1 text-xs font-medium" style={{ color: "#dc2626" }}>{errors.name}</p>}
            </div>
            <div style={{ width: "130px" }}>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: "#64748b" }}>
                Code <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setErrors((p) => ({ ...p, code: "" })); }}
                placeholder="e.g. CS101"
                className={inputBase}
                style={{ borderColor: errors.code ? "#dc2626" : "#e2e8f0", color: "#1a3262" }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#1a3262"; (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(26,50,98,0.1)"; }}
                onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = errors.code ? "#dc2626" : "#e2e8f0"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
              />
              {errors.code && <p className="mt-1 text-xs font-medium" style={{ color: "#dc2626" }}>{errors.code}</p>}
            </div>
          </div>

          {/* Semester + Credits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: "#64748b" }}>
                Semester <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <select
                value={semester}
                onChange={(e) => { setSemester(e.target.value); setErrors((p) => ({ ...p, semester: "" })); }}
                className={inputBase}
                style={{ borderColor: errors.semester ? "#dc2626" : "#e2e8f0", color: "#1a3262", cursor: "pointer" }}
              >
                <option value="">Select…</option>
                {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.semester && <p className="mt-1 text-xs font-medium" style={{ color: "#dc2626" }}>{errors.semester}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: "#64748b" }}>
                No. of Credits <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="number" min={1} max={20}
                value={credits}
                onChange={(e) => { setCredits(e.target.value === "" ? "" : Number(e.target.value)); setErrors((p) => ({ ...p, credits: "" })); }}
                placeholder="e.g. 3"
                className={inputBase}
                style={{ borderColor: errors.credits ? "#dc2626" : "#e2e8f0", color: "#1a3262" }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#1a3262"; (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(26,50,98,0.1)"; }}
                onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = errors.credits ? "#dc2626" : "#e2e8f0"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
              />
              {errors.credits && <p className="mt-1 text-xs font-medium" style={{ color: "#dc2626" }}>{errors.credits}</p>}
            </div>
          </div>

          {/* Lecturers */}
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: "#64748b" }}>
              Assign Lecturers
              <span className="ml-1.5 normal-case font-normal" style={{ color: "#94a3b8" }}>(optional)</span>
            </label>
            <LecturerSelect lecturers={lecturers} selected={selectedLecs} onChange={setSelectedLecs} />
          </div>
        </div>

        {/* Actions */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: "#f1f5f9" }}>
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all hover:scale-[1.02]"
              style={{ borderColor: "#e2e8f0", color: "#64748b", background: "white" }}
            >
              Cancel
            </button>
            <button
              type="submit" disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
              style={{ background: "#1a3262", color: "#e8a020" }}
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving…
                </>
              ) : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────── Semester colour helper ─────────── */
const SEM_PALETTE = [
  { bg: "rgba(37,99,235,0.10)",   text: "#2563eb"  },
  { bg: "rgba(5,150,105,0.10)",   text: "#059669"  },
  { bg: "rgba(124,58,237,0.10)",  text: "#7c3aed"  },
  { bg: "rgba(220,38,38,0.10)",   text: "#dc2626"  },
  { bg: "rgba(234,88,12,0.10)",   text: "#ea580c"  },
  { bg: "rgba(6,182,212,0.10)",   text: "#0891b2"  },
  { bg: "rgba(16,185,129,0.10)",  text: "#10b981"  },
  { bg: "rgba(139,92,246,0.10)",  text: "#8b5cf6"  },
];
function semColor(semester: string) {
  const idx = SEMESTERS.indexOf(semester);
  return SEM_PALETTE[(idx >= 0 ? idx : 0) % SEM_PALETTE.length];
}

/* ─────────────────────────── Course Card ────────────────────── */
function CourseCard({
  course,
  onEdit,
  onToggleActive,
}: {
  course:          Course;
  onEdit:          (c: Course) => void;
  onToggleActive:  (c: Course) => void;
}) {
  const [expanded,  setExpanded ] = useState(false);
  const [toggling,  setToggling ] = useState(false);
  const sc = semColor(course.semester);
  const isActive = course.active !== false;

  async function handleToggle() {
    setToggling(true);
    await onToggleActive(course);
    setToggling(false);
  }

  return (
    <div
      className="bg-white rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      style={{ borderColor: isActive ? "#e2e8f0" : "#fecaca", opacity: isActive ? 1 : 0.75 }}
    >
      {/* Coloured top stripe */}
      <div className="h-1" style={{ background: isActive ? `linear-gradient(90deg, #1a3262, #e8a020)` : "#fca5a5" }} />

      <div className="p-5">
        {/* Title row */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(26,50,98,0.08)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ color: "#1a3262" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-[15px] leading-snug" style={{ color: "#1a3262" }}>
              {course.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              {course.code && (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(26,50,98,0.08)", color: "#1a3262" }}>
                  {course.code}
                </span>
              )}
              <div className="text-[11px]" style={{ color: "#94a3b8" }}>
                Added {new Date(course.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>

        {/* Semester + Credits badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{ background: sc.bg, color: sc.text }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {course.semester}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{ background: "rgba(232,160,32,0.12)", color: "#b45309" }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {course.credits} Credit{course.credits !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Lecturer + Student counts */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className="flex items-center gap-2.5 p-2.5 rounded-xl"
            style={{ background: "rgba(124,58,237,0.06)" }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(124,58,237,0.12)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ color: "#7c3aed" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <div className="text-base font-black leading-none" style={{ color: "#7c3aed" }}>
                {course.lecturers.length}
              </div>
              <div className="text-[10px] font-semibold mt-0.5" style={{ color: "#94a3b8" }}>
                Lecturer{course.lecturers.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div
            className="flex items-center gap-2.5 p-2.5 rounded-xl"
            style={{ background: "rgba(37,99,235,0.06)" }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(37,99,235,0.12)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ color: "#2563eb" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div>
              <div className="text-base font-black leading-none" style={{ color: "#2563eb" }}>
                {course.students.length}
              </div>
              <div className="text-[10px] font-semibold mt-0.5" style={{ color: "#94a3b8" }}>
                Student{course.students.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Action row: view members + edit + disable */}
        <div className="flex gap-2">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: "#f8fafc", color: "#64748b" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f1f5f9"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"; }}
          >
            {expanded ? "Hide members" : "View members"}
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

         

          {/* Active toggle switch */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            title={isActive ? "Click to disable course" : "Click to enable course"}
            aria-label={isActive ? "Disable course" : "Enable course"}
            className="flex items-center gap-1.5 px-2.5 rounded-xl transition-all disabled:opacity-50 hover:scale-105"
            style={{
              height: "36px",
              background: isActive ? "rgba(16,185,129,0.08)" : "rgba(156,163,175,0.10)",
            }}
          >
            {/* Track */}
            <div
              className="relative rounded-full transition-colors duration-300 shrink-0"
              style={{
                width: "38px",
                height: "22px",
                background: toggling ? "#d1d5db" : isActive ? "#10b981" : "#9ca3af",
              }}
            >
              {/* Knob */}
              <div
                className="absolute top-[3px] rounded-full bg-white shadow-md transition-all duration-300"
                style={{
                  width: "16px",
                  height: "16px",
                  left: isActive ? "19px" : "3px",
                }}
              />
              {toggling && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
              )}
            </div>
            <span
              className="text-[10px] font-bold shrink-0"
              style={{ color: isActive ? "#059669" : "#6b7280" }}
            >
              {isActive ? "ON" : "OFF"}
            </span>
          </button>


           {/* Edit */}
          <button
            onClick={() => onEdit(course)}
            title="Edit course"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: "rgba(26,50,98,0.07)", color: "#1a3262" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>

        {/* Disabled banner */}
        {!isActive && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: "rgba(220,38,38,0.06)", color: "#b91c1c" }}>
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            This course is currently disabled
          </div>
        )}
      </div>

      {/* Expanded members panel */}
      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-4" style={{ borderColor: "#f1f5f9", background: "#fafbfc" }}>

          {/* Lecturers list */}
          {course.lecturers.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: "#7c3aed" }}>
                Lecturers
              </div>
              <div className="space-y-2">
                {course.lecturers.map((l) => {
                  const initials = l.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <div key={l._id} className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                        style={{ background: "rgba(124,58,237,0.12)", color: "#7c3aed" }}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate" style={{ color: "#1a3262" }}>{l.name}</div>
                        {l.position && (
                          <div className="text-[10px] truncate" style={{ color: "#94a3b8" }}>{l.position}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Students list */}
          {course.students.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: "#2563eb" }}>
                Enrolled Students ({course.students.length})
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {course.students.map((s) => {
                  const initials = s.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <div key={s._id} className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                        style={{ background: "rgba(37,99,235,0.12)", color: "#2563eb" }}
                      >
                        {initials}
                      </div>
                      <div className="text-xs font-semibold truncate" style={{ color: "#1a3262" }}>{s.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {course.lecturers.length === 0 && course.students.length === 0 && (
            <p className="text-xs text-center py-2" style={{ color: "#94a3b8" }}>
              No members assigned to this course yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Page ──────────────────────────── */
export default function CoursesPage() {
  const router = useRouter();
  const { toasts, push, dismiss } = useToast();

  const [courses,     setCourses    ] = useState<Course[]>([]);
  const [lecturers,   setLecturers  ] = useState<Lecturer[]>([]);
  const [loading,     setLoading    ] = useState(true);
  const [showModal,   setShowModal  ] = useState(false);
  const [editCourse,  setEditCourse ] = useState<Course | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses");
      if (res.status === 403) { router.push("/login"); return; }
      if (res.ok) setCourses(await res.json());
      else push("error", "Failed to load courses", "Please refresh the page and try again.");
    } catch {
      push("error", "Connection error", "Unable to reach the server. Check your network and try again.");
    } finally {
      setLoading(false);
    }
  }, [router, push]);

  const fetchLecturers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/courses/lecturers");
      if (res.ok) setLecturers(await res.json());
    } catch { /* silent — not critical */ }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchLecturers();
  }, [fetchCourses, fetchLecturers]);

  function handleCreated(course: Course, enrolledCount: number, lecturerCount: number) {
    setCourses((prev) => [course, ...prev]);
    setShowModal(false);

    const parts: string[] = [];
    if (lecturerCount > 0)
      parts.push(`${lecturerCount} lecturer${lecturerCount !== 1 ? "s" : ""} assigned`);
    if (enrolledCount > 0)
      parts.push(`${enrolledCount} student${enrolledCount !== 1 ? "s" : ""} auto-enrolled`);

    push(
      "success",
      `"${course.name}" created successfully!`,
      parts.length > 0
        ? parts.join(" · ") + "."
        : "The course has been created. Students will be enrolled as their registrations are approved."
    );
  }

  function handleUpdated(updated: Course) {
    setCourses((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    setEditCourse(null);
    push("success", "Course updated", `"${updated.name}" has been saved successfully.`);
  }

  async function handleToggleActive(course: Course) {
    try {
      const res = await fetch(`/api/admin/courses/${course._id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ active: !course.active }),
      });
      const data = await res.json();
      if (!res.ok) { push("error", "Failed to update status", data.error ?? "Please try again."); return; }
      setCourses((prev) => prev.map((c) => (c._id === data._id ? data : c)));
      push(
        "success",
        data.active ? "Course enabled" : "Course disabled",
        `"${data.name}" is now ${data.active ? "active" : "disabled"}.`
      );
    } catch {
      push("error", "Connection error", "Unable to reach the server.");
    }
  }

  /* Summary stats */
  const totalStudents  = courses.reduce((sum, c) => sum + c.students.length, 0);
  const totalLecturers = new Set(courses.flatMap((c) => c.lecturers.map((l) => l._id))).size;

  return (
    <>
      {/* Toast slide-in keyframe */}
      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.22s ease-out; }
      `}</style>

      <ToastContainer toasts={toasts} dismiss={dismiss} />

      {showModal && (
        <AddCourseModal
          lecturers={lecturers}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {editCourse && (
        <EditCourseModal
          course={editCourse}
          lecturers={lecturers}
          onClose={() => setEditCourse(null)}
          onUpdated={handleUpdated}
        />
      )}

      <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black" style={{ color: "#1a3262" }}>Courses</h1>
            <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
              Manage courses, assign lecturers, and track student enrolments.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { fetchCourses(); fetchLecturers(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 border"
              style={{ borderColor: "#e2e8f0", color: "#1a3262", background: "white" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black transition-all hover:scale-105 shadow-sm"
              style={{ background: "#1a3262", color: "#e8a020" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Course
            </button>
          </div>
        </div>

        {/* ── Summary stats ── */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                label: "Total Courses",
                value: courses.length,
                color: "#1a3262",
                bg:    "rgba(26,50,98,0.08)",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
              },
              {
                label: "Students Enrolled",
                value: totalStudents,
                color: "#2563eb",
                bg:    "rgba(37,99,235,0.08)",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                ),
              },
              {
                label: "Active Lecturers",
                value: totalLecturers,
                color: "#7c3aed",
                bg:    "rgba(124,58,237,0.08)",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl border p-5 flex items-center gap-4"
                style={{ borderColor: "#e2e8f0" }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: stat.bg, color: stat.color }}
                >
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-black leading-none" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold mt-1" style={{ color: "#94a3b8" }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Course grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" style={{ color: "#1a3262" }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : courses.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-28 bg-white rounded-2xl border"
            style={{ borderColor: "#e2e8f0" }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(26,50,98,0.06)" }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ color: "#94a3b8" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="font-bold mb-1" style={{ color: "#1a3262" }}>No courses yet</p>
            <p className="text-sm mb-5" style={{ color: "#94a3b8" }}>
              Create your first course and students will be enrolled automatically.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all hover:scale-105 shadow-sm"
              style={{ background: "#1a3262", color: "#e8a020" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onEdit={setEditCourse}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
