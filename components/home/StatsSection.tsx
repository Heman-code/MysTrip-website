"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: "900+", label: "Students Travelled", sub: "From Manipal University Jaipur & beyond" },
  { value: "2", label: "National Awards", sub: "Travel & Tourism Awards 2026 — India" },
  { value: "12,500 ft", label: "Highest Summit", sub: "Kedarkantha Trek — no one turned back" },
  { value: "0", label: "Fake Reviews", sub: "Only verified travellers can drop a review" },
];

function StatCard({ value, label, sub, delay }: { value: string; label: string; sub: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="text-center px-4 transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)", transitionDelay: `${delay}ms` }}
    >
      <p className="text-5xl lg:text-6xl font-bold" style={{ fontFamily: "'Clash Display', sans-serif", color: "#FF6016" }}>
        {value}
      </p>
      <p className="mt-3 font-bold text-gray-900 text-base">{label}</p>
      <p className="text-sm text-gray-400 mt-1.5 max-w-[200px] mx-auto leading-snug">{sub}</p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="py-24 border-b" style={{ background: "#FFEFDD", borderColor: "#f5dfc4" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 divide-x-0 lg:divide-x" style={{ ["--tw-divide-opacity" as string]: "1" }}>
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 110} />
          ))}
        </div>
      </div>
    </section>
  );
}
