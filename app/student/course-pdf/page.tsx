"use client";

import { useContext, useEffect, useState } from "react";
import { CourseContext } from "../course-context";

interface StudentPdf {
  id:          string;
  title:       string;
  description: string;
  specialNote: string;
  fileName:    string;
  size:        number;
  createdAt:   string;
  lecturer:    {
    name:      string;
    email:     string;
    position?: string;
  };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function FileIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function SkeletonRow() {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "#e2e8f0" }}>
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-2xl" style={{ background: "#f1f5f9" }} />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-44 rounded-full" style={{ background: "#e2e8f0" }} />
          <div className="h-3 w-full rounded-full" style={{ background: "#f1f5f9" }} />
          <div className="h-3 w-2/3 rounded-full" style={{ background: "#f1f5f9" }} />
        </div>
      </div>
    </div>
  );
}

export default function CoursePdfPage() {
  const { selectedCourse } = useContext(CourseContext);
  const [pdfs, setPdfs] = useState<StudentPdf[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const courseId = selectedCourse?.id ?? "";

  useEffect(() => {
    if (!courseId) {
      const timer = setTimeout(() => {
        setPdfs([]);
        setLoading(false);
        setError("");
      }, 0);
      return () => clearTimeout(timer);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");
    }, 0);

    fetch(`/api/student/pdfs?courseId=${encodeURIComponent(courseId)}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load PDFs.");
        return res.json();
      })
      .then((data) => setPdfs(Array.isArray(data) ? data : []))
      .catch((err) => {
        if (err.name !== "AbortError") setError("Could not load course PDFs. Please refresh and try again.");
      })
      .finally(() => setLoading(false));

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [courseId]);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-black" style={{ color: "#1a3262" }}>Course PDF</h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
            Download active PDF materials added by your lecturers.
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

      <section className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b" style={{ borderColor: "#f1f5f9" }}>
          <div>
            <h2 className="text-sm font-black" style={{ color: "#1a3262" }}>Available PDFs</h2>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
              {selectedCourse ? `${pdfs.length} active PDF${pdfs.length !== 1 ? "s" : ""} in ${selectedCourse.code}` : "Select a course to view PDFs"}
            </p>
          </div>
        </div>

        {!selectedCourse ? (
          <div className="py-20 px-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(26,50,98,0.08)", color: "#1a3262" }}>
              <FileIcon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black" style={{ color: "#1a3262" }}>No course selected</h3>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Use the header dropdown to choose a course first.</p>
          </div>
        ) : loading ? (
          <div className="p-4 space-y-3">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : error ? (
          <div className="py-20 px-6 text-center">
            <h3 className="text-base font-black" style={{ color: "#991b1b" }}>Unable to load PDFs</h3>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>{error}</p>
          </div>
        ) : pdfs.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(232,160,32,0.12)", color: "#b45309" }}>
              <FileIcon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black" style={{ color: "#1a3262" }}>No PDFs available</h3>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Your lecturers have not added active PDFs for this course yet.</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {pdfs.map((pdf) => (
              <article key={pdf.id} className="rounded-2xl border p-4 transition-all hover:shadow-md" style={{ borderColor: "#e8edf4", background: "#ffffff" }}>
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.10), rgba(232,160,32,0.12))", color: "#2563eb" }}>
                    <FileIcon />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h3 className="text-base font-black truncate" style={{ color: "#1a3262" }}>{pdf.title}</h3>
                      <span className="w-fit text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: "rgba(26,50,98,0.07)", color: "#1a3262" }}>
                        {formatBytes(pdf.size)}
                      </span>
                    </div>

                    {pdf.description ? (
                      <p className="text-sm mt-1.5 leading-relaxed line-clamp-2" style={{ color: "#475569" }}>{pdf.description}</p>
                    ) : (
                      <p className="text-sm mt-1.5 italic" style={{ color: "#cbd5e1" }}>No description added</p>
                    )}

                    {pdf.specialNote && (
                      <div className="mt-3 rounded-xl px-3 py-2 flex items-start gap-2" style={{ background: "rgba(232,160,32,0.10)", color: "#92400e" }}>
                        <span className="mt-0.5 shrink-0"><NoteIcon /></span>
                        <p className="text-xs font-semibold leading-relaxed line-clamp-2">{pdf.specialNote}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full rounded-lg px-2.5 py-1.5 text-[11px] font-semibold" style={{ background: "#f8fafc", color: "#64748b" }}>
                        <FileIcon className="w-3.5 h-3.5" />
                        <span className="truncate">{pdf.fileName}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold" style={{ background: "#f8fafc", color: "#64748b" }}>
                        <UserIcon />
                        {pdf.lecturer.name}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold" style={{ background: "#f8fafc", color: "#64748b" }}>
                        <CalendarIcon />
                        {new Date(pdf.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`/api/student/pdfs/${pdf.id}/download`}
                    className="inline-flex md:self-center items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black transition-all hover:scale-[1.02]"
                    style={{ background: "#1a3262", color: "#e8a020", minWidth: 132 }}
                  >
                    <DownloadIcon />
                    Download
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
