"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { label: "Competitions", href: "/#competitions", dropdown: false },
  { label: "Events",       href: "/#events",       dropdown: false },
  { label: "Exhibitions",  href: "/#exhibitions",  dropdown: false },
  { label: "About",        href: "/#about",        dropdown: false },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 shadow-md">

      {/* ── Tier 1: white top bar ── */}
      <div className="bg-white border-b border-gray-200 lg:pb-5 ">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between ">

          {/* Logo + Brand */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-14 h-14 flex-shrink-0">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="20" cy="20" r="20" fill="#1a3262" />
                <path d="M8 27 L20 11 L32 27" stroke="#e8a020" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M13 27 L20 17 L27 27" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <rect x="14" y="27" width="12" height="3.5" rx="1" fill="#e8a020"/>
                <circle cx="20" cy="9"  r="2.2" fill="white"/>
              </svg>
            </div>
            <div className="leading-none">
              <span className="text-4xl font-black tracking-tight text-[#1a3262]">
                Edu<span style={{ color: "#e8a020" }}>Mind</span>
              </span>
              <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mt-1">
                University Platform
              </p>
            </div>
          </Link>

          {/* Login area — mirrors SLIIT top-right layout */}
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase">
              Log in using your account on:
            </span>
            <Link
              href="/login"
              className="btn-pulse flex items-center gap-2 text-lg font-bold px-5 py-2 rounded border-2 transition-all duration-300 hover:scale-105"
              style={{
                borderColor: "#1a3262",
                color: "#1a3262",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#1a3262";
                (e.currentTarget as HTMLAnchorElement).style.color = "#e8a020";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color = "#1a3262";
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              EduMind Login
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden text-[#1a3262] p-1"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* ── Tier 2: dark navy nav bar ── */}
      <nav className="hidden md:block" style={{ backgroundColor: "#1a3262" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center h-14 gap-1">

            {/* Home icon */}
            <Link
              href="/"
              className="flex items-center justify-center w-9 h-9 rounded transition-colors hover:bg-white/10"
              style={{ color: "#e8a020" }}
              aria-label="Home"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </Link>

            <div className="w-px h-5 bg-white/15 mx-1" />

            {/* Nav items */}
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="nav-link flex items-center gap-1 px-4 h-full text-sm font-semibold transition-colors hover:bg-white/10"
                style={{ color: "#e8a020" }}
              >
                {item.label}
                {item.dropdown && (
                  <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-xl">
          <div className="px-6 py-4 flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-[#1a3262] font-semibold text-sm py-2 border-b border-gray-100 hover:pl-2 transition-all"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="mt-2 text-center font-bold text-sm px-5 py-2.5 rounded"
              style={{ backgroundColor: "#1a3262", color: "#e8a020" }}
            >
              EduMind Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
