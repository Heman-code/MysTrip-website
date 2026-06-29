"use client";

import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    name: "Aarav S.",
    college: "BBA, Manipal University Jaipur",
    text: "Honestly the best decision I made in first year. Was nervous going solo but within an hour it felt like I knew everyone. That's the MysTrip thing.",
    rating: 5,
    trip: "Jaipur Exploration",
    batch: "Sem 1, 2025",
    initial: "A",
  },
  {
    name: "Priya K.",
    college: "B.Tech CSE, MUJ",
    text: "The trek was hard but what hit different was the people. We still have a group chat that's more active than my college group. Unreal.",
    rating: 5,
    trip: "Kedarkantha Trek",
    batch: "Winter 2025",
    initial: "P",
  },
  {
    name: "Karan M.",
    college: "MBA, MUJ",
    text: "Coming from a metro, I was skeptical about a 'student travel company'. But these guys are legit. Organised, transparent, actually fun.",
    rating: 5,
    trip: "Udaipur Weekend",
    batch: "Oct 2025",
    initial: "K",
  },
];

function ReviewCard({ name, college, text, rating, trip, batch, initial, delay }: typeof testimonials[0] & { delay: number }) {
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
      className="flex flex-col rounded-2xl p-7 transition-all duration-700"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {/* Stars */}
      <div className="flex gap-1 mb-5">
        {Array.from({ length: rating }).map((_, i) => (
          <span key={i} className="text-lg" style={{ color: "#FFB001" }}>★</span>
        ))}
      </div>

      <p className="text-white/80 text-base leading-relaxed flex-1">
        &ldquo;{text}&rdquo;
      </p>

      <div className="flex items-center gap-3 mt-6 pt-5 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: "#FF6016" }}
        >
          {initial}
        </div>
        <div>
          <p className="font-bold text-white text-sm">{name}</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{college}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs font-semibold" style={{ color: "#FFB001" }}>{trip}</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{batch}</p>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (headingRef.current) observer.observe(headingRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24" style={{ background: "#01180F" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div
          ref={headingRef}
          className="mb-14 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)" }}
        >
          <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#FFB001" }}>
            Verified travellers only · No paid posts
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-16">
            <h2
              className="text-4xl lg:text-5xl font-bold text-white leading-tight"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Some people collect things.
              <br />
              <span style={{ color: "#FF6016" }}>We collect these.</span>
            </h2>
            <p className="text-white/40 max-w-sm text-base leading-relaxed lg:mb-1">
              You can only leave a review if you&apos;ve actually been on the trip.
              No exceptions. No paid posts. If it was mid, you&apos;d hear about it.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <ReviewCard key={t.name} {...t} delay={i * 120} />
          ))}
        </div>

        <p className="text-center text-sm mt-10" style={{ color: "rgba(255,255,255,0.2)" }}>
          Real verified reviews dropping after our July trips. Stay tuned.
        </p>
      </div>
    </section>
  );
}
