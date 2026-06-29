import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ALL_TRIPS, getTripBySlug, formatDateRange, nightCount, daysUntil } from "@/lib/data/trips";
import TripDetailClient from "./TripDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ALL_TRIPS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  if (!trip) return { title: "Trip Not Found | MysTrip" };
  return {
    title: `${trip.title} | MysTrip`,
    description: trip.shortDescription,
    openGraph: {
      images: [{ url: trip.coverImage }],
    },
  };
}

const diffColors = {
  Easy:     { bg: "#dcfce7", text: "#166534" },
  Moderate: { bg: "#fef9c3", text: "#854d0e" },
  Hard:     { bg: "#fee2e2", text: "#991b1b" },
};

export default async function TripDetailPage({ params }: Props) {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  if (!trip) notFound();

  const dc = diffColors[trip.difficulty];
  const nights = nightCount(trip.startDate, trip.endDate);
  const days = daysUntil(trip.startDate);
  const slotsLeft = trip.maxSlots - trip.bookedSlots;
  const pct = Math.round((trip.bookedSlots / trip.maxSlots) * 100);
  const isMultiDay = nights > 0;

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative h-[70vh] min-h-[500px] flex flex-col justify-end overflow-hidden">
        <Image
          src={trip.coverImage}
          alt={trip.title}
          fill
          className="object-cover object-center"
          priority
          quality={90}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

        {/* Back */}
        <div className="absolute top-20 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              ← Back to all trips
            </Link>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: trip.tagColor }}>
              {trip.tag}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: dc.bg, color: dc.text }}>
              {trip.difficulty}
            </span>
            {days > 0 && days <= 14 && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500 text-white">
                {days} days left
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-white/60 uppercase tracking-wide mb-1">
            {trip.destination}, {trip.state}
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
            style={{ fontFamily: "'Clash Display', sans-serif", letterSpacing: "-0.025em" }}
          >
            {trip.title}
          </h1>
          <p className="mt-3 text-white/70 text-base max-w-xl leading-relaxed">{trip.shortDescription}</p>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="bg-[#F9F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

            {/* Left — main content */}
            <div className="flex-1 min-w-0">

              {/* Quick stats strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {[
                  { label: "Date", value: formatDateRange(trip.startDate, trip.endDate) },
                  { label: "Duration", value: isMultiDay ? `${nights} Night${nights > 1 ? "s" : ""}` : "Day Trip" },
                  { label: "Departure", value: trip.departureTime ?? "TBA" },
                  { label: "Returns", value: trip.returnTime ?? "TBA" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                    <p className="text-sm font-bold text-gray-900">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* About */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  About this trip
                </h2>
                <p className="text-gray-600 leading-relaxed">{trip.longDescription}</p>
              </div>

              {/* Highlights */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-5" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Highlights
                </h2>
                <ul className="space-y-3">
                  {trip.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: trip.tagColor }}>✓</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Track selector — client component */}
              {trip.tracks && trip.tracks.length > 0 && (
                <TripDetailClient tracks={trip.tracks} accentColor={trip.tagColor} />
              )}

              {/* Included / Excluded */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-4">What&apos;s included</h3>
                  <ul className="space-y-2.5">
                    {trip.included.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Not included</h3>
                  <ul className="space-y-2.5">
                    {trip.excluded.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Itinerary PDF */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                      Full Itinerary
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Day-by-day breakdown with timings, food stops, and logistics.</p>
                  </div>
                  <Link
                    href={`/api/itinerary/${trip.slug}`}
                    target="_blank"
                    className="text-sm font-bold px-5 py-2.5 rounded-full text-white transition-opacity hover:opacity-90"
                    style={{ background: trip.tagColor }}
                  >
                    View PDF →
                  </Link>
                </div>
              </div>

              {/* Policy note */}
              <div className="rounded-2xl p-5 border text-sm text-gray-500 leading-relaxed" style={{ background: "#FFFBF5", borderColor: "#FFE4CC" }}>
                <strong className="text-gray-700">Cancellation & Refund policy:</strong> Full refund if cancelled 7+ days before departure.
                50% refund within 3–7 days. No refund within 72 hours. Transfers to a future trip are always possible.
              </div>
            </div>

            {/* Right — sticky booking sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="sticky top-24">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                  {/* Price header */}
                  <div className="p-6 border-b border-gray-50">
                    <p className="text-xs text-gray-400 mb-1">Starting from</p>
                    <p className="text-4xl font-bold" style={{ fontFamily: "'Clash Display', sans-serif", color: "#01574A" }}>
                      ₹{trip.basePrice.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">per person · all inclusive</p>
                  </div>

                  {/* Availability */}
                  <div className="px-6 pt-5 pb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>{slotsLeft} spots remaining</span>
                      <span>{pct}% booked</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: pct > 75 ? "#ef4444" : trip.tagColor }}
                      />
                    </div>
                  </div>

                  {/* Date + departure */}
                  <div className="px-6 pb-5 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date</span>
                      <span className="font-medium text-gray-900">{formatDateRange(trip.startDate, trip.endDate)}</span>
                    </div>
                    {trip.departureTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Departs</span>
                        <span className="font-medium text-gray-900">{trip.departureTime}</span>
                      </div>
                    )}
                    {trip.returnTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Returns</span>
                        <span className="font-medium text-gray-900">{trip.returnTime}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="px-6 pb-6">
                    {trip.registrationOpen && slotsLeft > 0 ? (
                      <Link
                        href={`/trips/${trip.slug}/book`}
                        className="block w-full text-center py-4 rounded-2xl font-bold text-white text-base transition-all hover:opacity-90 active:scale-95"
                        style={{ background: trip.tagColor }}
                      >
                        Book This Trip →
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="block w-full text-center py-4 rounded-2xl font-bold text-gray-400 text-base bg-gray-100 cursor-not-allowed"
                      >
                        {slotsLeft === 0 ? "Sold Out" : "Registration Closed"}
                      </button>
                    )}
                    <p className="text-center text-xs text-gray-400 mt-3">
                      Secure checkout · UPI / Card / EMI via Razorpay
                    </p>
                  </div>

                  {/* Trust signals */}
                  <div className="px-6 pb-6 pt-2 border-t border-gray-50">
                    <div className="space-y-2">
                      {["7-day full refund guarantee", "WhatsApp group access after booking", "Real-time trip updates"].map((t) => (
                        <div key={t} className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="text-green-500">✓</span> {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Help card */}
                <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Have questions?</p>
                  <p className="text-xs text-gray-400 mb-3">Talk to a MysTrip host before you book.</p>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                    style={{ background: "#25D366", color: "#fff" }}
                  >
                    WhatsApp Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky booking bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-white px-4 py-3 flex items-center gap-3" style={{ borderColor: "#e5e7eb" }}>
        <div className="flex-1">
          <p className="text-xs text-gray-400">Starting from</p>
          <p className="text-xl font-bold" style={{ fontFamily: "'Clash Display', sans-serif", color: "#01574A" }}>
            ₹{trip.basePrice.toLocaleString("en-IN")}
          </p>
        </div>
        {trip.registrationOpen && slotsLeft > 0 ? (
          <Link
            href={`/trips/${trip.slug}/book`}
            className="px-8 py-3 rounded-2xl font-bold text-white text-sm flex-shrink-0"
            style={{ background: trip.tagColor }}
          >
            Book Now →
          </Link>
        ) : (
          <span className="px-8 py-3 rounded-2xl font-bold text-gray-400 text-sm bg-gray-100 flex-shrink-0">
            {slotsLeft === 0 ? "Sold Out" : "Closed"}
          </span>
        )}
      </div>
    </>
  );
}
