"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

/* ── Types ────────────────────────────────────────────────────── */
interface NavItem {
  label: string;
  href:  string;
  icon:  React.ReactNode;
  badge?: "pending";
}
interface NavGroup { label: string; items: NavItem[] }

/* ── SVG Icons ────────────────────────────────────────────────── */
const Ic = {
  dashboard: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3 9.5L12 3l9 6.5V21H15v-6H9v6H3V9.5z" />
    </svg>
  ),
  clipboard: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  book: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  student: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  ),
  lecturer: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  calendar: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  trophy: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  gallery: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  bell: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
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
  menu: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  search: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  logout: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

/* ── Nav config ───────────────────────────────────────────────── */
const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: Ic.dashboard },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Registration Requests", href: "/admin/registrations", icon: Ic.clipboard, badge: "pending" },
      { label: "Courses",   href: "/admin/courses",   icon: Ic.book },
      { label: "Students",  href: "/admin/students",  icon: Ic.student },
      { label: "Lecturers", href: "/admin/lecturers", icon: Ic.lecturer },
    ],
  },
  {
    label: "Activities",
    items: [
      { label: "Events",       href: "/admin/events",       icon: Ic.calendar },
      { label: "Competitions", href: "/admin/competitions", icon: Ic.trophy },
      { label: "Exhibitions",  href: "/admin/exhibitions",  icon: Ic.gallery },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Notifications", href: "/admin/notifications", icon: Ic.bell },
    ],
  },
];

/* ── Logo ─────────────────────────────────────────────────────── */
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

