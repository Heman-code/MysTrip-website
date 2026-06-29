import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ALL_TRIPS, MYSTRIP_ONLY, SUNDARONE_ONLY, CATEGORY_META, type Trip, type TripCategory, formatDateRange, daysUntil, nightCount } from "@/lib/data/trips";

export const metadata: Metadata = {
  title: "Upcoming Trips — July to December 2026 | MysTrip",
  description:
    "10 trips. Treks, day explorations, weekend escapes, and flagship multi-night journeys. MysTrip's full calendar for the 2026–27 academic year.",
};

const CATEGORY_ORDER: TripCategory[] = [
  "parents_event",
  "day_exploration",
  "trek",
  "weekend_escape",
  "post_midterm",
  "post_endterm",
];

function groupByCategory(trips: Trip[]): Record<TripCategory, Trip[]> {
  const groups = {} as Record<TripCategory, Trip[]>;
  for (const cat of CATEGORY_ORDER) groups[cat] = [];
  for (const trip of trips) groups[trip.category].push(trip);
  return groups;
}

const diffColors = {
  Easy:     { bg: "#dcfce7", text: "#166534" },
  Moderate: { bg: "#fef9c3", text: "#854d0e" },
  Hard:     { bg: "#fee2e2", text: "#991b1b" },
};

