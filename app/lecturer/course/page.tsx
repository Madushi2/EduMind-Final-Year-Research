"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CourseContext } from "../course-context";

interface AssignedLecturer {
  id:        string;
  name:      string;
  email:     string;
  position:  string | null;
  contact:   string | null;
  isCurrent: boolean;
}

interface CourseDetails {
  id:           string;
  code:         string;
  name:         string;
  semester:     string;
  credits:      number;
  active:       boolean;
  studentCount: number;
  lecturers:    AssignedLecturer[];
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2) || "LC";
}

function BookIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
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

function StatCard({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border p-4" style={{ borderColor: "#e2e8f0" }}>
      <div className="flex items-center gap-3 mb-1">
        <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}12`, color }}>
          {icon}
        </span>
        <div className="text-2xl font-black" style={{ color }}>{value}</div>
      </div>
      <div className="text-xs font-semibold" style={{ color: "#94a3b8" }}>{label}</div>
    </div>
  );
}

function LecturerCard({ lecturer }: { lecturer: AssignedLecturer }) {
  return (
    <article className="bg-white rounded-2xl border p-5 flex items-start gap-4 transition-all hover:shadow-md" style={{ borderColor: "#e2e8f0" }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black shrink-0" style={{ background: lecturer.isCurrent ? "rgba(232,160,32,0.16)" : "rgba(124,58,237,0.12)", color: lecturer.isCurrent ? "#b45309" : "#7c3aed" }}>
        {initials(lecturer.name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black truncate" style={{ color: "#1a3262" }}>{lecturer.name}</h3>
          {lecturer.isCurrent && (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0" style={{ background: "rgba(232,160,32,0.14)", color: "#b45309" }}>
              You
            </span>
          )}
        </div>
        {lecturer.position && (
          <div className="text-xs font-semibold mt-0.5" style={{ color: lecturer.isCurrent ? "#b45309" : "#7c3aed" }}>{lecturer.position}</div>
        )}
        <a href={`mailto:${lecturer.email}`} className="text-xs mt-2 truncate block hover:underline" style={{ color: "#64748b" }}>
          {lecturer.email}
        </a>
        {lecturer.contact && (
          <div className="text-xs mt-1 truncate" style={{ color: "#94a3b8" }}>{lecturer.contact}</div>
        )}
      </div>
    </article>
  );
}

export default function LecturerCoursePage() {
  const router = useRouter();
  const { selectedCourse } = useContext(CourseContext);
  const [details, setDetails] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const courseId = selectedCourse?.id ?? "";

  useEffect(() => {
    if (!courseId) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);

      fetch(`/api/lecturer/courses/${encodeURIComponent(courseId)}`, { signal: controller.signal })
        .then(async (res) => {
          if (res.status === 403) {
            router.push("/login");
            return null;
          }
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Could not load course details.");
          return data as CourseDetails;
        })
        .then((data) => {
          if (data) setDetails(data);
        })
        .catch((err: Error) => {
          if (err.name !== "AbortError") {
            setDetails(null);
            setError(err.message || "Could not load course details.");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [courseId, router]);

  const otherLecturers = useMemo(
    () => details?.lecturers.filter((lecturer) => !lecturer.isCurrent) ?? [],
    [details]
  );

  if (!selectedCourse) {
    return (
      <div className="p-6 lg:p-8 max-w-[1400px]">
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-2xl border" style={{ borderColor: "#e2e8f0" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(26,50,98,0.08)", color: "#1a3262" }}>
            <BookIcon />
          </div>
          <h2 className="text-base font-black" style={{ color: "#1a3262" }}>No course selected</h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Use the dropdown in the header to choose a course.</p>
        </div>
      </div>
    );
  }

  const course = details ?? selectedCourse;
  const fields = [
    { label: "Course Code", value: course.code },
    { label: "Course Name", value: course.name },
    { label: "Semester",    value: course.semester ?? "N/A" },
    { label: "Credits",     value: course.credits != null ? `${course.credits} credit${course.credits !== 1 ? "s" : ""}` : "N/A" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black" style={{ color: "#1a3262" }}>Course</h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
            Selected course details and assigned lecturer team.
          </p>
        </div>
        {details && (
          <span className="text-xs font-black uppercase px-3 py-1.5 rounded-full w-fit" style={{ background: details.active ? "rgba(5,150,105,0.10)" : "#f1f5f9", color: details.active ? "#059669" : "#64748b" }}>
            {details.active ? "Active" : "Inactive"}
          </span>
        )}
      </div>

      <section className="rounded-2xl overflow-hidden border" style={{ borderColor: "#dbeafe", background: "linear-gradient(135deg, #0e1f45 0%, #1a3262 62%, #2563eb 100%)" }}>
        <div className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5 min-w-0">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-black shrink-0" style={{ background: "rgba(232,160,32,0.18)", color: "#e8a020" }}>
              {course.code.slice(0, 3)}
            </div>
            <div className="min-w-0">
              <span className="inline-flex text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border mb-2" style={{ background: "rgba(232,160,32,0.15)", borderColor: "rgba(232,160,32,0.35)", color: "#e8a020" }}>
                Selected Course
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">{course.name}</h2>
              <p className="text-sm mt-0.5 font-semibold" style={{ color: "rgba(255,255,255,0.58)" }}>{course.code}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="rounded-2xl border px-5 py-3 text-center" style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" }}>
              <div className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.42)" }}>Lecturers</div>
              <div className="text-2xl font-black text-white">{loading ? "..." : details?.lecturers.length ?? 0}</div>
            </div>
            <div className="rounded-2xl border px-5 py-3 text-center" style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" }}>
              <div className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.42)" }}>Students</div>
              <div className="text-2xl font-black text-white">{loading ? "..." : details?.studentCount ?? 0}</div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border px-4 py-3 text-sm font-semibold" style={{ background: "rgba(220,38,38,0.08)", borderColor: "rgba(220,38,38,0.18)", color: "#dc2626" }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Credits" value={course.credits ?? "N/A"} color="#2563eb" icon={<BookIcon />} />
        <StatCard label="Lecturers" value={loading ? "..." : details?.lecturers.length ?? 0} color="#7c3aed" icon={<UsersIcon />} />
        <StatCard label="Other Lecturers" value={loading ? "..." : otherLecturers.length} color="#059669" icon={<UsersIcon />} />
        <StatCard label="Students" value={loading ? "..." : details?.studentCount ?? 0} color="#e8a020" icon={<UsersIcon />} />
      </div>

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

      <section>
        <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "#94a3b8" }}>Other Assigned Lecturers</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[0, 1].map((item) => (
              <div key={item} className="bg-white rounded-2xl border p-5 flex gap-4 animate-pulse" style={{ borderColor: "#e2e8f0" }}>
                <div className="w-12 h-12 rounded-2xl shrink-0" style={{ background: "#f1f5f9" }} />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3.5 w-36 rounded-full" style={{ background: "#e2e8f0" }} />
                  <div className="h-3 w-24 rounded-full" style={{ background: "#f1f5f9" }} />
                  <div className="h-3 w-48 max-w-full rounded-full" style={{ background: "#f1f5f9" }} />
                </div>
              </div>
            ))}
          </div>
        ) : !details ? (
          <div className="bg-white rounded-2xl border px-6 py-10 text-center" style={{ borderColor: "#e2e8f0" }}>
            <p className="text-sm font-semibold" style={{ color: "#94a3b8" }}>Course lecturer details could not be loaded.</p>
          </div>
        ) : otherLecturers.length === 0 ? (
          <div className="bg-white rounded-2xl border px-6 py-10 text-center" style={{ borderColor: "#e2e8f0" }}>
            <p className="text-sm font-semibold" style={{ color: "#94a3b8" }}>No other lecturers are assigned to this course.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherLecturers.map((lecturer) => (
              <LecturerCard key={lecturer.id} lecturer={lecturer} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
