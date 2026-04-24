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
  name:            string;
  email:           string;
  semester?:       string;
  contact?:        string;
  gender?:         string;
  age?:            number | null;
  profilePicture?: string | null;
}

interface NavItem {
  label:     string;
  href:      string;
  icon:      React.ReactNode;
  badge?:    number;
  children?: NavItem[];
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
  course: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6.5A2.5 2.5 0 016.5 4H20v14H6.5A2.5 2.5 0 014 20.5v-14zM8 8h8M8 12h6" />
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
  camera: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <circle cx="12" cy="13" r="3" strokeWidth={2} />
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

function buildNavGroups(course: Course | null, unread: number): NavGroup[] {
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
        { label: "Course",        href: "/student/course",        icon: Ic.course,  children: [
            { label: "Course PDF", href: "/student/course-pdf", icon: Ic.pdf },
          ] },
        { label: "Generate Quiz", href: "/student/generate-quiz", icon: Ic.quiz    },
        { label: "Lectures",      href: "/student/lectures",      icon: Ic.lecture },
        { label: "Notifications", href: "/student/notifications", icon: Ic.bell, badge: unread || undefined },
      ],
    },
  ];
}

/* ── Avatar helper ─────────────────────────────────────────────── */
function Avatar({
  user,
  size,
  darkBg,
  onClick,
}: {
  user: CurrentUser | null;
  size: number;
  darkBg?: boolean;
  onClick?: () => void;
}) {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    cursor: onClick ? "pointer" : undefined,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  if (user?.profilePicture) {
    return (
      <div style={style} onClick={onClick}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={user.profilePicture} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }

  return (
    <div
      style={{
        ...style,
        background: darkBg ? "#e8a020" : "#1a3262",
        color:      darkBg ? "#0e1f45" : "#e8a020",
        fontSize:   size < 36 ? 11 : 14,
        fontWeight: 900,
      }}
      onClick={onClick}
    >
      {initials(user?.name ?? "Student")}
    </div>
  );
}

/* ── Profile Popup ─────────────────────────────────────────────── */
function ProfilePopup({
  currentUser,
  onClose,
  onProfilePictureUpdate,
}: {
  currentUser: CurrentUser;
  onClose: () => void;
  onProfilePictureUpdate: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "loading" | "success" | "error"; message: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || uploading) return;
    if (!file.type.startsWith("image/")) {
      const message = "Only image files are allowed.";
      setError(message);
      setToast({ type: "error", message });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      const message = "Image must be 2 MB or smaller.";
      setError(message);
      setToast({ type: "error", message });
      return;
    }

    setError(null);
    setToast({ type: "loading", message: "Uploading profile picture..." });
    setUploading(true);
    const form = new FormData();
    form.append("profilePicture", file);
    try {
      const res = await fetch("/api/student/me", { method: "PATCH", body: form });
      const data = await res.json();
      if (!res.ok || typeof data.profilePicture !== "string") {
        const message = data.error ?? "Upload failed.";
        setError(message);
        setToast({ type: "error", message });
        return;
      }
      onProfilePictureUpdate(data.profilePicture);
      setToast({ type: "success", message: "Profile picture saved." });
      setTimeout(() => setToast(null), 2400);
    } catch {
      const message = "Upload failed. Please try again.";
      setError(message);
      setToast({ type: "error", message });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const fields = [
    { label: "Email",    value: currentUser.email },
    { label: "Semester", value: currentUser.semester || "—" },
    { label: "Contact",  value: currentUser.contact  || "—" },
    { label: "Gender",   value: currentUser.gender   || "—" },
    ...(currentUser.age != null ? [{ label: "Age", value: String(currentUser.age) }] : []),
  ];

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(14,31,69,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}
    >
      {toast && (
        <div
          role="status"
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            maxWidth: 300,
            padding: "10px 14px",
            borderRadius: 12,
            background: toast.type === "success" ? "#dcfce7" : toast.type === "error" ? "#fee2e2" : "#eff6ff",
            color: toast.type === "success" ? "#166534" : toast.type === "error" ? "#991b1b" : "#1d4ed8",
            border: `1px solid ${toast.type === "success" ? "#bbf7d0" : toast.type === "error" ? "#fecaca" : "#bfdbfe"}`,
            boxShadow: "0 12px 32px rgba(14,31,69,0.18)",
            fontSize: 13,
            fontWeight: 800,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {toast.message}
        </div>
      )}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 380, boxShadow: "0 24px 64px rgba(14,31,69,0.22)", overflow: "hidden" }}
      >
        {/* Header band */}
        <div style={{ background: "#0e1f45", padding: "24px 24px 48px", position: "relative" }}>
          <button
            onClick={onClose}
            style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, padding: 6, color: "white", cursor: "pointer", display: "flex" }}
          >
            {Ic.close}
          </button>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Student Profile</div>
          <div style={{ color: "white", fontSize: 18, fontWeight: 900, marginTop: 4 }}>{currentUser.name}</div>
        </div>

        {/* Avatar upload ring */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: -36 }}>
          <div style={{ position: "relative" }}>
            <div
              style={{ width: 72, height: 72, borderRadius: "50%", border: "4px solid white", overflow: "hidden", cursor: uploading ? "wait" : "pointer", background: "#e8a020", opacity: uploading ? 0.72 : 1 }}
              onClick={() => { if (!uploading) fileRef.current?.click(); }}
            >
              {currentUser.profilePicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentUser.profilePicture} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#0e1f45", fontSize: 22, fontWeight: 900 }}>
                  {initials(currentUser.name)}
                </div>
              )}
            </div>
            <button
              onClick={() => { if (!uploading) fileRef.current?.click(); }}
              disabled={uploading}
              style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: "#e8a020", border: "2px solid white", cursor: uploading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
            >
              {uploading ? (
                <div style={{ width: 10, height: 10, borderRadius: "50%", border: "2px solid #0e1f45", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
              ) : (
                <svg width="11" height="11" fill="none" stroke="#0e1f45" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <circle cx="12" cy="13" r="3" strokeWidth={2.5} />
                </svg>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" disabled={uploading} onChange={handleFileChange} style={{ display: "none" }} />
          </div>
        </div>

        {/* Tap to upload hint */}
        <div style={{ textAlign: "center", marginTop: 8, marginBottom: 4 }}>
          <button disabled={uploading} onClick={() => fileRef.current?.click()} style={{ fontSize: 11, color: uploading ? "#64748b" : "#94a3b8", background: "none", border: "none", cursor: uploading ? "wait" : "pointer" }}>
            {uploading ? "Uploading…" : "Tap to change photo"}
          </button>
        </div>

        {error && (
          <div style={{ margin: "0 24px 8px", padding: "8px 12px", borderRadius: 8, background: "rgba(220,38,38,0.08)", color: "#dc2626", fontSize: 12, textAlign: "center" }}>{error}</div>
        )}

        {/* Details */}
        <div style={{ padding: "8px 24px 24px" }}>
          {fields.map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 600, maxWidth: 220, textAlign: "right", wordBreak: "break-word" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Sidebar({
  collapsed,
  mobileOpen,
  pathname,
  selectedCourse,
  currentUser,
  selectedCourseUnread,
  onClose,
  onLogout,
  onOpenProfile,
}: {
  collapsed:            boolean;
  mobileOpen:           boolean;
  pathname:             string;
  selectedCourse:       Course | null;
  currentUser:          CurrentUser | null;
  selectedCourseUnread: number;
  onClose:              () => void;
  onLogout:             () => void;
  onOpenProfile:        () => void;
}) {
  const navGroups = buildNavGroups(selectedCourse, selectedCourseUnread);
  const w = collapsed ? 72 : 260;

  function isActive(href: string) {
    if (href === "/student") return pathname === "/student";
    return pathname === href || pathname.startsWith(href + "/");
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
                    const showChildren = !collapsed && !disabled && item.children && item.children.length > 0;
                    return (
                      <div key={item.href}>
                        <Link
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
                          {!collapsed && item.badge && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-[10px] font-black rounded-full" style={{ background: "#dc2626", color: "white", minWidth: 18, height: 18, padding: "0 5px" }}>
                              {item.badge > 99 ? "99+" : item.badge}
                            </span>
                          )}
                          {collapsed && item.badge && (
                            <span className="absolute top-1.5 right-1.5 flex items-center justify-center text-[9px] font-black rounded-full" style={{ background: "#dc2626", color: "white", minWidth: 14, height: 14, padding: "0 3px" }}>
                              {item.badge > 9 ? "9+" : item.badge}
                            </span>
                          )}
                          <span style={{ color: active ? "#1a3262" : undefined }}>{item.icon}</span>
                          {!collapsed && <span className={`text-sm truncate flex-1 ${active ? "font-bold" : "font-semibold"}`}>{item.label}</span>}
                        </Link>

                        {showChildren && (
                          <div className="ml-4 mt-0.5 mb-0.5 space-y-0.5 pl-3" style={{ borderLeft: "1.5px solid rgba(255,255,255,0.1)" }}>
                            {item.children!.map((child) => {
                              const childActive = isActive(child.href);
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={onClose}
                                  className="flex items-center gap-2.5 rounded-xl transition-all duration-200 relative"
                                  style={{
                                    padding: "7px 10px",
                                    background: childActive ? "rgba(255,255,255,0.97)" : "transparent",
                                    color: childActive ? "#1a3262" : "rgba(255,255,255,0.5)",
                                    cursor: "pointer",
                                  }}
                                  onMouseEnter={(e) => { if (!childActive) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                                  onMouseLeave={(e) => { if (!childActive) e.currentTarget.style.background = "transparent"; }}
                                >
                                  {childActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full" style={{ height: 22, background: "#e8a020" }} />}
                                  <span style={{ color: childActive ? "#1a3262" : undefined }}>{child.icon}</span>
                                  <span className={`text-xs truncate flex-1 ${childActive ? "font-bold" : "font-semibold"}`}>{child.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t" style={{ borderColor: "rgba(255,255,255,0.07)", padding: collapsed ? "12px 8px" : "12px 16px" }}>
          {!collapsed ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-3 mb-3 w-full rounded-xl px-2 py-1.5 transition-all text-left"
              style={{ cursor: "pointer", background: "transparent" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <Avatar user={currentUser} size={36} darkBg />
              <div className="overflow-hidden flex-1">
                <div className="text-white text-xs font-bold truncate">{currentUser?.name ?? "Student"}</div>
                <div className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.38)" }}>{currentUser?.email ?? "student@edumind.ac"}</div>
              </div>
            </button>
          ) : (
            <div className="flex justify-center mb-3">
              <Avatar user={currentUser} size={32} darkBg onClick={onOpenProfile} />
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

interface Notification {
  id:          string;
  title:       string;
  description: string;
  priority:    string;
  createdAt:   string;
  lecturer: { name: string; position: string | null };
}

function NotificationDropdown({ selectedCourse, onClose }: { selectedCourse: Course | null; onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedCourse) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/student/notifications?courseId=${selectedCourse.id}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  const priorityColor: Record<string, string> = {
    high:   "#dc2626",
    medium: "#e8a020",
    low:    "#22c55e",
  };

  return (
    <div
      className="absolute top-full mt-2 right-0 z-50 rounded-2xl overflow-hidden"
      style={{ width: 320, background: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}
    >
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
        <div>
          <div className="text-[10px] font-black tracking-widest uppercase" style={{ color: "#94a3b8" }}>Notifications</div>
          <div className="text-xs font-medium mt-0.5" style={{ color: "#64748b" }}>
            {selectedCourse ? selectedCourse.code : "No course selected"}
          </div>
        </div>
        <button onClick={onClose} style={{ color: "#94a3b8", cursor: "pointer", background: "none", border: "none", display: "flex" }}>{Ic.close}</button>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {!selectedCourse ? (
          <div className="px-4 py-6 text-center">
            <div className="text-sm font-medium" style={{ color: "#94a3b8" }}>Select a course to see notifications</div>
          </div>
        ) : loading ? (
          <div className="px-4 py-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 rounded-full" style={{ background: "#e2e8f0", width: `${60 + i * 10}%` }} />
                <div className="h-2.5 rounded-full w-24" style={{ background: "#f1f5f9" }} />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <div className="text-sm font-medium" style={{ color: "#94a3b8" }}>No notifications yet</div>
            <div className="text-xs mt-1" style={{ color: "#cbd5e1" }}>Check back later for updates from your lecturer.</div>
          </div>
        ) : (
          <div className="py-1.5 divide-y" style={{ borderColor: "#f1f5f9" }}>
            {notifications.map((n) => (
              <div key={n.id} className="px-4 py-3 flex items-start gap-3">
                <span
                  className="mt-1.5 shrink-0 w-2 h-2 rounded-full"
                  style={{ background: priorityColor[n.priority] ?? "#94a3b8" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-snug" style={{ color: "#1e293b" }}>{n.title}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>
                    {n.lecturer.name} · {new Date(n.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
  totalUnread,
  onToggleSidebar,
  onMobileOpen,
  onSelectCourse,
  onOpenProfile,
}: {
  collapsed:       boolean;
  pathname:        string;
  courses:         Course[];
  selectedCourse:  Course | null;
  currentUser:     CurrentUser | null;
  coursesLoading:  boolean;
  totalUnread:     number;
  onToggleSidebar: () => void;
  onMobileOpen:    () => void;
  onSelectCourse:  (course: Course) => void;
  onOpenProfile:   () => void;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const sidebarW = collapsed ? 72 : 260;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
      <div ref={notifRef} className="relative">
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all"
          style={{ color: notifOpen ? "#1a3262" : "#64748b", background: notifOpen ? "#f1f5f9" : "transparent", cursor: "pointer" }}
        >
          {Ic.bell}
          {totalUnread > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center text-[9px] font-black rounded-full" style={{ background: "#dc2626", color: "white", minWidth: 15, height: 15, padding: "0 3px", lineHeight: 1 }}>
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </button>
        {notifOpen && <NotificationDropdown selectedCourse={selectedCourse} onClose={() => setNotifOpen(false)} />}
      </div>
      <div className="w-px h-6" style={{ background: "#e2e8f0" }} />
      <button
        onClick={onOpenProfile}
        className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all"
        style={{ cursor: "pointer", background: "transparent" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        <Avatar user={currentUser} size={32} />
        <div className="hidden sm:block">
          <div className="text-xs font-bold leading-none mb-0.5 text-left" style={{ color: "#1a3262" }}>{currentUser?.name ?? "Student"}</div>
          <div className="text-[10px]" style={{ color: "#94a3b8" }}>{currentUser?.semester || "Learner"}</div>
        </div>
      </button>
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
  const [profilePopupOpen, setProfilePopupOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const storedCollapsed = localStorage.getItem("em_stu_sidebar_collapsed");
    if (storedCollapsed === "true") setTimeout(() => setCollapsed(true), 0);
  }, []);

  useEffect(() => {
    const storedCourse = localStorage.getItem("em_stu_selected_course");
    fetch("/api/student/courses")
      .then((res) => {
        if (res.status === 403) { router.push("/login"); return []; }
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
        if (res.status === 403) { router.push("/login"); return null; }
        return res.json();
      })
      .then((data) => {
        if (data && typeof data.name === "string") {
          setCurrentUser({
            name:           data.name,
            email:          data.email          ?? "",
            semester:       data.semester        ?? "",
            contact:        data.contact         ?? "",
            gender:         data.gender          ?? "",
            age:            data.age             ?? null,
            profilePicture: data.profilePicture  ?? null,
          });
        }
      })
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    if (courses.length === 0) return;
    fetch("/api/student/notifications/unread-count")
      .then((res) => res.ok ? res.json() : { total: 0, byCourse: {} })
      .then((data) => setUnreadCounts(data.byCourse ?? {}))
      .catch(() => {});
  }, [courses]);

  function markNotifRead(courseId: string) {
    setUnreadCounts((prev) => ({
      ...prev,
      [courseId]: Math.max(0, (prev[courseId] ?? 0) - 1),
    }));
  }

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

  function handleProfilePictureUpdate(url: string) {
    setCurrentUser((prev) => prev ? { ...prev, profilePicture: url } : prev);
  }

  const sidebarW = collapsed ? 72 : 260;
  const totalUnread = Object.values(unreadCounts).reduce((s, n) => s + n, 0);
  const selectedCourseUnread = selectedCourse ? (unreadCounts[selectedCourse.id] ?? 0) : 0;

  return (
    <CourseContext.Provider value={{ selectedCourse, setSelectedCourse: handleSetSelectedCourse, markNotifRead }}>
      <div className="min-h-screen" style={{ background: "#f8fafc" }}>
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          pathname={pathname}
          selectedCourse={selectedCourse}
          currentUser={currentUser}
          selectedCourseUnread={selectedCourseUnread}
          onClose={() => setMobileOpen(false)}
          onLogout={handleLogout}
          onOpenProfile={() => setProfilePopupOpen(true)}
        />
        <div className="flex flex-col min-h-screen transition-all duration-300" style={{ marginLeft: sidebarW }}>
          <Header
            collapsed={collapsed}
            pathname={pathname}
            courses={courses}
            selectedCourse={selectedCourse}
            currentUser={currentUser}
            coursesLoading={coursesLoading}
            totalUnread={totalUnread}
            onToggleSidebar={toggleSidebar}
            onMobileOpen={() => setMobileOpen(true)}
            onSelectCourse={handleSelectCourse}
            onOpenProfile={() => setProfilePopupOpen(true)}
          />
          <main className="flex-1 overflow-y-auto" style={{ paddingTop: 64 }}>{children}</main>
        </div>
      </div>

      {profilePopupOpen && currentUser && (
        <ProfilePopup
          currentUser={currentUser}
          onClose={() => setProfilePopupOpen(false)}
          onProfilePictureUpdate={handleProfilePictureUpdate}
        />
      )}
    </CourseContext.Provider>
  );
}