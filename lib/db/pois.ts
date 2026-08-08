import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pois, poiSpecialEvents } from "@/lib/db/schema";

export interface EntryFees {
  adult?: number;
  student?: number;
  child?: number;
  foreigner?: number;
  foreignerStudent?: number;
}

// Normalized, already-defaulted shape for display components (map pins, cards).
export interface PoiCardData {
  id: string;
  citySlug: string;
  slug: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  shortDescription: string;
  longDescription: string;
  interestTags: string[];
  photos: string[];
  coverImage: string;
  openingHours: Record<string, { open: string; close: string }[]> | null;
  avgVisitDurationMinutes: number;
  entryFees: EntryFees;
  googleRating: number | null;
  isActive: boolean;
}

const FALLBACK_COVER = "/trips/hero-udaipur-cliff-group-2.webp";

export function toPoiCardData(p: typeof pois.$inferSelect): PoiCardData {
  return {
    id: p.id,
    citySlug: p.citySlug,
    slug: p.slug,
    name: p.name,
    category: p.category ?? "other",
    latitude: Number(p.latitude),
    longitude: Number(p.longitude),
    address: p.address ?? "",
    shortDescription: p.shortDescription ?? "",
    longDescription: p.longDescription ?? "",
    interestTags: (p.interestTags as string[] | null) ?? [],
    photos: (p.photos as string[] | null) ?? [],
    coverImage: p.coverImage || FALLBACK_COVER,
    openingHours: (p.openingHours as PoiCardData["openingHours"]) ?? null,
    avgVisitDurationMinutes: p.avgVisitDurationMinutes ?? 60,
    entryFees: (p.entryFees as EntryFees | null) ?? {},
    googleRating: p.googleRating !== null ? Number(p.googleRating) : null,
    isActive: !!p.isActive,
  };
}

export async function getPoisForCity(citySlug: string) {
  return db
    .select()
    .from(pois)
    .where(eq(pois.citySlug, citySlug))
    .orderBy(asc(pois.name));
}

export async function getPoiBySlug(slug: string) {
  const [poi] = await db.select().from(pois).where(eq(pois.slug, slug)).limit(1);
  return poi ?? null;
}

// Single left-joined query instead of a separate poi list + separate
// special-events select — the admin page already fires a dozen parallel
// queries against Neon's HTTP driver (one connection each), and every
// extra one made the "too many connection attempts" throttling worse.
export async function getAllPoisWithEventsForAdmin() {
  const rows = await db
    .select({ poi: pois, event: poiSpecialEvents })
    .from(pois)
    .leftJoin(poiSpecialEvents, eq(poiSpecialEvents.poiId, pois.id))
    .orderBy(asc(pois.citySlug), asc(pois.name));

  const byPoi = new Map<string, { poi: typeof pois.$inferSelect; events: (typeof poiSpecialEvents.$inferSelect)[] }>();
  for (const row of rows) {
    const entry = byPoi.get(row.poi.id) ?? { poi: row.poi, events: [] };
    if (row.event) entry.events.push(row.event);
    byPoi.set(row.poi.id, entry);
  }
  return Array.from(byPoi.values());
}

export async function getSpecialEventsForPoi(poiId: string) {
  return db
    .select()
    .from(poiSpecialEvents)
    .where(eq(poiSpecialEvents.poiId, poiId))
    .orderBy(asc(poiSpecialEvents.startTime));
}
