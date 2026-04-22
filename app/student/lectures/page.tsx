"use client";

import { useContext, useEffect, useState } from "react";
import { CourseContext } from "../course-context";

interface Lecturer {
  id:       string;
  name:     string;
  email:    string;
  position: string | null;
  contact:  string | null;
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

const ACCENT = "#7c3aed";

function LecturerCard({ lecturer }: { lecturer: Lecturer }) {
  return (
    <div
      className="bg-white rounded-2xl border p-6 flex flex-col sm:flex-row items-start gap-5 transition-all hover:shadow-md"
      style={{ borderColor: "#e2e8f0" }}
    >
      {/* Avatar */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black shrink-0"
        style={{ background: `${ACCENT}15`, color: ACCENT }}
      >
        {initials(lecturer.name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-base font-black" style={{ color: "#1a3262" }}>{lecturer.name}</div>
        {lecturer.position && (
          <div className="text-xs font-semibold mt-0.5" style={{ color: ACCENT }}>{lecturer.position}</div>
        )}

        <div className="mt-3 space-y-1.5">
          <a
            href={`mailto:${lecturer.email}`}
            className="flex items-center gap-2 text-sm group"
            style={{ color: "#64748b" }}
          >
            <span className="shrink-0" style={{ color: "#94a3b8" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <span className="truncate group-hover:underline">{lecturer.email}</span>
          </a>

          {lecturer.contact && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "#64748b" }}>
              <span className="shrink-0" style={{ color: "#94a3b8" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              <span>{lecturer.contact}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: `${ACCENT}12` }}
      >
        <svg className="w-8 h-8" fill="none" stroke={ACCENT} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <p className="font-semibold text-sm" style={{ color: "#94a3b8" }}>{message}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border p-6 flex gap-5 animate-pulse" style={{ borderColor: "#e2e8f0" }}>
      <div className="w-14 h-14 rounded-2xl shrink-0" style={{ background: "#f1f5f9" }} />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 w-40 rounded-full" style={{ background: "#e2e8f0" }} />
        <div className="h-3 w-24 rounded-full" style={{ background: "#f1f5f9" }} />
        <div className="h-3 w-56 rounded-full mt-4" style={{ background: "#f1f5f9" }} />
        <div className="h-3 w-32 rounded-full" style={{ background: "#f1f5f9" }} />
      </div>
    </div>
  );
}

export default function LecturesPage() {
  const { selectedCourse } = useContext(CourseContext);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCourse) {
      setLecturers([]);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/student/courses/${selectedCourse.id}/lecturers`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load lecturers");
        return res.json();
      })
      .then((data) => setLecturers(Array.isArray(data) ? data : []))
      .catch(() => setError("Could not load lecturers. Please try again."))
      .finally(() => setLoading(false));
  }, [selectedCourse?.id]);

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1400px]">

      {/* Banner */}
      <section
        className="relative rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0e1f45 0%, #1a3262 50%, #1e3d72 100%)", minHeight: 140 }}
      >
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-10" style={{ background: "#e8a020" }} />
        <div className="absolute -bottom-12 right-32 w-32 h-32 rounded-full opacity-10" style={{ background: "#e8a020" }} />
        <div className="relative z-10 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span
              className="inline-flex text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border mb-2"
              style={{ background: "rgba(124,58,237,0.2)", borderColor: "rgba(124,58,237,0.4)", color: "#c4b5fd" }}
            >
              Lectures
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
              {selectedCourse ? `${selectedCourse.code} — Lecturers` : "Lecturers"}
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              {selectedCourse ? selectedCourse.name : "Select a course to see its lecturers."}
            </p>
          </div>
          {selectedCourse && !loading && lecturers.length > 0 && (
            <div
              className="rounded-2xl border px-5 py-4"
              style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" }}
            >
              <div className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                Assigned
              </div>
              <div className="text-2xl font-black text-white">{lecturers.length}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                lecturer{lecturers.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      {!selectedCourse ? (
        <EmptyState message="No course selected. Use the dropdown in the header to choose a course." />
      ) : error ? (
        <div
          className="rounded-2xl border p-6 text-sm font-semibold text-center"
          style={{ borderColor: "#fecaca", background: "#fef2f2", color: "#b91c1c" }}
        >
          {error}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : lecturers.length === 0 ? (
        <EmptyState message="No lecturers are assigned to this course yet." />
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
            {lecturers.length} lecturer{lecturers.length !== 1 ? "s" : ""} assigned
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lecturers.map((lecturer) => (
              <LecturerCard key={lecturer.id} lecturer={lecturer} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
