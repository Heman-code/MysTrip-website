"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

const cyclingWords = ["Strangers.", "Friends.", "A Tribe.", "Your People."];

// Hero bg cycles through real trip photos
const heroBgs = [
  { src: "/trips/hero-udaipur-cliff-group-2.jpg",    label: "Udaipur" },
  { src: "/trips/hero-kedarkantha-blizzard-2.jpg",   label: "Kedarkantha Trek" },
  { src: "/trips/hero-jaisalmer-sunset-2.jpg",       label: "Jaisalmer" },
  { src: "/trips/hero-mount-sumel-sunset-2.jpg",     label: "Mount Sumel" },
  { src: "/trips/hero-raghunath-drone-2.jpg",        label: "Raghunath Fort" },
];

export default function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [bgIndex, setBgIndex] = useState(0);
  const [bgFade, setBgFade] = useState(true);

  useEffect(() => {
    const wordTimer = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % cyclingWords.length);
        setWordVisible(true);
      }, 300);
    }, 2400);
    return () => clearInterval(wordTimer);
  }, []);

  useEffect(() => {
    const bgTimer = setInterval(() => {
      setBgFade(false);
      setTimeout(() => {
        setBgIndex((i) => (i + 1) % heroBgs.length);
        setBgFade(true);
      }, 600);
    }, 5000);
    return () => clearInterval(bgTimer);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">

      {/* Background photo — cycles */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: bgFade ? 1 : 0 }}
      >
        <Image
          src={heroBgs[bgIndex].src}
          alt={heroBgs[bgIndex].label}
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
          quality={90}
        />
      </div>

      {/* Gradient overlays for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      {/* Grain texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "200px" }} />

      {/* Content */}
      <div className="relative flex-1 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-10 sm:pb-20">
        <div className="max-w-2xl">

          {/* Awards */}
          <div className="flex flex-row flex-wrap gap-2 mb-5 hero-fade-in" style={{ animationDelay: "0.05s" }}>
            <span className="text-[10px] sm:text-xs font-semibold px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full backdrop-blur-sm whitespace-nowrap"
              style={{ background: "rgba(255,176,1,0.15)", color: "#FFB001", border: "1px solid rgba(255,176,1,0.25)" }}>
              🏆 <span className="sm:hidden">Travel Experience of the Year</span><span className="hidden sm:inline">Student Travel Experience of the Year — India</span>
            </span>
            <span className="text-[10px] sm:text-xs font-semibold px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full backdrop-blur-sm whitespace-nowrap"
              style={{ background: "rgba(255,176,1,0.15)", color: "#FFB001", border: "1px solid rgba(255,176,1,0.25)" }}>
              🏆 <span className="sm:hidden">Best AI Travel Planner</span><span className="hidden sm:inline">Best AI-Powered Personal Travel Planner — India</span>
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-[2.6rem] sm:text-6xl lg:text-[5.5rem] font-bold leading-[1.08] text-white hero-fade-in"
            style={{ fontFamily: "'Clash Display', sans-serif", letterSpacing: "-0.025em", animationDelay: "0.15s" }}
          >
            You start as
            <br />
            <span
              style={{
                color: "#FF6016",
                display: "inline-block",
                opacity: wordVisible ? 1 : 0,
                transform: wordVisible ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.28s ease, transform 0.28s ease",
              }}
            >
              {cyclingWords[wordIndex]}
            </span>
          </h1>

          <p
            className="mt-4 text-sm sm:text-base sm:text-lg leading-relaxed hero-fade-in"
            style={{ color: "rgba(255,255,255,0.65)", maxWidth: "380px", animationDelay: "0.28s" }}
          >
            We did the planning. You do the showing up.
            Your people are already on the list.
          </p>

          <p className="mt-2 text-[10px] sm:text-sm font-semibold hero-fade-in" style={{ color: "#FF6016", animationDelay: "0.35s" }}>
            <span className="sm:hidden">Sundarone Hostels · AIC-MUJ</span>
            <span className="hidden sm:inline">Official Travel Partner of Sundarone Hostels · Registered under AIC-MUJ</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-row flex-wrap gap-2.5 mt-7 hero-fade-in" style={{ animationDelay: "0.45s" }}>
            <Link
              href="/trips"
              className="group inline-flex items-center gap-1.5 px-5 py-2.5 sm:px-8 sm:py-4 rounded-full font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: "#FF6016" }}
            >
              Explore Trips
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/sundarone"
              className="inline-flex items-center gap-1 px-5 py-2.5 sm:px-8 sm:py-4 rounded-full font-semibold text-sm backdrop-blur-sm transition-all hover:bg-white/10 active:scale-95"
              style={{ border: "1.5px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.8)" }}
            >
              Sundarone →
            </Link>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-6 gap-y-4 sm:gap-8 mt-8 sm:mt-12 pt-7 sm:pt-10 border-t hero-fade-in"
            style={{ borderColor: "rgba(255,255,255,0.1)", animationDelay: "0.55s" }}
          >
            {[
              { num: "900+", label: "Students" },
              { num: "2", label: "National Awards" },
              { num: "12,500 ft", label: "Summited" },
              { num: "17+", label: "Trips Done" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>{s.num}</p>
                <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Photo location indicator */}
      <div className="absolute bottom-28 right-6 lg:right-10 flex items-center gap-2">
        {heroBgs.map((bg, i) => (
          <button
            key={bg.src}
            onClick={() => { setBgFade(false); setTimeout(() => { setBgIndex(i); setBgFade(true); }, 300); }}
            className="transition-all duration-300"
            aria-label={bg.label}
          >
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: i === bgIndex ? "24px" : "6px",
                height: "6px",
                background: i === bgIndex ? "#FF6016" : "rgba(255,255,255,0.4)",
              }}
            />
          </button>
        ))}
      </div>

      {/* Recognition bar — single-line, auto-scrolling, seamless loop */}
      <div className="relative border-t backdrop-blur-sm overflow-hidden" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.3)" }}>
        <div className="py-2.5 sm:py-3.5">
          <div className="flex items-center w-max hero-marquee">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex items-center gap-5 sm:gap-8 pr-5 sm:pr-8 flex-shrink-0" aria-hidden={dup === 1}>
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest whitespace-nowrap flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>Recognised by</span>
                {["AIC-MUJ", "Sundarone Hostels", "Travel & Tourism Awards 2026"].map((org) => (
                  <span key={org} className="text-[11px] sm:text-sm font-semibold whitespace-nowrap flex-shrink-0" style={{ color: "rgba(255,255,255,0.5)" }}>{org}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-[4.5rem] left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1.5"
        style={{ animation: "scrollBounce 2.2s ease-in-out infinite" }}>
        <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>Scroll</span>
        <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
      </div>

      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-fade-in { opacity: 0; animation: heroFadeIn 0.65s ease forwards; }
        @keyframes scrollBounce {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%      { transform: translateX(-50%) translateY(7px); }
        }
        @keyframes heroMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .hero-marquee { animation: heroMarquee 18s linear infinite; }
      `}</style>
    </section>
  );
}
