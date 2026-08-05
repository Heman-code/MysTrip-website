import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrCreateDraftItinerary, getItineraryStops } from "@/lib/db/itineraries";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const citySlug = body?.citySlug || "jaipur";
  const planDate = body?.planDate || new Date().toISOString().split("T")[0];

  const itinerary = await getOrCreateDraftItinerary(session.user.id, citySlug, planDate);
  const stops = await getItineraryStops(itinerary.id);

  return NextResponse.json({ itinerary, stops });
}
