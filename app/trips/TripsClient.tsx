"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { formatDateRange, daysUntil, nightCount, type Trip } from "@/lib/data/trips";
import { formatCurrency } from "@/lib/utils";

type FilterKey = "all" | "trek" | "day" | "weekend" | "multi";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",     label: "Everything" },
  { key: "day",     label: "Day Trips" },
  { key: "trek",    label: "Treks" },
  { key: "weekend", label: "Weekends" },
  { key: "multi",   label: "Multi-day" },
];

function matchFilter(trip: Trip, filter: FilterKey) {
  if (filter === "all") return true;
  if (filter === "trek") return trip.category === "trek";
  if (filter === "day") return trip.category === "day_exploration" || trip.category === "parents_event";
  if (filter === "weekend") return trip.category === "weekend_escape";
  if (filter === "multi") return trip.category === "post_midterm" || trip.category === "post_endterm";
  return true;
}

function TripCard({ trip }: { trip: Trip }) {
  const days = daysUntil(trip.startDate);
  const nights = nightCount(trip.startDate, trip.endDate);
  const slotsLeft = trip.maxSlots - trip.bookedSlots;
  const pct = Math.round((trip.bookedSlots / trip.maxSlots) * 100);
  const isSundarone = trip.source === "sundarone";

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group flex gap-0 sm:flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Photo */}
      <div className="relative w-28 sm:w-full h-auto sm:h-48 flex-shrink-0 overflow-hidden">
        <Image
          src={trip.coverImage}
          alt={trip.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 112px, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent hidden sm:block" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col sm:flex-row gap-1">
          <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: trip.tagColor }}>
            {nights > 0 ? `${nights}N / ${nights + 1}D` : "Day Trip"}
          </span>
          {days > 0 && days <= 14 && (
            <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-red-500">
              {days}d left
            </span>
          )}
        </div>

        {isSundarone && (
          <div className="absolute bottom-2 left-2 hidden sm:block">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "rgba(0,0,0,0.6)" }}>
              Sundarone Tribe
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-5 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#FF6016" }}>
          {trip.destination}
        </p>
        <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight mb-1 group-hover:text-[#FF6016] transition-colors" style={{ fontFamily: "'Clash Display', sans-serif" }}>
          {trip.title}
        </h3>
        <p className="text-xs text-gray-400 mb-2 sm:mb-3">
          {formatDateRange(trip.startDate, trip.endDate)}
          {trip.departureTime ? ` · ${trip.departureTime}` : ""}
        </p>

        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 hidden sm:block mb-3">
          {trip.shortDescription}
        </p>

        {/* Slot bar */}
        <div className="mt-auto">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>{slotsLeft} spots left</span>
            <span>{pct}% filled</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 80 ? "#ef4444" : trip.tagColor }} />
          </div>
        </div>

        {/* CTA row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <p className="text-[10px] font-medium" style={{ color: "#FF6016" }}>
            {trip.inAppRegistration ? formatCurrency(trip.basePrice) : "Price revealing soon"}
          </p>
          <span className="flex items-center gap-1 text-xs font-bold transition-all group-hover:gap-2" style={{ color: trip.tagColor }}>
            Know more <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function TripsClient({ allTrips }: { allTrips: Trip[] }) {
  const [active, setActive] = useState<FilterKey>("all");

  const sorted = [...allTrips]
    .filter((t) => matchFilter(t, active))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const mysTrip = sorted.filter((t) => t.source === "mystrip");
  const sundarone = sorted.filter((t) => t.source === "sundarone");

  return (
    <div className="bg-[#F9F7F4] min-h-screen">
      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1.5 py-2.5 overflow-x-auto scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActive(f.key)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={
                  active === f.key
                    ? { background: "#FF6016", color: "#fff" }
                    : { background: "transparent", color: "#6b7280" }
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-14">
        {/* MysTrip trips */}
        {mysTrip.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <span className="w-1 h-7 rounded-full flex-shrink-0" style={{ background: "#FF6016" }} />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                MysTrip
              </h2>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                {mysTrip.length} trips
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mysTrip.map((trip) => <TripCard key={trip.id} trip={trip} />)}
            </div>
          </section>
        )}

        {/* Sundarone Tribe trips */}
        {sundarone.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-1 h-7 rounded-full flex-shrink-0" style={{ background: "#FF6016" }} />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Sundarone Tribe
              </h2>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                {sundarone.length} trips
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-6 ml-4">Exclusively for Sundarone Hostel residents · Managed by MysTrip</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sundarone.map((trip) => <TripCard key={trip.id} trip={trip} />)}
            </div>
          </section>
        )}

        {sorted.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg font-semibold mb-2">No trips here.</p>
            <button onClick={() => setActive("all")} className="text-sm font-bold underline" style={{ color: "#FF6016" }}>
              Show all trips
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
