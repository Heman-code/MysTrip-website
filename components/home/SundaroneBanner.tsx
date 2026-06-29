"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

export default function SundaroneBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className="rounded-3xl overflow-hidden relative transition-all duration-700"
          style={{
            background: "linear-gradient(135deg, #0a0c1a 0%, #0e1020 40%, #0c0e1c 100%)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(36px) scale(0.98)",
          }}
        >
          {/* Sundarone orange accent glow */}
          <div className="absolute top-0 right-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(255,120,0,0.08)" }} />
          {/* Blue glow */}
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(30,60,180,0.07)" }} />

          {/* Top label */}
          <div className="px-10 md:px-14 pt-10 flex items-center gap-3">
            <span
              className="text-xs font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full"
              style={{ background: "rgba(255,120,0,0.15)", color: "#FF7800", border: "1px solid rgba(255,120,0,0.25)" }}
            >
              Official Travel Partner
            </span>
            <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.25)" }}>
              Sundarone Hostels × MysTrip
            </span>
          </div>

          <div className="px-10 md:px-14 pb-12 pt-7 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
            <div className="max-w-xl">
              <h2
                className="text-3xl lg:text-5xl font-bold text-white leading-tight"
                style={{ fontFamily: "'Clash Display', sans-serif", letterSpacing: "-0.02em" }}
              >
                Living at Sundarone?
                <br />
                <span style={{ color: "#FF7800" }}>Your tribe is waiting.</span>
              </h2>

              <p className="mt-5 text-sm leading-relaxed max-w-md" style={{ color: "rgba(255,255,255,0.45)" }}>
                Semester planned. Budget sorted. People you&apos;d actually want in your group chat.
                The Sundarone travel calendar is built exclusively for hostel residents —
                and the first trip is closer than you think.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mt-8">
                {[
                  { icon: "📅", text: "Synced with MUJ academic calendar" },
                  { icon: "💰", text: "Exclusive pricing for residents" },
                  { icon: "🏕️", text: "First event: July 15, 2026" },
                  { icon: "🤝", text: "AIC-MUJ registered partnership" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-2.5">
                    <span className="text-sm mt-0.5 flex-shrink-0">{item.icon}</span>
                    <span className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-4 flex-shrink-0">
              <Link
                href="/sundarone"
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ background: "#FF7800" }}
              >
                View Sundarone Events
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                Sundarone One Hostel · Dahmi Kalan, Jaipur 303007
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
