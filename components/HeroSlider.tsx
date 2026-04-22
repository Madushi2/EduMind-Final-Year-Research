"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=1600&q=80",
    tag: "Welcome to EduMind",
    title: "Empower Your\nUniversity Journey",
    subtitle: "Connect. Compete. Collaborate — all in one place built for students like you.",
    cta: "Get Started",
    ctaHref: "#activities",
  },
  {
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1600&q=80",
    tag: "Competitions",
    title: "Rise to Every\nChallenge",
    subtitle: "Participate in inter-university competitions, hackathons, and academic contests to prove your potential.",
    cta: "View Competitions",
    ctaHref: "#competitions",
  },
  {
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80",
    tag: "Events & Exhibitions",
    title: "Explore. Connect.\nGrow.",
    subtitle: "Attend campus events, exhibitions, and fairs that shape your academic and professional future.",
    cta: "Browse Events",
    ctaHref: "#events",
  },
  {
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1600&q=80",
    tag: "Academic Excellence",
    title: "Your Future Starts\nHere Today",
    subtitle: "Access resources, mentors, and opportunities that give you the competitive edge in every field.",
    cta: "Explore Resources",
    ctaHref: "#exhibitions",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (animating) return;
      setAnimating(true);
      setCurrent(index);
      setTimeout(() => setAnimating(false), 1000);
    },
    [animating]
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5500);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    /* pt accounts for fixed header: 80px on mobile (top bar only), 136px on md+ (top bar + nav) */
    <section className="relative w-full overflow-hidden pt-20 md:pt-[136px]" style={{ minHeight: "80vh" }}>
      {/* Background images */}
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 top-20 md:top-[136px] transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <Image
            src={s.image}
            alt={s.title}
            fill
            className="object-cover"
            priority={i === 0}
            unoptimized
          />
        </div>
      ))}

      {/* Dark navy gradient overlay — matches SLIIT deep blue */}
      <div
        className="absolute inset-0 top-20 md:top-[136px]"
        style={{
          background: "linear-gradient(to right, rgba(15,22,36,0.88) 0%, rgba(22,32,53,0.72) 55%, rgba(22,32,53,0.25) 100%)",
        }}
      />
      <div
        className="absolute inset-0 top-20 md:top-[136px]"
        style={{
          background: "linear-gradient(to top, rgba(15,22,36,0.75) 0%, transparent 60%)",
        }}
      />

      {/* Slide content */}
      <div className="relative z-10 flex min-h-[calc(80vh-80px)] items-center py-12 md:min-h-[calc(80vh-136px)] md:py-16">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-4xl" key={current}>

            {/* Tag badge */}
            <span
              className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5 border"
              style={{ background: "rgba(232,160,32,0.18)", borderColor: "rgba(232,160,32,0.45)", color: "#f0b84a" }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#e8a020" }} />
              {slide.tag}
            </span>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6 whitespace-pre-line drop-shadow-lg">
              {slide.title}
            </h1>

            <p className="text-lg md:text-xl leading-relaxed mb-6 max-w-lg" style={{ color: "#c8d8f0" }}>
              {slide.subtitle}
            </p>

            <div className="hidden md:flex gap-10 mb-8">
              {[
                { number: "12K+", label: "Students" },
                { number: "300+", label: "Events per Year" },
                { number: "50+", label: "Competitions" },
                { number: "20+", label: "Departments" },
              ].map((stat) => (
                <div key={stat.label} className="count-up">
                  <div className="text-2xl font-black" style={{ color: "#e8a020" }}>{stat.number}</div>
                  <div className="text-xs font-medium tracking-wide" style={{ color: "#a0b8d8" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href={slide.ctaHref}
                className="group flex items-center gap-2 font-bold px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg hover:scale-105"
                style={{ background: "#e8a020", color: "#0e1f45" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#f0b84a")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#e8a020")}
              >
                {slide.cta}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href="#activities"
                className="glass flex items-center gap-2 font-semibold text-white px-8 py-3.5 rounded-full hover:bg-white/20 transition-all duration-300"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="transition-all duration-300 rounded-full"
            style={
              i === current
                ? { width: 32, height: 10, background: "#e8a020" }
                : { width: 10, height: 10, background: "rgba(255,255,255,0.4)" }
            }
          />
        ))}
      </div>

      {/* Arrow controls */}
      <button
        onClick={() => goTo((current - 1 + slides.length) % slides.length)}
        className="glass absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => goTo((current + 1) % slides.length)}
        className="glass absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}
