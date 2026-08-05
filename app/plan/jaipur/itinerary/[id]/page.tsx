import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getItineraryForUser, getItineraryStopsWithPoi } from "@/lib/db/itineraries";
import { resequenceItinerary, type EarlierStartRecommendation } from "@/lib/planner/itinerary";
import { toPoiCardData } from "@/lib/db/pois";
import ItineraryClient from "./ItineraryClient";

export const metadata: Metadata = {
  title: "Your Jaipur Itinerary — MysTrip",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ItineraryPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/plan/jaipur/itinerary/${id}`);
  }

  const itinerary = await getItineraryForUser(id, session.user.id);
  if (!itinerary) notFound();

  let infeasiblePoiIds: string[] = [];
  let recommendation: EarlierStartRecommendation | null = null;
  if (itinerary.status === "draft") {
    const result = await resequenceItinerary(id);
    infeasiblePoiIds = result.infeasible;
    recommendation = result.recommendation;
  }

  const rows = await getItineraryStopsWithPoi(id);

  if (rows.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#F9F7F4" }}>
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Nothing shortlisted yet
          </h1>
          <p className="text-sm text-gray-500 mb-5">Pick a few places on the map first, then come back here to build your day.</p>
          <Link
            href="/plan/jaipur"
            className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: "#FF6016" }}
          >
            Go to the map
          </Link>
        </div>
      </div>
    );
  }

  const allStops = rows.map((r) => ({
    stopId: r.stop.id,
    poiId: r.poi.id,
    status: r.stop.status ?? "pending",
    sequenceOrder: r.stop.sequenceOrder ?? 0,
    plannedArrival: r.stop.plannedArrival,
    plannedDeparture: r.stop.plannedDeparture,
    poi: toPoiCardData(r.poi),
  }));

  const infeasibleNames = allStops
    .filter((s) => infeasiblePoiIds.includes(s.poiId))
    .map((s) => s.poi.name);

  return (
    <ItineraryClient
      itineraryId={id}
      planDate={itinerary.planDate}
      initialStops={allStops}
      initialInfeasibleNames={infeasibleNames}
      initialRecommendation={recommendation}
    />
  );
}