/* ── Sidebar component ────────────────────────────────────────── */
function Sidebar({
  collapsed,
  mobileOpen,
  pending,
  pathname,
  onClose,
  onLogout,
}: {
  collapsed:  boolean;
  mobileOpen: boolean;
  pending:    number;
  pathname:   string;
  onClose:    () => void;
  onLogout:   () => void;
}) {
  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  const w = collapsed ? 72 : 260;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          style={{ cursor: "pointer" }}
          onClick={onClose}
        />
      )}

      <aside
        className="fixed left-0 top-0 z-30 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          width: w,
          background: "#0e1f45",
          transform: mobileOpen ? "translateX(0)" : undefined,
          boxShadow: "4px 0 24px rgba(0,0,0,0.18)",
        }}
      >
        {/* ── Logo header ── */}
        <div
          className="flex items-center gap-3 px-4 shrink-0 border-b"
          style={{ height: 64, borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="w-9 h-9 shrink-0"><Logo /></div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-white font-black text-lg leading-none whitespace-nowrap">
                Edu<span style={{ color: "#e8a020" }}>Mind</span>
              </div>
              <div className="text-[9px] font-semibold tracking-widest uppercase mt-0.5 whitespace-nowrap"
                style={{ color: "rgba(255,255,255,0.35)" }}>
                University Platform
              </div>
            </div>
          )}
          {/* Close on mobile */}
          <button
            onClick={onClose}
            className="ml-auto md:hidden p-1 rounded-lg"
            style={{ color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
          >
            {Ic.close}
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <div
                  className="text-[9px] font-black tracking-widest uppercase px-3 mb-2"
                  style={{ color: "rgba(255,255,255,0.28)" }}
                >
                  {group.label}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active  = isActive(item.href);
                  const badgeN  = item.badge === "pending" ? pending : 0;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      className="flex items-center gap-3 rounded-xl transition-all duration-200 group relative"
                      style={{
          padding:    collapsed ? "10px 0" : "10px 12px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        background: active ? "rgba(255,255,255,0.97)" : "transparent",
                        color:      active ? "#1a3262" : "rgba(255,255,255,0.62)",
                        cursor:     "pointer",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.07)";
                      }}
                      onMouseLeave={(e) => {
                        if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                      }}
                    >
                      {/* Gold left bar for active */}
                      {active && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full"
                          style={{ height: 28, background: "#e8a020" }}
                        />
                      )}

                      <span className={`shrink-0 ${active ? "text-[#1a3262]" : ""}`}
                        style={{ color: active ? "#1a3262" : undefined }}>
                        {item.icon}
                      </span>

                      {!collapsed && (
                        <span className={`text-sm font-semibold truncate flex-1 ${active ? "font-bold" : ""}`}>
                          {item.label}
                        </span>
                      )}

                      {/* Badge */}
                      {badgeN > 0 && (
                        <span
                          className="shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none"
                          style={{
                            background: active ? "#e8a020" : "#e8a020",
                            color:      "#0e1f45",
                            minWidth:   18,
                            textAlign:  "center",
                          }}
                        >
                          {badgeN > 99 ? "99+" : badgeN}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── User footer ── */}
        <div
          className="shrink-0 border-t"
          style={{ borderColor: "rgba(255,255,255,0.07)", padding: collapsed ? "12px 8px" : "12px 16px" }}
        >
          {!collapsed ? (
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                style={{ background: "#e8a020", color: "#0e1f45" }}
              >
                SA
              </div>
              <div className="overflow-hidden flex-1">
                <div className="text-white text-xs font-bold truncate">Super Admin</div>
                <div className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.38)" }}>
                  hansaneetashini@gmail.com
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                style={{ background: "#e8a020", color: "#0e1f45" }}
              >
                SA
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all"
            style={{
              background:    "rgba(220,38,38,0.12)",
              color:         "rgba(248,113,113,0.9)",
              justifyContent: collapsed ? "center" : "flex-start",
              cursor:        "pointer",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,38,38,0.22)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,38,38,0.12)"; }}
            title={collapsed ? "Sign Out" : undefined}
          >
            {Ic.logout}
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Header component ─────────────────────────────────────────── */
function Header({
  collapsed,
  onToggleSidebar,
  onMobileOpen,
  pathname,
  pending,
}: {
  collapsed:      boolean;
  onToggleSidebar:() => void;
  onMobileOpen:   () => void;
  pathname:       string;
  pending:        number;
}) {
  const sidebarW = collapsed ? 72 : 260;

  /* Breadcrumb */
  const crumb = (() => {
    if (pathname === "/admin") return "Dashboard";
    const seg = pathname.split("/")[2];
    return seg ? seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ") : "Dashboard";
  })();

  return (
    <header
      className="fixed top-0 right-0 z-20 flex items-center gap-4 bg-white border-b transition-all duration-300"
      style={{
        left:        sidebarW,
        height:      64,
        borderColor: "#e2e8f0",
        padding:     "0 24px",
        boxShadow:   "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* Desktop collapse toggle */}
      <button
        onClick={onToggleSidebar}
        className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg transition-all"
        style={{ color: "#64748b", cursor: "pointer" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f1f5f9"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
      >
        {collapsed ? Ic.chevronRight : Ic.chevronLeft}
      </button>

      {/* Mobile hamburger */}
      <button
        onClick={onMobileOpen}
        className="flex md:hidden items-center justify-center w-8 h-8 rounded-lg"
        style={{ color: "#64748b", cursor: "pointer" }}
      >
        {Ic.menu}
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span style={{ color: "#94a3b8" }}>Admin</span>
        <span style={{ color: "#cbd5e1" }}>/</span>
        <span className="font-bold" style={{ color: "#1a3262" }}>{crumb}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div
        className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-2 text-sm"
        style={{ background: "#f8fafc", border: "1px solid #e2e8f0", minWidth: 200 }}
      >
        <span style={{ color: "#94a3b8" }}>{Ic.search}</span>
        <span style={{ color: "#cbd5e1" }}>Search…</span>
      </div>

      {/* Notification bell */}
      <button
        className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all"
        style={{ color: "#64748b", cursor: "pointer" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f1f5f9"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
      >
        {Ic.bell}
        {pending > 0 && (
          <span
            className="absolute top-1 right-1 flex items-center justify-center text-[9px] font-black rounded-full"
            style={{
              width: 16, height: 16,
              background: "#e8a020",
              color:      "#0e1f45",
            }}
          >
            {pending > 9 ? "9+" : pending}
          </span>
        )}
      </button>

      {/* Divider */}
      <div className="w-px h-6" style={{ background: "#e2e8f0" }} />

      {/* User pill */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
          style={{ background: "#1a3262", color: "#e8a020" }}
        >
          SA
        </div>
        <div className="hidden sm:block">
          <div className="text-xs font-bold leading-none mb-0.5" style={{ color: "#1a3262" }}>Super Admin</div>
          <div className="text-[10px]" style={{ color: "#94a3b8" }}>Administrator</div>
        </div>
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* LAYOUT                                                         */
/* ══════════════════════════════════════════════════════════════ */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  const [collapsed,   setCollapsed  ] = useState(false);
  const [mobileOpen,  setMobileOpen ] = useState(false);
  const [pending,     setPending    ] = useState(0);

  /* Restore collapse state */
  useEffect(() => {
    const stored = localStorage.getItem("em_sidebar_collapsed");
    if (stored === "true") {
      setTimeout(() => setCollapsed(true), 0);
    }
  }, []);

  function toggleSidebar() {
    setCollapsed((v) => {
      localStorage.setItem("em_sidebar_collapsed", String(!v));
      return !v;
    });
  }

  /* Refresh pending count on every navigation so the badge stays accurate */
  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { if (typeof d.pending === "number") setPending(d.pending); })
      .catch(() => {});
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const sidebarW = collapsed ? 72 : 260;

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        pending={pending}
        pathname={pathname}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main content shifted by sidebar width */}
      <div
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarW }}
      >
        <Header
          collapsed={collapsed}
          onToggleSidebar={toggleSidebar}
          onMobileOpen={() => setMobileOpen(true)}
          pathname={pathname}
          pending={pending}
        />

        {/* Page content — padded below the fixed header */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ paddingTop: 64 }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
