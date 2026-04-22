"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

/* ── Types ─────────────────────────────────────────────── */
interface BaseActivity {
  _id: string;
  name: string;
  description?: string;
  mainImage: string;
  subImages: string[];
}
interface EventItem extends BaseActivity { date: string; }
interface CompetitionItem extends BaseActivity { date: string; whoCanParticipate: string; }
interface ExhibitionItem extends BaseActivity { dates: string[]; }

type AnyActivity = EventItem | CompetitionItem | ExhibitionItem;

/* ── Helpers ────────────────────────────────────────────── */
function fmtDate(d: string | string[]) {
  if (Array.isArray(d)) {
    return d.map((s) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })).join(" · ");
  }
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getDate(a: AnyActivity): string | string[] {
  if ("dates" in a) return a.dates;
  return (a as EventItem | CompetitionItem).date;
}

/* ── Modal ──────────────────────────────────────────────── */
function Modal({ item, label, onClose }: { item: AnyActivity; label: string; onClose: () => void }) {
  const comp = item as CompetitionItem;
  const subImages = item.subImages.filter(Boolean);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center p-4"
      style={{ background: "rgba(14,31,69,0.72)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "#0e1f45", color: "#e8a020" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Main image */}
        {item.mainImage && (
          <div className="relative w-full" style={{ height: 300 }}>
            <Image
              src={item.mainImage}
              alt={item.name}
              fill
              className="object-cover rounded-t-2xl"
              unoptimized
            />
            {/* Category badge */}
            <span
              className="absolute top-4 left-4 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
              style={{ background: "rgba(232,160,32,0.18)", border: "1px solid rgba(232,160,32,0.5)", color: "#f0b84a" }}
            >
              {label}
            </span>
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          <h2 className="text-2xl font-black mb-2" style={{ color: "#1a3262" }}>{item.name}</h2>

          {/* Date */}
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="#e8a020" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-semibold" style={{ color: "#e8a020" }}>{fmtDate(getDate(item))}</span>
          </div>

          {/* Competition-specific */}
          {comp.whoCanParticipate && (
            <div
              className="flex items-start gap-2 mb-4 px-4 py-3 rounded-xl"
              style={{ background: "rgba(26,50,98,0.06)", border: "1px solid rgba(26,50,98,0.12)" }}
            >
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="#1a3262" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <span className="text-xs font-bold tracking-wide uppercase" style={{ color: "#1a3262" }}>Who can participate</span>
                <p className="text-sm mt-0.5 text-gray-600">{comp.whoCanParticipate}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <p className="text-sm leading-relaxed text-gray-600">{item.description}</p>
          )}

          {/* Sub-images grid */}
          {subImages.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#1a3262" }}>Gallery</p>
              <div className="grid grid-cols-3 gap-3">
                {subImages.map((src, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden" style={{ height: 110 }}>
                    <Image src={src} alt={`${item.name} ${i + 1}`} fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── helpers ────────────────────────────────────────────── */
function isUpcoming(dateVal: string | string[]): boolean {
  const earliest = Array.isArray(dateVal)
    ? Math.min(...dateVal.map((d) => new Date(d).getTime()))
    : new Date(dateVal).getTime();
  return earliest > Date.now();
}

/* ── Activity Card ──────────────────────────────────────── */
function ActivityCard({ item, label, onViewMore }: { item: AnyActivity; label: string; onViewMore: () => void }) {
  const dateVal = getDate(item);
  const upcoming = isUpcoming(dateVal);

  return (
    <div
      className="card-hover flex flex-col rounded-2xl overflow-hidden h-full relative"
      style={upcoming
        ? {
            background: "#0e1f45",
            border: "2px solid #e8a020",
            boxShadow: "0 0 0 4px rgba(232,160,32,0.12), 0 8px 32px rgba(14,31,69,0.22)",
          }
        : {
            background: "#fff",
            border: "1px solid #e8edf5",
            boxShadow: "0 2px 12px rgba(26,50,98,0.07)",
          }
      }
    >
      {/* Upcoming glow ring */}
      {upcoming && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(232,160,32,0.07) 0%, transparent 60%)" }}
        />
      )}

      {/* Image */}
      <div className="relative w-full shrink-0" style={{ height: 190 }}>
        {item.mainImage ? (
          <Image src={item.mainImage} alt={item.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: upcoming ? "#162a52" : "#e8edf5" }}>
            <svg className="w-10 h-10" fill="none" stroke={upcoming ? "#e8a020" : "#1a3262"} strokeOpacity="0.3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: upcoming ? "linear-gradient(to right, #e8a020, #f0b84a, #e8a020)" : "#e8a020" }}
        />

        {/* Category badge */}
        <span
          className="absolute top-3 left-3 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
          style={{ background: "rgba(14,31,69,0.75)", color: "#f0b84a", backdropFilter: "blur(4px)" }}
        >
          {label}
        </span>

        {/* Upcoming badge */}
        {upcoming && (
          <span
            className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{ background: "#e8a020", color: "#0e1f45" }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#0e1f45" }} />
            Upcoming
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        {/* Date */}
        <div className="flex items-center gap-1.5 mb-2">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="#e8a020" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-semibold" style={{ color: "#e8a020" }}>{fmtDate(dateVal)}</span>
        </div>

        {/* Title */}
        <h3
          className="font-bold text-base leading-snug mb-2 line-clamp-2"
          style={{ color: upcoming ? "#ffffff" : "#1a3262" }}
        >
          {item.name}
        </h3>

        {/* Description */}
        {item.description && (
          <p
            className="text-sm leading-relaxed line-clamp-3 flex-1"
            style={{ color: upcoming ? "#a0b8d8" : "#6b7280" }}
          >
            {item.description}
          </p>
        )}

        {/* View More */}
        <button
          onClick={onViewMore}
          className="group mt-4 flex items-center gap-2 text-sm font-bold self-start px-5 py-2 rounded-full transition-all duration-300 hover:scale-105"
          style={upcoming
            ? { background: "#e8a020", color: "#0e1f45" }
            : { background: "#1a3262", color: "#e8a020" }
          }
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = upcoming ? "#f0b84a" : "#e8a020";
            btn.style.color = "#0e1f45";
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = upcoming ? "#e8a020" : "#1a3262";
            btn.style.color = upcoming ? "#0e1f45" : "#e8a020";
          }}
        >
          View More
          <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Carousel ───────────────────────────────────────────── */
const GAP = 24;
const VISIBLE = 3;

function Carousel({ items, label }: { items: AnyActivity[]; label: string }) {
  const [activeModal, setActiveModal] = useState<AnyActivity | null>(null);
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);

  useEffect(() => {
    const calc = () => {
      if (containerRef.current) {
        setCardWidth((containerRef.current.offsetWidth - GAP * (VISIBLE - 1)) / VISIBLE);
      }
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const maxIndex = Math.max(0, items.length - VISIBLE);
  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const next = useCallback(() => setCurrent((c) => Math.min(maxIndex, c + 1)), [maxIndex]);
  const translateX = current * (cardWidth + GAP);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-medium">No {label.toLowerCase()} found</p>
      </div>
    );
  }

  return (
    <>
      {activeModal && (
        <Modal item={activeModal} label={label} onClose={() => setActiveModal(null)} />
      )}

      <div className="relative px-6">
        {/* Overflow container */}
        <div ref={containerRef} className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ gap: GAP, transform: `translateX(-${translateX}px)` }}
          >
            {items.map((item) => (
              <div
                key={item._id}
                className="shrink-0"
                style={{ width: cardWidth || `calc((100% - ${GAP * (VISIBLE - 1)}px) / ${VISIBLE})` }}
              >
                <ActivityCard item={item} label={label} onViewMore={() => setActiveModal(item)} />
              </div>
            ))}
          </div>
        </div>

        {/* Prev / Next */}
        {current > 0 && (
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 z-10"
            style={{ background: "#1a3262", color: "#e8a020" }}
            aria-label="Previous"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {current < maxIndex && (
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 z-10"
            style={{ background: "#1a3262", color: "#e8a020" }}
            aria-label="Next"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Dot indicators */}
        {items.length > VISIBLE && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="rounded-full transition-all duration-300"
                style={i === current
                  ? { width: 28, height: 8, background: "#e8a020" }
                  : { width: 8, height: 8, background: "#d1dae8" }
                }
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ── Section ────────────────────────────────────────────── */
function ActivitySection({
  id, title, icon, items, label, loading,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: AnyActivity[];
  label: string;
  loading: boolean;
}) {
  return (
    <section id={id} className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-end gap-4 mb-10">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(26,50,98,0.08)" }}
          >
            {icon}
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "#e8a020" }}>
              EduMind
            </p>
            <h2 className="text-3xl font-black leading-none" style={{ color: "#1a3262" }}>
              {title}
            </h2>
          </div>
          {/* Gold accent line */}
          <div className="flex-1 h-px ml-4 hidden sm:block" style={{ background: "linear-gradient(to right, #e8a020, transparent)" }} />
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((k) => (
              <div key={k} className="rounded-2xl overflow-hidden animate-pulse" style={{ border: "1px solid #e8edf5" }}>
                <div className="h-48 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-1/3 rounded bg-gray-100" />
                  <div className="h-4 w-3/4 rounded bg-gray-100" />
                  <div className="h-3 w-full rounded bg-gray-100" />
                  <div className="h-3 w-5/6 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Carousel items={items} label={label} />
        )}
      </div>
    </section>
  );
}

/* ── Root component ─────────────────────────────────────── */
export default function ActivitiesSection() {
  const [competitions, setCompetitions] = useState<CompetitionItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [exhibitions, setExhibitions] = useState<ExhibitionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/activities/competitions").then((r) => r.json()),
      fetch("/api/activities/events").then((r) => r.json()),
      fetch("/api/activities/exhibitions").then((r) => r.json()),
    ]).then(([c, e, ex]) => {
      setCompetitions(c);
      setEvents(e);
      setExhibitions(ex);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const CompIcon = (
    <svg className="w-6 h-6" fill="none" stroke="#1a3262" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
  const EventIcon = (
    <svg className="w-6 h-6" fill="none" stroke="#1a3262" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
  const ExhibIcon = (
    <svg className="w-6 h-6" fill="none" stroke="#1a3262" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );

  return (
    <>
      {/* Thin divider between hero and first section */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(to right, #1a3262, #e8a020, #1a3262)" }} />

      <ActivitySection
        id="competitions"
        title="Competitions"
        icon={CompIcon}
        items={competitions}
        label="Competition"
        loading={loading}
      />

      <div className="h-px mx-auto max-w-6xl" style={{ background: "#e8edf5" }} />

      <ActivitySection
        id="events"
        title="Events"
        icon={EventIcon}
        items={events}
        label="Event"
        loading={loading}
      />

      <div className="h-px mx-auto max-w-6xl" style={{ background: "#e8edf5" }} />

      <ActivitySection
        id="exhibitions"
        title="Exhibitions"
        icon={ExhibIcon}
        items={exhibitions}
        label="Exhibition"
        loading={loading}
      />
    </>
  );
}
