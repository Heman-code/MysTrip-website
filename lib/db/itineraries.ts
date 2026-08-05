import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { itineraries, itineraryStops, pois } from "@/lib/db/schema";

export async function getOrCreateDraftItinerary(userId: string, citySlug: string, planDate: string) {
  const [existing] = await db
    .select()
    .from(itineraries)
    .where(
      and(
        eq(itineraries.userId, userId),
        eq(itineraries.citySlug, citySlug),
        eq(itineraries.planDate, planDate),
        eq(itineraries.status, "draft")
      )
    )
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(itineraries)
    .values({ userId, citySlug, planDate })
    .returning();
  return created;
}

export async function getItineraryForUser(id: string, userId: string) {
  const [itinerary] = await db
    .select()
    .from(itineraries)
    .where(and(eq(itineraries.id, id), eq(itineraries.userId, userId)))
    .limit(1);
  return itinerary ?? null;
}

export async function getItineraryStops(itineraryId: string) {
  return db.select().from(itineraryStops).where(eq(itineraryStops.itineraryId, itineraryId));
}

export async function getItineraryStopsWithPoi(itineraryId: string) {
  return db
    .select({ stop: itineraryStops, poi: pois })
    .from(itineraryStops)
    .innerJoin(pois, eq(itineraryStops.poiId, pois.id))
    .where(eq(itineraryStops.itineraryId, itineraryId))
    .orderBy(asc(itineraryStops.sequenceOrder));
}
