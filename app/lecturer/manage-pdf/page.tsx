"use client";

import { FormEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CourseContext } from "../course-context";

type ToastType = "success" | "error" | "info";
interface Toast { id: number; type: ToastType; title: string; message: string }

interface LecturePdf {
  id:          string;
  title:       string;
  description: string;
  specialNote: string;
  fileName:    string;
  size:        number;
  active:      boolean;
  createdAt:   string;
}

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
            className="w-full text-left rounded-2xl border bg-white p-4 shadow-lg"
            style={{ background: colors.bg, borderColor: colors.border, color: colors.text }}
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ background: colors.dot }} />
              <span className="min-w-0">
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

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function FileIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

function FileNameIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M7 21h10a2 2 0 002-2V9.5L13.5 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
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

function ToggleSwitch({ active, disabled, onToggle }: { active: boolean; disabled?: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        color: active ? "#065f46" : "#64748b",
      }}
      aria-pressed={active}
    >
      <span
        className="relative inline-flex h-5 w-9 rounded-full transition-all"
        style={{ background: active ? "#059669" : "#cbd5e1" }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all shadow-sm"
          style={{ left: active ? 18 : 2 }}
        />
      </span>
      <span className="text-[11px] font-black">{active ? "Active" : "Inactive"}</span>
    </button>
  );
}

function SkeletonRow() {
  return (
    <div className="p-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl" style={{ background: "#f1f5f9" }} />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 rounded-full w-48" style={{ background: "#e2e8f0" }} />
        <div className="h-3 rounded-full w-72 max-w-full" style={{ background: "#f1f5f9" }} />
      </div>
      <div className="h-9 rounded-xl w-28 hidden sm:block" style={{ background: "#f1f5f9" }} />
    </div>
  );
}

