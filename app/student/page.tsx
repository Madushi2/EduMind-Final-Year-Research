"use client";

import Link from "next/link";
import { useContext } from "react";
import { CourseContext } from "./course-context";

const actions = [
  { href: "/student/course-pdf", label: "Course PDF", desc: "View PDF materials for the selected course.", accent: "#2563eb" },
  { href: "/student/generate-quiz", label: "Generate Quiz", desc: "Draft quiz workspace for the selected course.", accent: "#059669" },
  { href: "/student/lectures", label: "Lectures", desc: "Open lecture content for the selected course.", accent: "#7c3aed" },
  { href: "/student/notifications", label: "Notifications", desc: "Check announcements for the selected course.", accent: "#dc2626" },
];

function ArrowIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

export default function StudentDashboard() {
  const { selectedCourse } = useContext(CourseContext);
  const dateStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1400px]">
      <section className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0e1f45 0%, #1a3262 50%, #1e3d72 100%)", minHeight: 160 }}>
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-10" style={{ background: "#e8a020" }} />
        <div className="absolute -bottom-12 right-32 w-32 h-32 rounded-full opacity-10" style={{ background: "#e8a020" }} />
        <div className="relative z-10 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <span className="inline-flex text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border mb-2" style={{ background: "rgba(232,160,32,0.15)", borderColor: "rgba(232,160,32,0.35)", color: "#e8a020" }}>Student Portal</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
              {selectedCourse ? `${selectedCourse.code} learning workspace` : "Welcome back to your student dashboard"}
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{dateStr}</p>
          </div>
          <div className="rounded-2xl border px-5 py-4 min-w-[220px]" style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" }}>
            <div className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Active Course</div>
            <div className="text-sm font-bold text-white">{selectedCourse?.code ?? "No course selected"}</div>
            <div className="text-xs mt-0.5 truncate max-w-[240px]" style={{ color: "rgba(255,255,255,0.45)" }}>{selectedCourse?.name ?? "Use the header dropdown to choose a course."}</div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "#94a3b8" }}>Course Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={selectedCourse ? action.href : "#"}
              onClick={(event) => { if (!selectedCourse) event.preventDefault(); }}
              className="group bg-white rounded-2xl border p-5 transition-all hover:shadow-md"
              style={{ borderColor: "#e2e8f0", opacity: selectedCourse ? 1 : 0.58, cursor: selectedCourse ? "pointer" : "not-allowed" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black" style={{ background: `${action.accent}12`, color: action.accent }}>{action.label.slice(0, 1)}</div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#1a3262" }}><ArrowIcon /></span>
              </div>
              <h3 className="text-sm font-black mt-4" style={{ color: "#1a3262" }}>{action.label}</h3>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "#94a3b8" }}>{action.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl border p-6" style={{ borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h2 className="text-sm font-black" style={{ color: "#1a3262" }}>Draft Area</h2>
        <p className="text-sm mt-1 max-w-2xl" style={{ color: "#64748b" }}>
          The student dashboard structure is ready. Course-specific content can be added into each module next.
        </p>
      </section>
    </div>
  );
}
