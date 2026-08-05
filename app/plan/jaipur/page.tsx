import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPoisForCity, toPoiCardData } from "@/lib/db/pois";
import { getOrCreateDraftItinerary, getItineraryStops } from "@/lib/db/itineraries";
import JaipurMapClient from "./JaipurMapClient";

export const metadata: Metadata = {
  title: "Plan Your Jaipur Day — MysTrip",
  description: "Pick the places you want to see in Jaipur and let MysTrip work out the best order to visit them in.",
};

export default async function JaipurPlanPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/plan/jaipur");
  }

  const today = new Date().toISOString().split("T")[0];
  const [rawPois, itinerary] = await Promise.all([
    getPoisForCity("jaipur"),
    getOrCreateDraftItinerary(session.user.id, "jaipur", today),
  ]);
  const stops = await getItineraryStops(itinerary.id);

  const pois = rawPois.filter((p) => p.isActive).map(toPoiCardData);
  const initialStops = stops
    .filter((s) => s.status === "pending")
    .map((s) => ({ id: s.id, poiId: s.poiId }));

  return (
    <JaipurMapClient
      pois={pois}
      itineraryId={itinerary.id}
      initialStops={initialStops}
    />
  );
}