export default function ManagePdfPage() {
  const { selectedCourse } = useContext(CourseContext);
  const { toasts, push, dismiss } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pdfs, setPdfs] = useState<LecturePdf[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [specialNote, setSpecialNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const courseId = selectedCourse?.id ?? "";
  const canSubmit = useMemo(() => Boolean(courseId && title.trim() && file && !saving), [courseId, file, saving, title]);

  useEffect(() => {
    if (!courseId) {
      const timer = setTimeout(() => {
        setPdfs([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => setLoading(true), 0);

    fetch(`/api/lecturer/pdfs?courseId=${encodeURIComponent(courseId)}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load PDFs.");
        return res.json();
      })
      .then((data) => setPdfs(Array.isArray(data) ? data : []))
      .catch((error) => {
        if (error.name !== "AbortError") push("error", "Could not load PDFs", "Please refresh and try again.");
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
    setSpecialNote("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCourse) {
      push("info", "Select a course", "Choose a course from the header before adding PDFs.");
      return;
    }
    if (!title.trim()) {
      push("error", "Title required", "Add a title for this PDF.");
      return;
    }
    if (!file) {
      push("error", "PDF required", "Choose a PDF file to upload.");
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      push("error", "Invalid file", "Only PDF files are allowed.");
      return;
    }

    const form = new FormData();
    form.append("courseId", selectedCourse.id);
    form.append("title", title.trim());
    form.append("description", description.trim());
    form.append("specialNote", specialNote.trim());
    form.append("pdf", file);

    setSaving(true);
    try {
      const res = await fetch("/api/lecturer/pdfs", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        push("error", "Upload failed", data.error ?? "Please check the PDF and try again.");
        return;
      }

      setPdfs((prev) => [data, ...prev]);
      resetForm();
      push("success", "PDF added", `${data.title} is ready to download.`);
    } catch {
      push("error", "Upload failed", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(pdf: LecturePdf) {
    const nextActive = !pdf.active;
    setPdfs((prev) => prev.map((item) => item.id === pdf.id ? { ...item, active: nextActive } : item));

    try {
      const res = await fetch(`/api/lecturer/pdfs/${pdf.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPdfs((prev) => prev.map((item) => item.id === pdf.id ? { ...item, active: pdf.active } : item));
        push("error", "Status not updated", data.error ?? "Please try again.");
        return;
      }

      push(
        "success",
        nextActive ? "PDF activated" : "PDF inactivated",
        `${pdf.title} is now ${nextActive ? "active" : "inactive"}.`
      );
    } catch {
      setPdfs((prev) => prev.map((item) => item.id === pdf.id ? { ...item, active: pdf.active } : item));
      push("error", "Status not updated", "Network error. Please try again.");
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-black" style={{ color: "#1a3262" }}>Manage PDF</h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
            Add, organise, and download PDF materials for the selected course.
          </p>
        </div>
        <div
          className="rounded-2xl border px-4 py-3 min-w-[220px]"
          style={{ background: "white", borderColor: "#e2e8f0" }}
        >
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
            <h2 className="text-sm font-black" style={{ color: "#1a3262" }}>Add New PDF</h2>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>Title and PDF upload are required.</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#1a3262" }}>
              Title
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={!selectedCourse || saving}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all disabled:opacity-60"
              style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#1e293b" }}
              placeholder="Lecture 01 notes"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#1a3262" }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={!selectedCourse || saving}
              rows={3}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none transition-all disabled:opacity-60"
              style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#1e293b" }}
              placeholder="Optional short description"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#1a3262" }}>
              Special Note
            </label>
            <textarea
              value={specialNote}
              onChange={(event) => setSpecialNote(event.target.value)}
              disabled={!selectedCourse || saving}
              rows={2}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none transition-all disabled:opacity-60"
              style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#1e293b" }}
              placeholder="Optional note for students"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#1a3262" }}>
              PDF Upload
            </label>
            <label
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-7 text-center transition-all"
              style={{
                borderColor: file ? "#1a3262" : "#cbd5e1",
                background: file ? "rgba(26,50,98,0.04)" : "#f8fafc",
                cursor: selectedCourse && !saving ? "pointer" : "not-allowed",
              }}
            >
              <span className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(232,160,32,0.14)", color: "#b45309" }}>
                <FileIcon />
              </span>
              <span className="text-sm font-bold" style={{ color: "#1a3262" }}>
                {file ? file.name : "Choose PDF file"}
              </span>
              <span className="text-xs" style={{ color: "#94a3b8" }}>
                {file ? formatBytes(file.size) : "PDF only, up to 15 MB"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                disabled={!selectedCourse || saving}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="sr-only"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl px-4 py-3 text-sm font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "#1a3262", color: "#e8a020" }}
          >
            {saving ? "Uploading..." : "Add PDF"}
          </button>
        </form>

        <section
          className="xl:col-span-2 bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
        >
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b" style={{ borderColor: "#f1f5f9" }}>
            <div>
              <h2 className="text-sm font-black" style={{ color: "#1a3262" }}>Added PDFs</h2>
              <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                {selectedCourse
                  ? `${pdfs.length} PDF${pdfs.length !== 1 ? "s" : ""} in ${selectedCourse.code} · ${pdfs.filter((pdf) => pdf.active).length} active`
                  : "Select a course to view PDFs"}
              </p>
            </div>
          </div>

          {!selectedCourse ? (
            <div className="py-20 px-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(26,50,98,0.08)", color: "#1a3262" }}>
                <FileIcon />
              </div>
              <h3 className="text-base font-black" style={{ color: "#1a3262" }}>No course selected</h3>
              <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Use the header dropdown to choose a course first.</p>
            </div>
          ) : loading ? (
            <div className="divide-y" style={{ borderColor: "#f8fafc" }}>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : pdfs.length === 0 ? (
            <div className="py-20 px-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(232,160,32,0.12)", color: "#b45309" }}>
                <FileIcon />
              </div>
              <h3 className="text-base font-black" style={{ color: "#1a3262" }}>No PDFs yet</h3>
              <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Add the first PDF for this course using the form.</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {pdfs.map((pdf) => (
                <article
                  key={pdf.id}
                  className="rounded-2xl border p-4 transition-all hover:shadow-md"
                  style={{ borderColor: pdf.active ? "#e8edf4" : "#e2e8f0", background: pdf.active ? "#ffffff" : "#f8fafc", opacity: pdf.active ? 1 : 0.72 }}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.10), rgba(232,160,32,0.12))", color: "#dc2626" }}
                    >
                      <FileIcon />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <div className="min-w-0">
                          <h3 className="text-base font-black truncate" style={{ color: "#1a3262" }}>{pdf.title}</h3>
                        </div>
                        <span
                          className="w-fit text-[10px] font-black px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(26,50,98,0.07)", color: "#1a3262" }}
                        >
                          {formatBytes(pdf.size)}
                        </span>
                        {!pdf.active && (
                          <span className="w-fit text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: "rgba(100,116,139,0.12)", color: "#64748b" }}>
                            Inactive
                          </span>
                        )}
                      </div>

                      {pdf.description ? (
                        <p className="text-sm mt-1.5 leading-relaxed line-clamp-2" style={{ color: "#475569" }}>
                          {pdf.description}
                        </p>
                      ) : (
                        <p className="text-sm mt-1.5 italic" style={{ color: "#cbd5e1" }}>
                          No description added
                        </p>
                      )}

                      {pdf.specialNote && (
                        <div
                          className="mt-3 rounded-xl px-3 py-2 flex items-start gap-2"
                          style={{ background: "rgba(232,160,32,0.10)", color: "#92400e" }}
                        >
                          <span className="mt-0.5 shrink-0"><NoteIcon /></span>
                          <p className="text-xs font-semibold leading-relaxed line-clamp-2">{pdf.specialNote}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-3">
                        <span
                          className="inline-flex items-center gap-1.5 min-w-0 max-w-full rounded-lg px-2.5 py-1.5 text-[11px] font-semibold"
                          style={{ background: "#f8fafc", color: "#64748b" }}
                        >
                          <FileNameIcon />
                          <span className="truncate">{pdf.fileName}</span>
                        </span>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold"
                          style={{ background: "#f8fafc", color: "#64748b" }}
                        >
                          <CalendarIcon />
                          {new Date(pdf.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>

                      <div className="mt-3 flex justify-start">
                        <ToggleSwitch active={pdf.active} onToggle={() => handleToggleActive(pdf)} />
                      </div>
                    </div>

                    <a
                      href={`/api/lecturer/pdfs/${pdf.id}/download`}
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
    </div>
  );
}
