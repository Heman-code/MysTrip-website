"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const pillars = [
  {
    emoji: "🫂",
    title: "Tribe, Not Tourists",
    description:
      "We don't put you on a bus with strangers. We build a group you'd actually want in your group chat — then we send you on a trip together.",
  },
  {
    emoji: "✅",
    title: "No Fake Reviews",
    description:
      "Only people who've actually been on the trip can leave a review. No paid posts. No fake profiles. If the trip was mid, you'd know.",
  },
  {
    emoji: "🎒",
    title: "Transparent, Always",
    description:
      "Full pricing upfront. No 'plus taxes, plus this, plus that.' What you see is what you pay. What we plan is what you get.",
  },
  {
    emoji: "🏆",
    title: "Award-Winning Experiences",
    description:
      "India's only student travel community to win 'Student Travel Experience of the Year.' Two national awards. We take this seriously.",
  },
];

function PillarCard({ emoji, title, description, delay }: typeof pillars[0] & { delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group relative bg-white rounded-2xl p-7 hover:shadow-xl transition-all duration-500 cursor-default overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, box-shadow 0.3s ease`,
      }}
    >
      {/* Hover accent */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{ background: "linear-gradient(135deg, rgba(255,96,22,0.04) 0%, transparent 60%)" }}
      />

      <div className="text-3xl mb-5">{emoji}</div>
      <h3
        className="text-xl font-bold text-gray-900 mb-3"
        style={{ fontFamily: "'Clash Display', sans-serif" }}
      >
        {title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl"
        style={{ background: "#FF6016" }}
      />
    </div>
  );
}

export default function WhyMysTrip() {
  const headingRef = useRef<HTMLDivElement>(null);
  const [headingVisible, setHeadingVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHeadingVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (headingRef.current) observer.observe(headingRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 overflow-hidden" style={{ background: "#FFEFDD" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div
          ref={headingRef}
          className="mb-14 transition-all duration-700"
          style={{ opacity: headingVisible ? 1 : 0, transform: headingVisible ? "translateY(0)" : "translateY(24px)" }}
        >
          <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#FF6016" }}>
            Why MysTrip
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-16">
            <h2
              className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Travel&apos;s better with people
              <br />
              <span style={{ color: "#FF6016" }}>who actually get it.</span>
            </h2>
            <p className="text-gray-500 max-w-sm text-base leading-relaxed lg:mb-1">
              We summited 12,500 ft on the Kedarkantha because we wanted that experience — not because it was the cheapest option. Every trip starts with one question: is this actually worth doing?
            </p>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p, i) => (
            <PillarCard key={p.title} {...p} delay={i * 100} />
          ))}
        </div>

        {/* Bottom mascot strip */}
        <div
          className="mt-16 rounded-2xl flex flex-col md:flex-row items-center gap-8 px-8 py-10 overflow-hidden relative"
          style={{ background: "#01574A" }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-48 opacity-10 pointer-events-none select-none">
            <Image src="/logo-mark.png" alt="" fill className="object-contain object-right" aria-hidden />
          </div>
          <div className="flex-1 relative">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#FFB001" }}>
              Our voice
            </p>
            <p
              className="text-2xl lg:text-3xl font-bold text-white leading-snug"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              &ldquo;Not a tour. Not a package.
              <br />A bunch of strangers who become your people.&rdquo;
            </p>
          </div>
          <div className="flex-shrink-0">
            <p className="text-sm text-green-200 text-center md:text-right leading-relaxed max-w-xs">
              2 national awards. 900+ students.<br />
              12,500 ft summited. Zero compromises.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
