import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { itineraries, itineraryStops, pois, poiSpecialEvents } from "@/lib/db/schema";
import { computeSequence, suggestEarlierStart, type SequenceStop, type SequenceResult } from "./sequence";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const DEFAULT_START = { lat: 26.9124, lng: 75.7873 }; // Jaipur city center
const DEFAULT_START_TIME = "09:00";

function weekdayKey(planDate: string): (typeof DAY_KEYS)[number] {
  return DAY_KEYS[new Date(`${planDate}T00:00:00`).getDay()];
}

interface StartOverride {
  lat?: number;
  lng?: number;
  time?: string;
}

export interface EarlierStartRecommendation {
  suggestedTime: string;
  reason: string;
}

export interface ResequenceResult extends SequenceResult {
  recommendation: EarlierStartRecommendation | null;
}

export async function resequenceItinerary(itineraryId: string, override?: StartOverride): Promise<ResequenceResult> {
  const [itinerary] = await db.select().from(itineraries).where(eq(itineraries.id, itineraryId)).limit(1);
  if (!itinerary) throw new Error("Itinerary not found");

  const stopsRaw = await db
    .select({ stop: itineraryStops, poi: pois })
    .from(itineraryStops)
    .innerJoin(pois, eq(itineraryStops.poiId, pois.id))
    .where(and(eq(itineraryStops.itineraryId, itineraryId), eq(itineraryStops.status, "pending")));

  if (stopsRaw.length === 0) {
    return { order: [], infeasible: [], recommendation: null };
  }

  const poiIds = stopsRaw.map((r) => r.poi.id);
  const events = await db.select().from(poiSpecialEvents).where(inArray(poiSpecialEvents.poiId, poiIds));
  const eventsByPoi = new Map<string, typeof events>();
  for (const ev of events) {
    const list = eventsByPoi.get(ev.poiId) ?? [];
    list.push(ev);
    eventsByPoi.set(ev.poiId, list);
  }

  const day = weekdayKey(itinerary.planDate);

  const sequenceStops: SequenceStop[] = stopsRaw.map(({ poi }) => {
    const hours = (poi.openingHours as Record<string, { open: string; close: string }[]> | null)?.[day] ?? [];
    const poiEvents = (eventsByPoi.get(poi.id) ?? [])
      .filter((e) => !e.daysOfWeek || (e.daysOfWeek as string[]).includes(day))
      .map((e) => ({ startTime: e.startTime, endTime: e.endTime, isMustSee: !!e.isMustSee }));
    return {
      poiId: poi.id,
      lat: Number(poi.latitude),
      lng: Number(poi.longitude),
      openingHours: hours,
      avgVisitDurationMinutes: poi.avgVisitDurationMinutes ?? 60,
      events: poiEvents,
    };
  });

  const start = {
    lat: override?.lat ?? (itinerary.startLat !== null ? Number(itinerary.startLat) : DEFAULT_START.lat),
    lng: override?.lng ?? (itinerary.startLng !== null ? Number(itinerary.startLng) : DEFAULT_START.lng),
    time: override?.time ?? itinerary.startTime ?? DEFAULT_START_TIME,
  };

  const result = computeSequence(sequenceStops, start);

  // "Start earlier" only makes sense before the day has begun — compute it on
  // the first-ever sequencing (draft -> active), never on a Phase-5 mid-day
  // re-plan after the traveler is already out and about.
  let recommendation: EarlierStartRecommendation | null = null;
  if (itinerary.status === "draft") {
    const suggestion = suggestEarlierStart(sequenceStops, start, result);
    if (suggestion) {
      const nameById = new Map(stopsRaw.map((r) => [r.poi.id, r.poi.name]));
      const resolvedNames = suggestion.resolvedPoiIds.map((id) => nameById.get(id)).filter((n): n is string => !!n);
      const tightNames = suggestion.tightPoiIds.map((id) => nameById.get(id)).filter((n): n is string => !!n);

      const parts: string[] = [];
      if (resolvedNames.length > 0) {
        parts.push(`${resolvedNames.join(", ")} won't fit at your chosen start time, but would with an earlier one`);
      }
      if (tightNames.length > 0) {
        parts.push(`you'd only catch the tail end of ${tightNames.join(", ")}'s scheduled window`);
      }

      recommendation = {
        suggestedTime: suggestion.suggestedTime,
        reason: `Starting at ${suggestion.suggestedTime} instead would help — ${parts.join("; ")}.`,
      };
    }
  }

  const stopIdByPoi = new Map(stopsRaw.map((r) => [r.poi.id, r.stop.id]));
  const updates = result.order.map((entry, i) => {
    const stopId = stopIdByPoi.get(entry.poiId)!;
    return db
      .update(itineraryStops)
      .set({ sequenceOrder: i, plannedArrival: entry.arrival, plannedDeparture: entry.departure })
      .where(eq(itineraryStops.id, stopId));
  });

  if (updates.length > 0) {
    await db.batch(updates as [(typeof updates)[number], ...(typeof updates)[number][]]);
  }

  if (itinerary.status === "draft" && result.order.length > 0) {
    await db.update(itineraries).set({ status: "active", updatedAt: new Date() }).where(eq(itineraries.id, itineraryId));
  }

  return { ...result, recommendation };
}
