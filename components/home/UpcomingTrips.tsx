"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { formatDateRange } from "@/lib/data/trips";
import type { TripCardData } from "@/lib/db/trips";
import { formatCurrency } from "@/lib/utils";

const diffColors: Record<string, { bg: string; text: string }> = {
  Easy:     { bg: "#dcfce7", text: "#166534" },
  Moderate: { bg: "#fef9c3", text: "#854d0e" },
  Hard:     { bg: "#fee2e2", text: "#991b1b" },
};

function TripCard({ trip, delay }: { trip: TripCardData; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const slotsLeft = trip.maxSlots - trip.bookedSlots;
  const pct = Math.round((trip.bookedSlots / trip.maxSlots) * 100);
  const dc = diffColors[trip.difficulty] ?? { bg: "#f3f4f6", text: "#374151" };

  return (
    <div
      ref={ref}
      className="shrink-0 w-[78%] xs:w-[70%] snap-center sm:w-auto sm:shrink transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transitionDelay: `${delay}ms` }}
    >
      <Link
        href={`/trips/${trip.slug}`}
        className="group block rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white"
      >
        {/* Cover photo */}
        <div className="h-40 sm:h-56 relative overflow-hidden">
          <Image
            src={trip.coverImage}
            alt={trip.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 78vw, (max-width: 768px) 70vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

          <div className="absolute top-4 left-4">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: trip.tagColor }}>
              {trip.tag}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: dc.bg, color: dc.text }}>
              {trip.difficulty}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium text-white/55 uppercase tracking-wide mb-0.5">{trip.destination}</p>
            <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-[#FFB001] transition-colors" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              {trip.title}
            </h3>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <p className="text-[11px] sm:text-xs text-gray-400 mb-2 sm:mb-3">📅 {formatDateRange(trip.startDate, trip.endDate)}{trip.departureTime ? ` · ${trip.departureTime}` : ""}</p>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2">{trip.shortDescription}</p>

          {/* Slot bar */}
          <div className="mt-3 sm:mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>{slotsLeft} slots left</span>
              <span>{pct}% filled</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: visible ? `${pct}%` : "0%", background: pct > 75 ? "#ef4444" : trip.tagColor, transitionDelay: `${delay + 400}ms` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3.5 sm:mt-5 pt-3.5 sm:pt-5 border-t border-gray-50">
            <div>
              <p className="text-[11px] sm:text-xs font-medium" style={{ color: "#FF6016" }}>
                {trip.registrationOpen ? formatCurrency(trip.basePrice) : "Price revealing soon"}
              </p>
            </div>
            <span
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-white transition-all group-hover:gap-2.5"
              style={{ background: trip.tagColor }}
            >
              Know More <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function UpcomingTrips({ featuredTrips, totalTripsCount }: { featuredTrips: TripCardData[]; totalTripsCount: number }) {
  const headingRef = useRef<HTMLDivElement>(null);
  const [headingVisible, setHeadingVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHeadingVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (headingRef.current) observer.observe(headingRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-12 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headingRef}
          className="flex items-end justify-between mb-6 sm:mb-14 transition-all duration-700"
          style={{ opacity: headingVisible ? 1 : 0, transform: headingVisible ? "translateY(0)" : "translateY(24px)" }}
        >
          <div>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-2 sm:mb-3" style={{ color: "#FF6016" }}>
              July – December 2026
            </p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Upcoming Trips.
              <br />
              <span style={{ color: "#01574A" }}>Slots filling fast.</span>
            </h2>
          </div>
          <Link href="/trips" className="hidden md:inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all" style={{ color: "#FF6016" }}>
            View all {totalTripsCount} trips <ArrowRight size={16} />
          </Link>
        </div>

        {/* Swipeable on mobile, grid from md up */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-3 scrollbar-none md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3 md:overflow-visible md:mx-0 md:px-0 md:pb-0">
          {featuredTrips.map((trip, i) => (
            <TripCard key={trip.id} trip={trip} delay={i * 100} />
          ))}

          {/* "See all" filler card */}
          <div
            className="shrink-0 w-[78%] xs:w-[70%] snap-center sm:w-auto sm:shrink rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 sm:p-10 text-center min-h-[280px] sm:min-h-[420px]"
            style={{ borderColor: "#FFEFDD" }}
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-5 text-xl sm:text-2xl" style={{ background: "#FFEFDD" }}>
              🗓️
            </div>
            <p className="text-base sm:text-xl font-bold text-gray-800" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              {Math.max(totalTripsCount - 3, 0)} More Adventures
            </p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1.5 sm:mt-2 max-w-[180px] leading-relaxed">
              Treks, weekend escapes, Rishikesh, Ranthambore & Jaisalmer.
            </p>
            <Link
              href="/trips"
              className="mt-4 sm:mt-6 text-xs sm:text-sm font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-full transition-all hover:opacity-90"
              style={{ background: "#FFEFDD", color: "#FF6016" }}
            >
              See Full Calendar →
            </Link>
          </div>
        </div>

        {/* Mobile-only "view all" link below the carousel */}
        <Link href="/trips" className="md:hidden mt-5 inline-flex items-center gap-2 text-sm font-bold" style={{ color: "#FF6016" }}>
          View all {totalTripsCount} trips <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
