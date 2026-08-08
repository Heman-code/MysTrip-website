import { and, asc, eq, gte, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";

const FALLBACK_COVER = "/trips/hero-udaipur-cliff-group-2.webp";

// Normalized, already-defaulted shape for display components (cards, listings).
export interface TripCardData {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  destination: string;
  state: string;
  category: string;
  source: string;
  startDate: string;
  endDate: string;
  departureTime: string | null;
  returnTime: string | null;
  basePrice: number;
  maxSlots: number;
  bookedSlots: number;
  coverImage: string;
  shortDescription: string;
  tagColor: string;
  tag: string;
  difficulty: string;
  registrationOpen: boolean;
}

export function toTripCardData(t: typeof trips.$inferSelect): TripCardData {
  return {
    id: t.id,
    slug: t.slug,
    title: t.title,
    shortTitle: t.shortTitle ?? t.title,
    destination: t.destination,
    state: t.state ?? "",
    category: t.category ?? "day_exploration",
    source: t.source ?? "mystrip",
    startDate: t.tripDate,
    endDate: t.returnDate ?? t.tripDate,
    departureTime: t.departureTime,
    returnTime: t.returnTime,
    basePrice: Number(t.basePrice),
    maxSlots: t.maxSlots,
    bookedSlots: t.bookedSlots ?? 0,
    coverImage: t.coverImage || FALLBACK_COVER,
    shortDescription: t.shortDescription ?? "",
    tagColor: t.tagColor || "#FF6016",
    tag: t.tag ?? "",
    difficulty: t.difficulty ?? "Easy",
    registrationOpen: !!t.registrationOpen,
  };
}

export async function getDbTripBySlug(slug: string) {
  const [trip] = await db.select().from(trips).where(eq(trips.slug, slug)).limit(1);
  return trip ?? null;
}

export async function getDbUpcomingTrips(source?: "mystrip" | "sundarone", limit?: number) {
  const today = new Date().toISOString().split("T")[0];
  const conditions = source
    ? and(gte(trips.tripDate, today), eq(trips.source, source), ne(trips.status, "executed"))
    : and(gte(trips.tripDate, today), ne(trips.status, "executed"));

  const query = db.select().from(trips).where(conditions).orderBy(asc(trips.tripDate));
  const rows = await query;
  return limit ? rows.slice(0, limit) : rows;
}

export async function getAllDbTripsForAdmin() {
  return db.select().from(trips).orderBy(asc(trips.tripDate));
}
