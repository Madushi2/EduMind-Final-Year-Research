"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Calendar() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [activityDates, setActivityDates] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/activities/events").then((r) => r.json()),
      fetch("/api/activities/competitions").then((r) => r.json()),
      fetch("/api/activities/exhibitions").then((r) => r.json()),
    ]).then(([events, competitions, exhibitions]) => {
      const map: Record<string, string[]> = {};

      const add = (dateStr: string, name: string) => {
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);
        if (d < today) return;
        const key = toDateKey(d);
        if (!map[key]) map[key] = [];
        if (!map[key].includes(name)) map[key].push(name);
      };

      for (const e of events)       add(e.date, e.name);
      for (const c of competitions) add(c.date, c.name);
      for (const ex of exhibitions) for (const d of ex.dates) add(d, ex.name);

      setActivityDates(Object.fromEntries(
        Object.entries(map).map(([k, names]) => [k, names.join(", ")])
      ));
    }).catch(() => {});
  }, []);

  const handleDayClick = (_dateKey: string, label: string) => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlash(label);
    flashTimer.current = setTimeout(() => setFlash(null), 2000);
  };

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div
      className="rounded-2xl p-5 w-full max-w-sm border"
      style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)" }}
    >
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1 transition-colors"
          style={{ color: "rgba(255,255,255,0.5)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#e8a020")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)")}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-white font-bold text-sm tracking-wide">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1 transition-colors"
          style={{ color: "rgba(255,255,255,0.5)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#e8a020")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)")}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold uppercase py-1"
            style={{ color: "rgba(255,255,255,0.35)" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateKey === toDateKey(today);
          const label   = activityDates[dateKey];
          const hasActivity = !!label;

          return (
            <div key={day} className="flex flex-col items-center">
              <button
                onClick={() => hasActivity && handleDayClick(dateKey, label)}
                className="w-7 h-7 flex items-center justify-center text-xs font-medium rounded-full transition-all duration-200"
                style={
                  isToday
                    ? { background: "#e8a020", color: "#1a3262", fontWeight: 900 }
                    : hasActivity
                    ? { background: "rgba(232,160,32,0.18)", color: "#f0b84a", fontWeight: 700, cursor: "pointer" }
                    : { color: "rgba(255,255,255,0.55)", cursor: "default" }
                }
                onMouseEnter={(e) => {
                  if (!hasActivity || isToday) return;
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,160,32,0.35)";
                }}
                onMouseLeave={(e) => {
                  if (!hasActivity || isToday) return;
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,160,32,0.18)";
                }}
              >
                {day}
              </button>
              {hasActivity && !isToday && (
                <span className="w-1 h-1 rounded-full mt-0.5" style={{ background: "#e8a020" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Flash label */}
      <div
        className="mt-3 overflow-hidden transition-all duration-300"
        style={{ maxHeight: flash ? 48 : 0, opacity: flash ? 1 : 0 }}
      >
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
          style={{ background: "rgba(232,160,32,0.15)", border: "1px solid rgba(232,160,32,0.3)", color: "#f0b84a" }}
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="truncate">{flash}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#e8a020" }} /> Today
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: "rgba(232,160,32,0.18)", border: "1px solid rgba(232,160,32,0.4)" }} /> Upcoming
        </span>
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer style={{ background: "#0e1f45" }} className="text-white">

      {/* CTA banner */}
      <div style={{ background: "#e8a020" }} className="py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black" style={{ color: "#0e1f45" }}>Ready to get started?</h3>
            <p className="font-medium mt-1" style={{ color: "rgba(15,22,36,0.7)" }}>
              Join thousands of students already on EduMind.
            </p>
          </div>
          <Link
            href="/login"
            className="font-bold px-8 py-3.5 rounded-full transition-all duration-300 hover:scale-105 shadow-lg whitespace-nowrap"
            style={{ background: "#1a3262", color: "#e8a020" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#1e3d72")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#1a3262")}
          >
            Create Your Account
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="20" fill="#1a3262" />
                  <path d="M8 27 L20 11 L32 27" stroke="#e8a020" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M13 27 L20 17 L27 27" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <rect x="14" y="27" width="12" height="3.5" rx="1" fill="#e8a020"/>
                  <circle cx="20" cy="9" r="2.2" fill="white"/>
                </svg>
              </div>
              <div>
                <div className="text-xl font-black text-white">
                  Edu<span style={{ color: "#e8a020" }}>Mind</span>
                </div>
                <div className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
                  University Platform
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
              Empowering university students to connect, compete, and grow. Your one-stop platform for campus life.
            </p>
            <div className="flex gap-3">
              {["facebook", "twitter", "instagram", "linkedin"].map((social) => (
                <a
                  key={social}
                  href="#"
                  aria-label={social}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#e8a020";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#1a3262";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.5)";
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Explore links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: "#e8a020" }}>
              Explore
            </h4>
            <ul className="space-y-3">
              {[
                ["Competitions", "/competitions"],
                ["Events", "/events"],
                ["Exhibitions", "/exhibitions"],
                ["About EduMind", "/about"],
                ["Contact Us", "/contact"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm flex items-center gap-2 group transition-colors"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#e8a020")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.5)")}
                  >
                    <span className="w-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: "#e8a020" }}>
              Resources
            </h4>
            <ul className="space-y-3">
              {[
                ["Student Portal", "/portal"],
                ["Academic Calendar", "/calendar"],
                ["Campus Map", "/map"],
                ["Help & Support", "/support"],
                ["Privacy Policy", "/privacy"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm flex items-center gap-2 transition-colors"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#e8a020")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.5)")}
                  >
                    <span className="w-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Calendar */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: "#e8a020" }}>
              Upcoming Events
            </h4>
            <Calendar />
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="border-t mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
          style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}
        >
          <span>© 2026 EduMind. All rights reserved.</span>
          <div className="flex gap-6">
            {[["Terms of Service", "/terms"], ["Privacy Policy", "/privacy"], ["Cookie Policy", "/cookies"]].map(
              ([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="transition-colors"
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#e8a020")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.3)")}
                >
                  {label}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
