import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDbUpcomingTrips, toTripCardData } from "@/lib/db/trips";
import TripsClient from "./TripsClient";

export const metadata: Metadata = {
  title: "Upcoming Trips — July to December 2026 | MysTrip",
  description:
    "Treks, day explorations, weekend escapes, and flagship multi-night journeys. MysTrip's full calendar for the 2026–27 academic year.",
};

export default async function TripsPage() {
  const dbTrips = await getDbUpcomingTrips();
  const allTrips = dbTrips.map(toTripCardData);

  const trekCount = allTrips.filter((t) => t.category === "trek").length;
  const openCount = allTrips.filter((t) => t.registrationOpen).length;
  const mysTripTrips = allTrips.filter((t) => t.source === "mystrip");
  const firstTrip = mysTripTrips[0] ?? allTrips[0];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-20 pb-10 sm:pt-28 sm:pb-16 overflow-hidden" style={{ background: "#0B1210" }}>
        <div className="absolute inset-0 opacity-20">
          <Image src="/trips/hero-kedarkantha-blizzard-2.jpg" alt="" fill className="object-cover object-top" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1210]/60 via-[#0B1210]/80 to-[#0B1210]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-2 sm:mb-3" style={{ color: "#FF6016" }}>
            Academic Year 2026–27
          </p>
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
            style={{ fontFamily: "'Clash Display', sans-serif", letterSpacing: "-0.02em" }}
          >
            Find your next
            <br />
            <span style={{ color: "#FF6016" }}>adventure.</span>
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/50 max-w-sm leading-relaxed">
            Treks, day trips, weekends, and multi-day escapes — all planned around your semester.
          </p>

          <div className="flex flex-wrap gap-4 sm:gap-6 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/10">
            {[
              { num: `${allTrips.length}`, label: "Total trips" },
              { num: `${trekCount}`, label: "Treks" },
              { num: `${openCount}`, label: "Open now" },
              { num: "2", label: "National awards" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>{s.num}</p>
                <p className="text-[10px] mt-0.5 text-white/35 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client: filter + trips */}
      <TripsClient allTrips={allTrips} />

      {/* Bottom CTA */}
      {firstTrip && (
        <section className="py-12 sm:py-16 text-center" style={{ background: "#01574A" }}>
          <div className="max-w-md mx-auto px-4">
            <h2 className="text-xl sm:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Not sure where to start?
            </h2>
            <p className="text-white/60 mb-7 text-sm leading-relaxed">
              First timers always start with {firstTrip.shortTitle} — zero commitment, maximum memories.
            </p>
            <Link
              href={`/trips/${firstTrip.slug}`}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-[#01574A] bg-white hover:bg-[#FFEFDD] transition-colors text-sm"
            >
              Start with {firstTrip.shortTitle} →
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
