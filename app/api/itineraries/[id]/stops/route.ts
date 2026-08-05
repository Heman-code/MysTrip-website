import { NextRequest, NextResponse } from "next/server";
import { and, count, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { itineraryStops, pois } from "@/lib/db/schema";
import { getItineraryForUser } from "@/lib/db/itineraries";

const MAX_STOPS = 8;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const itinerary = await getItineraryForUser(id, session.user.id);
  if (!itinerary) {
    return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
  }
  if (itinerary.status !== "draft") {
    return NextResponse.json({ error: "This itinerary is no longer editable." }, { status: 400 });
  }

  const { poiId } = (await req.json().catch(() => ({}))) ?? {};
  if (!poiId) {
    return NextResponse.json({ error: "Missing poiId" }, { status: 400 });
  }

  const [poi] = await db.select({ id: pois.id, isActive: pois.isActive }).from(pois).where(eq(pois.id, poiId)).limit(1);
  if (!poi || !poi.isActive) {
    return NextResponse.json({ error: "POI not found" }, { status: 404 });
  }

  const [existing] = await db
    .select({ id: itineraryStops.id })
    .from(itineraryStops)
    .where(and(eq(itineraryStops.itineraryId, id), eq(itineraryStops.poiId, poiId)))
    .limit(1);
  if (existing) {
    return NextResponse.json({ error: "Already in your shortlist." }, { status: 409 });
  }

  const [{ total }] = await db.select({ total: count() }).from(itineraryStops).where(eq(itineraryStops.itineraryId, id));
  if (Number(total) >= MAX_STOPS) {
    return NextResponse.json({ error: `You can shortlist up to ${MAX_STOPS} places for one day.` }, { status: 400 });
  }

  const [stop] = await db.insert(itineraryStops).values({ itineraryId: id, poiId }).returning();

  return NextResponse.json({ ok: true, stop }, { status: 201 });
}
