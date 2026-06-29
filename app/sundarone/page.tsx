import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { SUNDARONE_ONLY, formatDateRange, daysUntil, nightCount, type Trip } from "@/lib/data/trips";

// Sundarone brand colours (from official brand guidelines)
// Navy:   #0b3d59  (Darkazure)
// Orange: #f47521
// White:  #ffffff

export const metadata: Metadata = {
  title: "Sundarone Travel Tribe | Your Hostel. Your Community. Your Adventures.",
  description:
    "Sundarone Travel Tribe is the official travel community for Sundarone Hostel residents. Jaipur explorations, Aravali treks, weekend escapes, and semester-end trips planned around your academic calendar.",
  openGraph: {
    title: "Sundarone Travel Tribe",
    description: "Your hostel. Your community. Your adventures.",
    images: ["/trips/sundarone-hero-cliff.jpg"],
  },
};

const featured = SUNDARONE_ONLY
  .filter((t) => t.startDate >= new Date().toISOString().split("T")[0])
  .sort((a, b) => a.startDate.localeCompare(b.startDate))
  .slice(0, 3);

// ─── TRIP CARD ────────────────────────────────────────────────────────────────
function TripCard({ trip }: { trip: Trip }) {
  const nights = nightCount(trip.startDate, trip.endDate);
  const days = daysUntil(trip.startDate);
  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          src={trip.coverImage}
          alt={trip.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        {days >= 0 && days <= 30 && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
            style={{ background: "#f47521" }}>
            {days === 0 ? "Today!" : `${days}d away`}
          </div>
        )}
        {nights > 0 && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
            style={{ background: "rgba(11,61,89,0.85)" }}>
            {nights}N / {nights + 1}D
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#f47521" }}>
          {trip.category.replace(/_/g, " ")}
        </p>
        <h3 className="font-bold text-gray-900 leading-tight text-sm" style={{ fontFamily: "'Clash Display', sans-serif" }}>
          {trip.title}
        </h3>
        <p className="text-xs text-gray-400">{formatDateRange(trip.startDate, trip.endDate)}</p>
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50">
          <span className="text-base font-bold" style={{ color: "#0b3d59", fontFamily: "'Clash Display', sans-serif" }}>
            ₹{trip.basePrice.toLocaleString("en-IN")}
          </span>
          <span className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: "#f47521" }}>
            View trip <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── TRIP PILL (full calendar) ────────────────────────────────────────────────
