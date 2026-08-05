import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { formatDateRange, nightCount, daysUntil, type ItineraryTrack } from "@/lib/data/trips";
import { getDbTripBySlug, getAllDbTripsForAdmin } from "@/lib/db/trips";
import { formatCurrency } from "@/lib/utils";
import { readReferralCode } from "@/lib/referral-cookie";
import JsonLd from "@/components/seo/JsonLd";
import TripDetailClient from "./TripDetailClient";
import TripViewTracker from "@/components/analytics/TripViewTracker";
import TrackedLink from "@/components/analytics/TrackedLink";

const BASE_URL = "https://www.mystrip.in";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const trips = await getAllDbTripsForAdmin();
  return trips.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getDbTripBySlug(slug);
  if (!trip) return { title: "Trip Not Found" };
  return {
    title: trip.title,
    description:
      trip.shortDescription ??
      `${trip.title} — a MysTrip trip to ${trip.destination}. Book your seat with the tribe.`,
    alternates: { canonical: `${BASE_URL}/trips/${trip.slug}` },
    openGraph: {
      title: `${trip.title} | MysTrip`,
      description: trip.shortDescription ?? undefined,
      url: `${BASE_URL}/trips/${trip.slug}`,
      images: trip.coverImage ? [{ url: trip.coverImage }] : undefined,
    },
  };
}

const diffColors: Record<string, { bg: string; text: string }> = {
  Easy:     { bg: "#dcfce7", text: "#166534" },
  Moderate: { bg: "#fef9c3", text: "#854d0e" },
  Hard:     { bg: "#fee2e2", text: "#991b1b" },
};

const FALLBACK_COVER = "/trips/hero-udaipur-cliff-group-2.jpg";

