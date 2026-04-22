"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CourseContext } from "./course-context";

interface Course {
  id:        string;
  code:      string;
  name:      string;
  semester?: string;
  credits?:  number;
}

interface CurrentUser {
  name:      string;
  email:     string;
  semester?: string;
}

interface NavItem {
  label: string;
  href:  string;
  icon:  React.ReactNode;
}

interface NavGroup {
  label:      string;
  items:      NavItem[];
  courseOnly: boolean;
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2) || "ST";
}

const Ic = {
  dashboard: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9.5L12 3l9 6.5V21H15v-6H9v6H3V9.5z" />
    </svg>
  ),
  pdf: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  quiz: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 9h.01M15 9h.01M9 15h6m-8 6h10a2 2 0 002-2V7.5L14.5 3H7a2 2 0 00-2 2v14a2 2 0 002 2zM14 3v5h5" />
    </svg>
  ),
  lecture: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6.5A2.5 2.5 0 016.5 4H20v14H6.5A2.5 2.5 0 004 20.5v-14zM8 8h8M8 12h6" />
    </svg>
  ),
  bell: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  chevronLeft: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  menu: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  book: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  logout: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

function Logo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="20" cy="20" r="20" fill="rgba(255,255,255,0.12)" />
      <path d="M8 27 L20 11 L32 27" stroke="#e8a020" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M13 27 L20 17 L27 27" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <rect x="14" y="27" width="12" height="3.5" rx="1" fill="#e8a020"/>
      <circle cx="20" cy="9" r="2.2" fill="white"/>
    </svg>
  );
}

function buildNavGroups(course: Course | null): NavGroup[] {
  return [
    {
      label: "Overview",
      courseOnly: false,
      items: [{ label: "Dashboard", href: "/student", icon: Ic.dashboard }],
    },
    {
      label: course ? course.code : "Course",
      courseOnly: true,
      items: [
        { label: "Course PDF", href: "/student/course-pdf", icon: Ic.pdf },
        { label: "Generate Quiz", href: "/student/generate-quiz", icon: Ic.quiz },
        { label: "Lectures", href: "/student/lectures", icon: Ic.lecture },
        { label: "Notifications", href: "/student/notifications", icon: Ic.bell },
      ],
    },
  ];
}

