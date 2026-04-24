"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { CourseContext } from "../course-context";

interface Lecturer {
  id:       string;
  name:     string;
  email:    string;
  position: string | null;
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

export default function CoursePage() {
  const { selectedCourse } = useContext(CourseContext);
  const [pdfCount, setPdfCount]     = useState<number | null>(null);
  const [lecturers, setLecturers]   = useState<Lecturer[]>([]);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (!selectedCourse) {
      setPdfCount(null);
      setLecturers([]);
      return;
    }

    setLoading(true);

    Promise.all([
      fetch(`/api/student/pdfs?courseId=${selectedCourse.id}`).then((r) => r.ok ? r.json() : []),
      fetch(`/api/student/courses/${selectedCourse.id}/lecturers`).then((r) => r.ok ? r.json() : []),
    ]).then(([pdfs, lecs]) => {
      setPdfCount(Array.isArray(pdfs) ? pdfs.length : 0);
      setLecturers(Array.isArray(lecs) ? lecs : []);
    }).catch(() => {
      setPdfCount(0);
      setLecturers([]);
    }).finally(() => setLoading(false));
  }, [selectedCourse?.id]);

  if (!selectedCourse) {
    return (
      <div className="p-6 lg:p-8 max-w-[1400px]">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(26,50,98,0.08)" }}>
            <svg className="w-8 h-8" fill="none" stroke="#1a3262" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 7v-6.5M3 7l9 5 9-5" />
            </svg>
          </div>
          <h2 className="text-base font-black" style={{ color: "#1a3262" }}>No course selected</h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Use the dropdown in the header to choose a course.</p>
        </div>
      </div>
    );
  }

  const fields = [
    { label: "Course Code", value: selectedCourse.code },
    { label: "Course Name", value: selectedCourse.name },
    { label: "Semester",    value: selectedCourse.semester ?? "—" },
    { label: "Credits",     value: selectedCourse.credits != null ? `${selectedCourse.credits} credit${selectedCourse.credits !== 1 ? "s" : ""}` : "—" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">

      {/* Hero banner */}
      <section
        className="relative rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0e1f45 0%, #1a3262 55%, #1e3d72 100%)", minHeight: 160 }}
      >
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-10" style={{ background: "#e8a020" }} />
        <div className="absolute -bottom-12 right-32 w-32 h-32 rounded-full opacity-10" style={{ background: "#e8a020" }} />
        <div className="relative z-10 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shrink-0"
              style={{ background: "rgba(232,160,32,0.18)", color: "#e8a020" }}
            >
              {selectedCourse.code.slice(0, 3)}
            </div>
            <div>
              <span
                className="inline-flex text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border mb-2"
                style={{ background: "rgba(232,160,32,0.15)", borderColor: "rgba(232,160,32,0.35)", color: "#e8a020" }}
              >
                Enrolled Course
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{selectedCourse.name}</h1>
              <p className="text-sm mt-0.5 font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>{selectedCourse.code}</p>
            </div>
          </div>

          {/* Quick stats + PDF button */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            <Link
              href="/student/course-pdf"
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all"
              style={{ background: "rgba(232,160,32,0.18)", color: "#e8a020", border: "1px solid rgba(232,160,32,0.35)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Course PDFs
            </Link>
            <div className="flex gap-3">
              <div className="rounded-2xl border px-5 py-3 text-center" style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" }}>
                <div className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>PDFs</div>
                <div className="text-2xl font-black text-white">
                  {loading ? "—" : (pdfCount ?? 0)}
                </div>
              </div>
              <div className="rounded-2xl border px-5 py-3 text-center" style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" }}>
                <div className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Lecturers</div>
                <div className="text-2xl font-black text-white">
                  {loading ? "—" : lecturers.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detail grid */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "#94a3b8" }}>Course Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border p-5" style={{ borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "#94a3b8" }}>{label}</div>
              <div className="text-sm font-black" style={{ color: "#1a3262" }}>{value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Lecturers */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "#94a3b8" }}>Lecturers</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="bg-white rounded-2xl border p-5 flex gap-4 animate-pulse" style={{ borderColor: "#e2e8f0" }}>
                <div className="w-12 h-12 rounded-2xl shrink-0" style={{ background: "#f1f5f9" }} />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3.5 w-36 rounded-full" style={{ background: "#e2e8f0" }} />
                  <div className="h-3 w-24 rounded-full" style={{ background: "#f1f5f9" }} />
                  <div className="h-3 w-48 rounded-full" style={{ background: "#f1f5f9" }} />
                </div>
              </div>
            ))}
          </div>
        ) : lecturers.length === 0 ? (
          <div className="bg-white rounded-2xl border px-6 py-10 text-center" style={{ borderColor: "#e2e8f0" }}>
            <p className="text-sm font-semibold" style={{ color: "#94a3b8" }}>No lecturers assigned to this course yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lecturers.map((lec) => (
              <div key={lec.id} className="bg-white rounded-2xl border p-5 flex items-center gap-4 transition-all hover:shadow-md" style={{ borderColor: "#e2e8f0" }}>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black shrink-0"
                  style={{ background: "rgba(124,58,237,0.12)", color: "#7c3aed" }}
                >
                  {initials(lec.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black truncate" style={{ color: "#1a3262" }}>{lec.name}</div>
                  {lec.position && (
                    <div className="text-xs font-semibold mt-0.5" style={{ color: "#7c3aed" }}>{lec.position}</div>
                  )}
                  <a href={`mailto:${lec.email}`} className="text-xs mt-1 truncate block hover:underline" style={{ color: "#64748b" }}>
                    {lec.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}