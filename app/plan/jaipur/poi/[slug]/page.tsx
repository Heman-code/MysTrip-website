import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, IndianRupee, Clock } from "lucide-react";
import { auth } from "@/auth";
import { getPoiBySlug, getSpecialEventsForPoi, toPoiCardData, type EntryFees } from "@/lib/db/pois";
import { getOrCreateDraftItinerary, getItineraryStops } from "@/lib/db/itineraries";
import AddToShortlistButton from "./AddToShortlistButton";

const ENTRY_FEE_LABELS: [keyof EntryFees, string][] = [
  ["adult", "Adult"],
  ["student", "Student"],
  ["child", "Child"],
  ["foreigner", "Foreigner"],
  ["foreignerStudent", "Foreigner Student"],
];

const DAYS: { key: string; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const poi = await getPoiBySlug(slug);
  if (!poi) return {};
  return {
    title: `${poi.name} — Jaipur | MysTrip`,
    description: poi.shortDescription ?? undefined,
  };
}

export default async function PoiDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/plan/jaipur/poi/${slug}`);
  }

  const raw = await getPoiBySlug(slug);
  if (!raw || !raw.isActive) notFound();
  const poi = toPoiCardData(raw);

  const today = new Date().toISOString().split("T")[0];
  const [events, itinerary] = await Promise.all([
    getSpecialEventsForPoi(poi.id),
    getOrCreateDraftItinerary(session.user.id, "jaipur", today),
  ]);
  const stops = await getItineraryStops(itinerary.id);
  const existingStop = stops.find((s) => s.poiId === poi.id && s.status === "pending");

  return (
    <div className="min-h-screen" style={{ background: "#F9F7F4" }}>
      <div className="relative h-64 sm:h-80 w-full bg-gray-100">
        <Image src={poi.coverImage} alt={poi.name} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%)" }} />
        <div className="absolute bottom-0 left-0 right-0 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-gray-700 uppercase tracking-wide">
            {poi.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            {poi.name}
          </h1>
          {poi.address && (
            <p className="text-sm text-white/80 flex items-center gap-1.5 mt-1">
              <MapPin size={13} /> {poi.address}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-wrap items-center gap-3">
          <AddToShortlistButton poiId={poi.id} itineraryId={itinerary.id} stopId={existingStop?.id ?? null} />
          <Link href="/plan/jaipur" className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
            ← Back to map
          </Link>
        </div>

        {poi.longDescription && (
          <div>
            <h2 className="font-bold text-gray-900 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>About</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{poi.longDescription}</p>
          </div>
        )}

        {poi.interestTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {poi.interestTags.map((tag) => (
              <span key={tag} className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(255,96,22,0.1)", color: "#FF6016" }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              <Clock size={16} /> Opening Hours
            </h3>
            <div className="space-y-1.5">
              {DAYS.map((d) => {
                const hours = poi.openingHours?.[d.key] ?? [];
                return (
                  <div key={d.key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{d.label}</span>
                    <span className="font-medium text-gray-800">
                      {hours.length > 0 ? `${hours[0].open} – ${hours[0].close}` : "Closed"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-1.5 flex items-center gap-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                <IndianRupee size={16} /> Entry Fee
              </h3>
              {ENTRY_FEE_LABELS.some(([key]) => poi.entryFees[key] !== undefined) ? (
                <div className="space-y-0.5">
                  {ENTRY_FEE_LABELS.filter(([key]) => poi.entryFees[key] !== undefined).map(([key, label]) => (
                    <p key={key} className="text-sm text-gray-600 flex justify-between max-w-[220px]">
                      <span>{label}</span>
                      <span className="font-semibold text-gray-800">₹{poi.entryFees[key]!.toLocaleString("en-IN")}</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">Free / not specified</p>
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1.5" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Suggested Visit Duration
              </h3>
              <p className="text-sm text-gray-600">{poi.avgVisitDurationMinutes} minutes</p>
            </div>
          </div>
        </div>

        {events.length > 0 && (
          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#FFE4CC", background: "#FFFBF5" }}>
            <h3 className="font-bold text-gray-900 mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Special Events
            </h3>
            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev.id}>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-900">{ev.name}</p>
                    {ev.isMustSee && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "#FF6016" }}>
                        MUST-SEE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ev.startTime} – {ev.endTime}
                    {ev.daysOfWeek && Array.isArray(ev.daysOfWeek) && ev.daysOfWeek.length > 0
                      ? ` · ${(ev.daysOfWeek as string[]).join(", ")}`
                      : " · every day"}
                  </p>
                  {ev.description && <p className="text-sm text-gray-600 mt-1">{ev.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