function Sidebar({
  collapsed,
  mobileOpen,
  pathname,
  selectedCourse,
  currentUser,
  onClose,
  onLogout,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  pathname: string;
  selectedCourse: Course | null;
  currentUser: CurrentUser | null;
  onClose: () => void;
  onLogout: () => void;
}) {
  const navGroups = buildNavGroups(selectedCourse);
  const w = collapsed ? 72 : 260;

  function isActive(href: string) {
    return href === "/student" ? pathname === "/student" : pathname.startsWith(href);
  }

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-20 bg-black/50 md:hidden" style={{ cursor: "pointer" }} onClick={onClose} />}
      <aside
        className="fixed left-0 top-0 z-30 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out"
        style={{ width: w, background: "#0e1f45", boxShadow: "4px 0 24px rgba(0,0,0,0.18)", transform: mobileOpen ? "translateX(0)" : undefined }}
      >
        <div className="flex items-center gap-3 px-4 shrink-0 border-b" style={{ height: 64, borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="w-9 h-9 shrink-0"><Logo /></div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-white font-black text-lg leading-none whitespace-nowrap">Edu<span style={{ color: "#e8a020" }}>Mind</span></div>
              <div className="text-[9px] font-semibold tracking-widest uppercase mt-0.5 whitespace-nowrap" style={{ color: "rgba(255,255,255,0.35)" }}>Student Portal</div>
            </div>
          )}
          <button onClick={onClose} className="ml-auto md:hidden p-1 rounded-lg" style={{ color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>{Ic.close}</button>
        </div>

        {!collapsed && selectedCourse && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-xl flex items-center gap-2" style={{ background: "rgba(232,160,32,0.12)", border: "1px solid rgba(232,160,32,0.25)" }}>
            <span style={{ color: "#e8a020" }}>{Ic.book}</span>
            <div className="overflow-hidden flex-1 min-w-0">
              <div className="text-[10px] font-black tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>Active Course</div>
              <div className="text-white text-xs font-bold truncate">{selectedCourse.code}</div>
              <div className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{selectedCourse.name}</div>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
          {navGroups.map((group) => {
            const noCourse = group.courseOnly && !selectedCourse;
            return (
              <div key={group.label}>
                {!collapsed && (
                  <div className="text-[9px] font-black tracking-widest uppercase px-3 mb-2 flex items-center gap-1.5" style={{ color: noCourse ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.28)" }}>
                    {group.label}
                    {noCourse && <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)" }}>select a course</span>}
                  </div>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    const disabled = group.courseOnly && !selectedCourse;
                    return (
                      <Link
                        key={item.href}
                        href={disabled ? "#" : item.href}
                        onClick={(event) => { if (disabled) event.preventDefault(); else onClose(); }}
                        title={collapsed ? item.label : undefined}
                        className="flex items-center gap-3 rounded-xl transition-all duration-200 relative"
                        style={{
                          padding: collapsed ? "10px 0" : "10px 12px",
                          justifyContent: collapsed ? "center" : "flex-start",
                          background: active ? "rgba(255,255,255,0.97)" : "transparent",
                          color: active ? "#1a3262" : disabled ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.62)",
                          cursor: disabled ? "not-allowed" : "pointer",
                        }}
                        onMouseEnter={(event) => { if (!active && !disabled) event.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                        onMouseLeave={(event) => { if (!active) event.currentTarget.style.background = "transparent"; }}
                      >
                        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full" style={{ height: 28, background: "#e8a020" }} />}
                        <span style={{ color: active ? "#1a3262" : undefined }}>{item.icon}</span>
                        {!collapsed && <span className={`text-sm truncate flex-1 ${active ? "font-bold" : "font-semibold"}`}>{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t" style={{ borderColor: "rgba(255,255,255,0.07)", padding: collapsed ? "12px 8px" : "12px 16px" }}>
          {!collapsed ? (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0" style={{ background: "#e8a020", color: "#0e1f45" }}>{initials(currentUser?.name ?? "Student")}</div>
              <div className="overflow-hidden flex-1">
                <div className="text-white text-xs font-bold truncate">{currentUser?.name ?? "Student"}</div>
                <div className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.38)" }}>{currentUser?.email ?? "student@edumind.ac"}</div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black" style={{ background: "#e8a020", color: "#0e1f45" }}>{initials(currentUser?.name ?? "Student")}</div>
            </div>
          )}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all"
            style={{ background: "rgba(220,38,38,0.12)", color: "rgba(248,113,113,0.9)", justifyContent: collapsed ? "center" : "flex-start", cursor: "pointer" }}
          >
            {Ic.logout}
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

function CourseSelector({
  courses,
  selectedCourse,
  loading,
  onSelect,
}: {
  courses: Course[];
  selectedCourse: Course | null;
  loading: boolean;
  onSelect: (course: Course) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all"
        style={{ background: selectedCourse ? "#1a3262" : "transparent", border: `1.5px solid ${selectedCourse ? "#1a3262" : "#e2e8f0"}`, color: selectedCourse ? "white" : "#64748b", cursor: "pointer" }}
      >
        <span>{Ic.book}</span>
        <span className="hidden sm:inline whitespace-nowrap">
          {selectedCourse ? (
            <span className="flex items-center gap-1.5">
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md" style={{ background: "#e8a020", color: "#0e1f45" }}>{selectedCourse.code}</span>
              <span className="hidden md:inline text-white/80 text-xs font-medium truncate max-w-[140px]">{selectedCourse.name}</span>
            </span>
          ) : loading ? "Loading Courses" : "Select Course"}
        </span>
        <span className="transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", color: selectedCourse ? "rgba(255,255,255,0.6)" : "#94a3b8" }}>{Ic.chevronDown}</span>
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 z-50 rounded-2xl overflow-hidden" style={{ minWidth: 260, background: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>
          <div className="px-4 py-3 border-b" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
            <div className="text-[10px] font-black tracking-widest uppercase" style={{ color: "#94a3b8" }}>Enrolled Courses</div>
            <div className="text-xs font-medium mt-0.5" style={{ color: "#64748b" }}>{loading ? "Loading enrolled courses" : `${courses.length} course${courses.length !== 1 ? "s" : ""} enrolled`}</div>
          </div>
          <div className="py-1.5 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-5 space-y-2">
                <div className="h-3 rounded-full w-28" style={{ background: "#e2e8f0" }} />
                <div className="h-3 rounded-full w-44" style={{ background: "#f1f5f9" }} />
              </div>
            ) : courses.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <div className="text-sm font-medium" style={{ color: "#94a3b8" }}>No enrolled courses</div>
                <div className="text-xs mt-1" style={{ color: "#cbd5e1" }}>Contact admin if a course is missing.</div>
              </div>
            ) : (
              courses.map((course) => {
                const isSelected = selectedCourse?.id === course.id;
                return (
                  <button
                    key={course.id}
                    onClick={() => { onSelect(course); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all"
                    style={{ background: isSelected ? "rgba(26,50,98,0.06)" : "transparent", cursor: "pointer" }}
                  >
                    <span className="shrink-0 text-[10px] font-black px-2 py-1 rounded-lg" style={{ background: isSelected ? "#1a3262" : "#f1f5f9", color: isSelected ? "white" : "#475569", minWidth: 52, textAlign: "center" }}>{course.code}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: isSelected ? "#1a3262" : "#334155" }}>{course.name}</div>
                    </div>
                    {isSelected && (
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="#1a3262" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Header({
  collapsed,
  pathname,
  courses,
  selectedCourse,
  currentUser,
  coursesLoading,
  onToggleSidebar,
  onMobileOpen,
  onSelectCourse,
}: {
  collapsed: boolean;
  pathname: string;
  courses: Course[];
  selectedCourse: Course | null;
  currentUser: CurrentUser | null;
  coursesLoading: boolean;
  onToggleSidebar: () => void;
  onMobileOpen: () => void;
  onSelectCourse: (course: Course) => void;
}) {
  const sidebarW = collapsed ? 72 : 260;
  const crumb = (() => {
    if (pathname === "/student") return "Dashboard";
    const seg = pathname.split("/")[2];
    return seg ? seg.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") : "Dashboard";
  })();

  return (
    <header className="fixed top-0 right-0 z-20 flex items-center gap-3 bg-white border-b transition-all duration-300" style={{ left: sidebarW, height: 64, borderColor: "#e2e8f0", padding: "0 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <button onClick={onToggleSidebar} className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg transition-all" style={{ color: "#64748b", cursor: "pointer" }}>{collapsed ? Ic.chevronRight : Ic.chevronLeft}</button>
      <button onClick={onMobileOpen} className="flex md:hidden items-center justify-center w-8 h-8 rounded-lg" style={{ color: "#64748b", cursor: "pointer" }}>{Ic.menu}</button>
      <div className="flex items-center gap-2 text-sm">
        <span style={{ color: "#94a3b8" }}>Student</span>
        <span style={{ color: "#cbd5e1" }}>/</span>
        <span className="font-bold" style={{ color: "#1a3262" }}>{crumb}</span>
      </div>
      <div className="flex-1" />
      <CourseSelector courses={courses} selectedCourse={selectedCourse} loading={coursesLoading} onSelect={onSelectCourse} />
      <div className="w-px h-6 hidden sm:block" style={{ background: "#e2e8f0" }} />
      <button className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all" style={{ color: "#64748b", cursor: "pointer" }}>{Ic.bell}</button>
      <div className="w-px h-6" style={{ background: "#e2e8f0" }} />
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black" style={{ background: "#1a3262", color: "#e8a020" }}>{initials(currentUser?.name ?? "Student")}</div>
        <div className="hidden sm:block">
          <div className="text-xs font-bold leading-none mb-0.5" style={{ color: "#1a3262" }}>{currentUser?.name ?? "Student"}</div>
          <div className="text-[10px]" style={{ color: "#94a3b8" }}>{currentUser?.semester || "Learner"}</div>
        </div>
      </div>
    </header>
  );
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const storedCollapsed = localStorage.getItem("em_stu_sidebar_collapsed");
    if (storedCollapsed === "true") setTimeout(() => setCollapsed(true), 0);
  }, []);

  useEffect(() => {
    const storedCourse = localStorage.getItem("em_stu_selected_course");
    fetch("/api/student/courses")
      .then((res) => {
        if (res.status === 403) {
          router.push("/login");
          return [];
        }
        return res.json();
      })
      .then((data) => {
        const enrolled = Array.isArray(data) ? data : [];
        setCourses(enrolled);
        if (!storedCourse) return;
        try {
          const parsed = JSON.parse(storedCourse) as Course;
          const restored = enrolled.find((course) => course.id === parsed.id);
          if (restored) setSelectedCourse(restored);
          else localStorage.removeItem("em_stu_selected_course");
        } catch {
          localStorage.removeItem("em_stu_selected_course");
        }
      })
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, [router]);

  useEffect(() => {
    fetch("/api/student/me")
      .then((res) => {
        if (res.status === 403) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && typeof data.name === "string") {
          setCurrentUser({
            name: data.name,
            email: data.email ?? "",
            semester: data.semester ?? "",
          });
        }
      })
      .catch(() => {});
  }, [router]);

  function toggleSidebar() {
    setCollapsed((value) => {
      localStorage.setItem("em_stu_sidebar_collapsed", String(!value));
      return !value;
    });
  }

  function handleSelectCourse(course: Course) {
    setSelectedCourse(course);
    localStorage.setItem("em_stu_selected_course", JSON.stringify(course));
  }

  function handleSetSelectedCourse(course: Course | null) {
    setSelectedCourse(course);
    if (course) localStorage.setItem("em_stu_selected_course", JSON.stringify(course));
    else localStorage.removeItem("em_stu_selected_course");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const sidebarW = collapsed ? 72 : 260;

  return (
    <CourseContext.Provider value={{ selectedCourse, setSelectedCourse: handleSetSelectedCourse }}>
      <div className="min-h-screen" style={{ background: "#f8fafc" }}>
        <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} pathname={pathname} selectedCourse={selectedCourse} currentUser={currentUser} onClose={() => setMobileOpen(false)} onLogout={handleLogout} />
        <div className="flex flex-col min-h-screen transition-all duration-300" style={{ marginLeft: sidebarW }}>
          <Header collapsed={collapsed} pathname={pathname} courses={courses} selectedCourse={selectedCourse} currentUser={currentUser} coursesLoading={coursesLoading} onToggleSidebar={toggleSidebar} onMobileOpen={() => setMobileOpen(true)} onSelectCourse={handleSelectCourse} />
          <main className="flex-1 overflow-y-auto" style={{ paddingTop: 64 }}>{children}</main>
        </div>
      </div>
    </CourseContext.Provider>
  );
}