export default async function TripDetailPage({ params }: Props) {
  const { slug } = await params;
  const trip = await getDbTripBySlug(slug);
  if (!trip) notFound();

  const basePrice = Number(trip.basePrice);
  const coverImage = trip.coverImage || FALLBACK_COVER;
  const tagColor = trip.tagColor || "#FF6016";
  const highlights = (trip.highlights as string[] | null) ?? [];
  const inclusions = (trip.inclusions as string[] | null) ?? [];
  const exclusions = (trip.exclusions as string[] | null) ?? [];
  const tracks = (trip.tracks as ItineraryTrack[] | null) ?? [];
  const dc = diffColors[trip.difficulty ?? "Easy"] ?? diffColors.Easy;
  const nights = nightCount(trip.tripDate, trip.returnDate ?? trip.tripDate);
  const days = daysUntil(trip.tripDate);
  const slotsLeft = trip.maxSlots - (trip.bookedSlots ?? 0);
  const pct = Math.round(((trip.bookedSlots ?? 0) / trip.maxSlots) * 100);
  const isMultiDay = nights > 0;
  const isSoldOut = slotsLeft <= 0;
  const canRegister = trip.registrationOpen && !isSoldOut;

  // WhatsApp-fallback trips (no in-app registration) have no booking row to
  // attach a referral code to, so the code rides along as visible text in
  // the prefilled message for the founder to log manually in the admin panel.
  const referralCode = readReferralCode(await cookies());
  const whatsappText = (base: string) => (referralCode ? `${base} — Ref: ${referralCode}` : base);

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: trip.title,
    description: trip.shortDescription ?? trip.description ?? undefined,
    image: coverImage.startsWith("http") ? coverImage : `${BASE_URL}${coverImage}`,
    touristType: "Students",
    provider: { "@type": "Organization", name: "MysTrip", url: BASE_URL },
    itinerary: {
      "@type": "Place",
      name: trip.destination,
      address: { "@type": "PostalAddress", addressLocality: trip.destination, addressRegion: trip.state ?? "Rajasthan", addressCountry: "IN" },
    },
    offers: {
      "@type": "Offer",
      price: basePrice,
      priceCurrency: "INR",
      availability: trip.registrationOpen ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      url: `${BASE_URL}/trips/${trip.slug}`,
      validFrom: trip.createdAt ? new Date(trip.createdAt).toISOString() : undefined,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Trips", item: `${BASE_URL}/trips` },
      { "@type": "ListItem", position: 3, name: trip.title, item: `${BASE_URL}/trips/${trip.slug}` },
    ],
  };

  return (
    <>
      <JsonLd data={eventSchema} />
      <JsonLd data={breadcrumbSchema} />
      <TripViewTracker slug={trip.slug} title={trip.title} destination={trip.destination} price={basePrice} />
      {/* ── Hero ── */}
      <section className="relative h-[56vh] min-h-[380px] sm:h-[70vh] sm:min-h-[500px] flex flex-col justify-end overflow-hidden">
        <Image
          src={coverImage}
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-10 w-full">
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-white" style={{ background: tagColor }}>
              {trip.tag}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full" style={{ background: dc.bg, color: dc.text }}>
              {trip.difficulty}
            </span>
            {days > 0 && days <= 14 && (
              <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-red-500 text-white">
                {days} days left
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm font-medium text-white/60 uppercase tracking-wide mb-1">
            {trip.destination}, {trip.state}
          </p>
          <h1
            className="text-2xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
            style={{ fontFamily: "'Clash Display', sans-serif", letterSpacing: "-0.025em" }}
          >
            {trip.title}
          </h1>
          <p className="mt-2 sm:mt-3 text-white/70 text-sm sm:text-base max-w-xl leading-relaxed">{trip.shortDescription}</p>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="bg-[#F9F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 sm:pt-10 sm:pb-10 lg:pb-10">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-16">

            {/* Left — main content */}
            <div className="flex-1 min-w-0">

              {/* Quick stats strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-10">
                {[
                  { label: "Date", value: formatDateRange(trip.tripDate, trip.returnDate ?? trip.tripDate) },
                  { label: "Duration", value: isMultiDay ? `${nights} Night${nights > 1 ? "s" : ""}` : "Day Trip" },
                  { label: "Departure", value: trip.departureTime ?? "TBA" },
                  { label: "Returns", value: trip.returnTime ?? "TBA" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100">
                    <p className="text-[11px] sm:text-xs text-gray-400 mb-1">{s.label}</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-900">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* About */}
              <div className="bg-white rounded-2xl p-5 sm:p-8 border border-gray-100 mb-5 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  About this trip
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{trip.description}</p>
              </div>

              {/* Highlights */}
              {highlights.length > 0 && (
              <div className="bg-white rounded-2xl p-5 sm:p-8 border border-gray-100 mb-5 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-5" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Highlights
                </h2>
                <ul className="space-y-3">
                  {highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: tagColor }}>✓</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              )}

              {/* Track selector — client component */}
              {tracks.length > 0 && (
                <TripDetailClient tracks={tracks} accentColor={tagColor} />
              )}

              {/* Included / Excluded */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">What&apos;s included</h3>
                  <ul className="space-y-2 sm:space-y-2.5">
                    {inclusions.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">Not included</h3>
                  <ul className="space-y-2 sm:space-y-2.5">
                    {exclusions.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                        <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Itinerary PDF */}
              <div className="bg-white rounded-2xl p-5 sm:p-8 border border-gray-100 mb-5 sm:mb-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                      Full Itinerary
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Day-by-day breakdown with timings, food stops, and logistics.</p>
                  </div>
                  <span
                    className="text-xs sm:text-sm font-semibold px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-gray-400 bg-gray-100 cursor-default flex-shrink-0"
                  >
                    Coming Soon
                  </span>
                </div>
              </div>

              {/* Policy note */}
              <div className="rounded-2xl p-4 sm:p-5 border text-xs sm:text-sm text-gray-500 leading-relaxed mb-6 lg:mb-0" style={{ background: "#FFFBF5", borderColor: "#FFE4CC" }}>
                <strong className="text-gray-700">Cancellation & Refund policy:</strong> Full refund if cancelled 7+ days before departure.
                50% refund within 3–7 days. No refund within 72 hours. Transfers to a future trip are always possible.
              </div>
            </div>

            {/* Right — sticky booking sidebar (desktop only; mobile relies on the sticky bottom bar) */}
            <div className="hidden lg:block lg:w-80 flex-shrink-0">
              <div className="sticky top-24">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                  {/* Price header */}
                  <div className="p-6 border-b border-gray-50">
                    <p className="text-xs text-gray-400 mb-1">Investment</p>
                    <p className="text-xl font-bold" style={{ fontFamily: "'Clash Display', sans-serif", color: "#FF6016" }}>
                      {trip.registrationOpen ? formatCurrency(basePrice) : "Price revealing soon"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isSoldOut
                        ? "All spots are taken for this batch"
                        : trip.registrationOpen
                          ? "Pay via UPI · confirmed after verification"
                          : "Drop us a message to be first to know"}
                    </p>
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
                        style={{ width: `${pct}%`, background: pct > 75 ? "#ef4444" : tagColor }}
                      />
                    </div>
                  </div>

                  {/* Date + departure */}
                  <div className="px-6 pb-5 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date</span>
                      <span className="font-medium text-gray-900">{formatDateRange(trip.tripDate, trip.returnDate ?? trip.tripDate)}</span>
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
                    {canRegister ? (
                      <TrackedLink
                        href={`/trips/${trip.slug}/register`}
                        eventName="register_start"
                        eventParams={{ trip_slug: trip.slug, trip_title: trip.title, value: basePrice }}
                        className="block w-full text-center py-4 rounded-2xl font-bold text-white text-base transition-all hover:opacity-90 active:scale-95"
                        style={{ background: tagColor }}
                      >
                        Register Now →
                      </TrackedLink>
                    ) : isSoldOut ? (
                      <button
                        type="button"
                        disabled
                        className="block w-full text-center py-4 rounded-2xl font-bold text-base cursor-not-allowed"
                        style={{ background: "#f1f5f9", color: "#94a3b8" }}
                      >
                        Sold Out
                      </button>
                    ) : (
                      <a
                        href={`https://wa.me/918822068322?text=${encodeURIComponent(whatsappText(`Hey! I want to join the ${trip.title} trip.`))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center py-4 rounded-2xl font-bold text-white text-base transition-all hover:opacity-90 active:scale-95"
                        style={{ background: tagColor }}
                      >
                        Apply for This Trip →
                      </a>
                    )}
                    <p className="text-center text-xs text-gray-400 mt-3">
                      {isSoldOut
                        ? "Message us to get on the waitlist for the next batch"
                        : "Spots are limited · We'll confirm your seat personally"}
                    </p>
                  </div>

                  {/* Trust signals */}
                  <div className="px-6 pb-6 pt-2 border-t border-gray-50">
                    <div className="space-y-2">
                      {["7-day full refund guarantee", "WhatsApp group access after joining", "Real-time trip updates"].map((t) => (
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
                  <p className="text-xs text-gray-400 mb-3">Talk to a MysTrip host before you apply.</p>
                  <a
                    href="https://wa.me/918822068322"
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

      {/* ── Mobile sticky bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-white px-4 py-3 flex items-center gap-3" style={{ borderColor: "#e5e7eb" }}>
        <div className="flex-1">
          <p className="text-xs text-gray-400">Investment</p>
          <p className="text-sm font-bold" style={{ color: "#FF6016" }}>
            {trip.registrationOpen ? formatCurrency(basePrice) : "Price revealing soon"}
          </p>
        </div>
        {canRegister ? (
          <TrackedLink
            href={`/trips/${trip.slug}/register`}
            eventName="register_start"
            eventParams={{ trip_slug: trip.slug, trip_title: trip.title, value: basePrice }}
            className="px-6 py-3 rounded-2xl font-bold text-white text-sm flex-shrink-0"
            style={{ background: tagColor }}
          >
            Register Now →
          </TrackedLink>
        ) : isSoldOut ? (
          <button
            type="button"
            disabled
            className="px-6 py-3 rounded-2xl font-bold text-sm flex-shrink-0 cursor-not-allowed"
            style={{ background: "#f1f5f9", color: "#94a3b8" }}
          >
            Sold Out
          </button>
        ) : (
          <a
            href={`https://wa.me/918822068322?text=${encodeURIComponent(whatsappText(`Hey! I want to join the ${trip.title} trip.`))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-2xl font-bold text-white text-sm flex-shrink-0"
            style={{ background: tagColor }}
          >
            Apply Now →
          </a>
        )}
      </div>
    </>
  );
}