function TripPill({ trip }: { trip: Trip }) {
  const nights = nightCount(trip.startDate, trip.endDate);
  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 bg-white hover:border-[#f47521] hover:shadow-sm transition-all duration-200"
    >
      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
        <Image src={trip.coverImage} alt={trip.title} fill className="object-cover" sizes="48px" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "#f47521" }}>
          {new Date(trip.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          {nights > 0 ? ` · ${nights}N` : ""}
        </p>
        <p className="text-xs font-bold text-gray-800 group-hover:text-[#0b3d59] transition-colors truncate"
          style={{ fontFamily: "'Clash Display', sans-serif" }}>
          {trip.shortTitle}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{trip.category.replace(/_/g, " ")}</p>
      </div>
      <p className="text-sm font-bold flex-shrink-0" style={{ color: "#0b3d59", fontFamily: "'Clash Display', sans-serif" }}>
        ₹{trip.basePrice.toLocaleString("en-IN")}
      </p>
    </Link>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function SundaronePage() {
  return (
    <>
      {/* ─── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: "#0b3d59" }}>
        {/* Real photo — right half, fading left */}
        <div className="absolute right-0 top-0 h-full w-[45%] hidden lg:block">
          <Image src="/trips/sundarone-hero-cliff.jpg" alt="" fill className="object-cover" sizes="45vw" priority />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #0b3d59 0%, rgba(11,61,89,0.2) 100%)" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-8 border"
              style={{ borderColor: "rgba(244,117,33,0.4)", background: "rgba(244,117,33,0.1)" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#f47521" }} />
              <span className="text-xs font-bold" style={{ color: "#f47521" }}>
                Exclusively for Sundarone Residents
              </span>
            </div>

            <h1
              className="font-bold text-white leading-[1.05] mb-6"
              style={{
                fontFamily: "'Clash Display', sans-serif",
                fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
                letterSpacing: "-0.025em",
              }}
            >
              Sundarone
              <br />
              <span style={{ color: "#f47521" }}>Travel Tribe.</span>
            </h1>

            <p className="text-base leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.6)", maxWidth: "380px" }}>
              Your hostel. Your community. Your adventures.
              A travel tribe built exclusively for Sundarone residents —
              trips planned around your semester, your people, your pace.
            </p>
            <p className="text-xs mb-10" style={{ color: "rgba(255,255,255,0.25)" }}>
              Travel managed by MysTrip · Dahmi Kalan, Jaipur 303007
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="#trips"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-white transition-all hover:opacity-90 active:scale-95 text-sm"
                style={{ background: "#f47521" }}
              >
                See This Semester&apos;s Trips <ArrowRight size={15} />
              </Link>
              <Link
                href="/auth/signup?ref=sundarone"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-semibold text-sm transition-all hover:bg-white/10 active:scale-95"
                style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.65)" }}
              >
                Join the Tribe →
              </Link>
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {[
                { num: `${SUNDARONE_ONLY.length} trips`, label: "this semester" },
                { num: "Exam-safe", label: "dates every time" },
                { num: "₹799", label: "starting price" },
                { num: "Residents only", label: "Sundarone students" },
              ].map((s) => (
                <div key={s.label} className="flex items-baseline gap-2">
                  <span className="text-sm font-bold" style={{ color: "#f47521", fontFamily: "'Clash Display', sans-serif" }}>{s.num}</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHAT IS SUNDARONE TRAVEL TRIBE ─────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: "#f47521" }}>
                About
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-6 text-gray-900"
                style={{ fontFamily: "'Clash Display', sans-serif", letterSpacing: "-0.02em" }}>
                You already share a building.
                <br />
                <span style={{ color: "#0b3d59" }}>Now share a story.</span>
              </h2>
              <p className="text-base leading-relaxed text-gray-500 mb-5">
                Sundarone Travel Tribe is an exclusive travel community for Sundarone Hostel students.
                Every trip is with your batch — your hallmates, your seniors, your new friends.
                Not a travel agency. A tribe.
              </p>
              <p className="text-base leading-relaxed text-gray-400 mb-8">
                Trips are planned around your academic calendar — no clashes with exams, labs, or submissions.
                Just the windows between sem, filled with experiences you&apos;ll talk about for four years.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "🏠", label: "Residents only", sub: "Every trip is exclusively for Sundarone students" },
                  { icon: "🗓️", label: "Exam-safe dates", sub: "Planned around MUJ academic calendar" },
                  { icon: "🧭", label: "Guided trips", sub: "Experienced hosts on every trip" },
                  { icon: "👨‍👩‍👧", label: "Parents welcome", sub: "Networking events for families too" },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl border border-gray-100">
                    <span className="text-xl">{item.icon}</span>
                    <p className="font-bold text-gray-800 text-sm mt-2 mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>{item.label}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                <Image src="/trips/sundarone-hero-cliff.jpg" alt="Udaipur trip" fill className="object-cover" sizes="25vw" />
              </div>
              <div className="flex flex-col gap-3 pt-8">
                <div className="relative aspect-square rounded-2xl overflow-hidden">
                  <Image src="/trips/card-kedarkantha-snow-camp.jpg" alt="Achrol Fort Trek" fill className="object-cover" sizes="20vw" />
                </div>
                <div className="relative aspect-square rounded-2xl overflow-hidden">
                  <Image src="/trips/gallery-kedarkantha-peaks.jpg" alt="Twin Tower Trek" fill className="object-cover" sizes="20vw" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── UPCOMING TRIPS ──────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section id="trips" className="py-20" style={{ background: "#f4f6f9" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: "#f47521" }}>Coming up</p>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Next on the calendar.
                </h2>
              </div>
              <Link href="#all-trips" className="text-sm font-bold flex items-center gap-1.5 hover:gap-2.5 transition-all"
                style={{ color: "#0b3d59" }}>
                All {SUNDARONE_ONLY.length} trips <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featured.map((trip) => <TripCard key={trip.id} trip={trip} />)}
            </div>
          </div>
        </section>
      )}

      {/* ─── PARENTS NETWORKING ──────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-10 items-center">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: "#f47521" }}>
                  For families · Jul 15–19
                </p>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Parents&apos; Networking Week
                </h2>
                <p className="text-base text-gray-500 leading-relaxed mb-6">
                  When parents leave their child at Sundarone for the first time, they leave a little anxious.
                  This week is for them — curated day trips so families can meet each other and go home
                  knowing the community their child now belongs to.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: "🏛️", title: "Jaipur Exploration", price: "₹999", desc: "Amer Fort, Hawa Mahal, Old City food trail — see the city your child calls home." },
                    { icon: "🙏", title: "Khatu Shyamji Darshan", price: "₹999", desc: "A blessed beginning. Temple visit to Khatu Shyamji, Sikar — prasad and community." },
                  ].map((opt) => (
                    <div key={opt.title} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                      <span className="text-xl flex-shrink-0">{opt.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-gray-800 text-sm" style={{ fontFamily: "'Clash Display', sans-serif" }}>{opt.title}</p>
                          <span className="text-sm font-bold" style={{ color: "#f47521" }}>{opt.price}</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{opt.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-300 mt-4">Register at Sundarone reception · Running daily Jul 15–19</p>
              </div>

              <div className="w-full lg:w-72 flex-shrink-0">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                  <Image src="/trips/gallery-banki-circle-aerial.jpg" alt="Community" fill className="object-cover" sizes="300px" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,61,89,0.85) 0%, transparent 55%)" }} />
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-white font-bold text-sm leading-snug" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                      &ldquo;My parents came for the Jaipur tour and they finally stopped worrying about me.&rdquo;
                    </p>
                    <p className="text-white/50 text-xs mt-2">— Sundarone resident, Batch 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FULL SEMESTER CALENDAR ──────────────────────────────────────── */}
      <section id="all-trips" className="py-20" style={{ background: "#f4f6f9" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: "#f47521" }}>
              July – December 2026
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight"
              style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Your semester calendar.
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              {SUNDARONE_ONLY.length} trips · Every date planned around your academic calendar
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SUNDARONE_ONLY.map((trip) => <TripPill key={trip.id} trip={trip} />)}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: "#0b3d59" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-white mb-5"
            style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Your tribe is waiting.
          </h2>
          <p className="text-base mb-10" style={{ color: "rgba(255,255,255,0.45)", lineHeight: "1.7" }}>
            Join Sundarone Travel Tribe and get first access to every trip this semester.
            Starts at ₹799. No drama, just trips.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup?ref=sundarone"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: "#f47521" }}
            >
              Join Sundarone Travel Tribe <ArrowRight size={16} />
            </Link>
            <Link
              href="#all-trips"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold transition-all hover:bg-white/10 active:scale-95"
              style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)" }}
            >
              Browse Trips
            </Link>
          </div>
          <p className="text-xs mt-8" style={{ color: "rgba(255,255,255,0.15)" }}>
            Travel managed by MysTrip
          </p>
        </div>
      </section>
    </>
  );
}