function TripCard({ trip }: { trip: Trip }) {
  const diff = diffColors[trip.difficulty];
  const days = daysUntil(trip.startDate);
  const slotsLeft = trip.maxSlots - trip.bookedSlots;
  const pct = Math.round((trip.bookedSlots / trip.maxSlots) * 100);

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300"
    >
      {/* Photo cover */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={trip.coverImage}
          alt={trip.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
            style={{ background: trip.tagColor }}
          >
            {trip.tag}
          </span>
          {days <= 30 && days > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white bg-red-500">
              {days}d left
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: diff.bg, color: diff.text }}>
            {trip.difficulty}
          </span>
        </div>

        {/* Title on photo */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-xs font-medium text-white/60 uppercase tracking-wide">{trip.destination}</p>
          <h3
            className="text-lg font-bold text-white mt-0.5 group-hover:text-[#FFB001] transition-colors"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            {trip.title}
          </h3>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        {/* Date + departure */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span>📅 {formatDateRange(trip.startDate, trip.endDate)}</span>
          {trip.departureTime && <span>🕐 {trip.departureTime}</span>}
        </div>

        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{trip.shortDescription}</p>

        {/* Slot bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>{slotsLeft} slots left</span>
            <span>{pct}% filled</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: pct > 80 ? "#ef4444" : trip.tagColor,
              }}
            />
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
          <div>
            <p className="text-xs text-gray-400">Starting from</p>
            <p className="text-2xl font-bold" style={{ fontFamily: "'Clash Display', sans-serif", color: "#01574A" }}>
              ₹{trip.basePrice.toLocaleString("en-IN")}
            </p>
          </div>
          {trip.registrationOpen ? (
            <span
              className="text-sm font-bold px-5 py-2.5 rounded-full text-white group-hover:opacity-90 transition-opacity"
              style={{ background: trip.tagColor }}
            >
              Book Now →
            </span>
          ) : (
            <span className="text-sm font-semibold px-5 py-2.5 rounded-full text-gray-400 bg-gray-100">
              Opening Soon
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function TripsSection({ trips, label }: { trips: Trip[]; label: string }) {
  const grouped = groupByCategory(trips);
  if (!trips.length) return (
    <div className="text-center py-24 text-gray-400">No trips found.</div>
  );
  return (
    <div className="space-y-20">
      {CATEGORY_ORDER.map((cat) => {
        const catTrips = grouped[cat];
        if (!catTrips.length) return null;
        const meta = CATEGORY_META[cat];
        return (
          <div key={cat}>
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-8 mb-8 pb-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl" role="img" aria-label={meta.label}>{meta.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    {meta.label}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">{meta.description}</p>
                </div>
              </div>
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-500 self-start sm:self-auto">
                {catTrips.length} {catTrips.length === 1 ? "event" : "events"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {catTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TripsPage() {
  const mysTotal = MYSTRIP_ONLY.length;
  const sunTotal = SUNDARONE_ONLY.length;
  const openCount = ALL_TRIPS.filter((t) => t.registrationOpen).length;
  const trekCount = ALL_TRIPS.filter((t) => t.category === "trek").length;

  return (
    <>
      {/* Page hero */}
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: "#0B1210" }}>
        <div className="absolute inset-0 opacity-20">
          <Image src="/trips/hero-kedarkantha-blizzard.jpg" alt="" fill className="object-cover object-top" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1210]/60 via-[#0B1210]/80 to-[#0B1210]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#FF6016" }}>
            Academic Year 2026–27
          </p>
          <h1
            className="text-5xl lg:text-6xl font-bold text-white leading-tight"
            style={{ fontFamily: "'Clash Display', sans-serif", letterSpacing: "-0.02em" }}
          >
            Every trip.
            <br />
            <span style={{ color: "#FFB001" }}>One semester.</span>
          </h1>
          <p className="mt-5 text-base text-white/50 max-w-md leading-relaxed">
            Treks, day explorations, weekend getaways, and flagship multi-night journeys.
            July to December 2026 — built around your academic calendar.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-10 pt-10 border-t border-white/10">
            {[
              { num: `${ALL_TRIPS.length}`, label: "Total Events" },
              { num: `${trekCount}`, label: "Treks" },
              { num: `${openCount}`, label: "Open Now" },
              { num: "2", label: "National Awards" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>{s.num}</p>
                <p className="text-xs mt-0.5 text-white/35 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs + Trips */}
      <div className="bg-[#F9F7F4] min-h-screen">
        {/* Tab nav */}
        <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 py-1 overflow-x-auto scrollbar-none">
              {[
                { label: `All Trips (${ALL_TRIPS.length})`, href: "/trips", id: "all" },
                { label: `MysTrip (${mysTotal})`, href: "/trips?filter=mystrip", id: "mystrip" },
                { label: `Sundarone (${sunTotal})`, href: "/trips?filter=sundarone", id: "sundarone" },
              ].map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className="flex-shrink-0 px-5 py-3 text-sm font-semibold rounded-full transition-all hover:bg-gray-50 whitespace-nowrap"
                  style={{ color: "#374151" }}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* MysTrip section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="flex items-center gap-3 mb-12">
            <span className="w-1 h-8 rounded-full" style={{ background: "#FF6016" }} />
            <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              MysTrip Calendar
            </h2>
          </div>
          <TripsSection trips={MYSTRIP_ONLY} label="MysTrip" />
        </div>

        {/* Sundarone section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
          <div className="flex items-center gap-3 mb-12 mt-12 pt-12 border-t border-gray-200">
            <span className="w-1 h-8 rounded-full" style={{ background: "#FF7800" }} />
            <div>
              <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Sundarone × MysTrip
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">Exclusively for Sundarone Hostel residents · Dahmi Kalan, Jaipur</p>
            </div>
          </div>
          <TripsSection trips={SUNDARONE_ONLY} label="Sundarone" />
        </div>
      </div>

      {/* Bottom CTA */}
      <section className="py-20 text-center" style={{ background: "#01574A" }}>
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Not sure which trip to start with?
          </h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            First timers always start with Jaipur Exploration.
            It&apos;s a day trip — zero commitment, maximum memories.
          </p>
          <Link
            href="/trips/jaipur-exploration-freshers"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-[#01574A] bg-white hover:bg-[#FFEFDD] transition-colors"
          >
            Start with Jaipur →
          </Link>
        </div>
      </section>
    </>
  );
}
