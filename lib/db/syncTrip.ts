import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";
import { getTripBySlug } from "@/lib/data/trips";

// The public site's trip catalogue lives in lib/data/trips.ts (static), but
// registrations need a real DB trip row to satisfy the FK. This lazily
// upserts the static trip into Postgres by slug the first time it's needed.
export async function getOrCreateDbTrip(slug: string): Promise<string | null> {
  const staticTrip = getTripBySlug(slug);
  if (!staticTrip) return null;

  const [existing] = await db.select({ id: trips.id }).from(trips).where(eq(trips.slug, slug)).limit(1);
  if (existing) return existing.id;

  try {
    const [created] = await db
      .insert(trips)
      .values({
        slug: staticTrip.slug,
        title: staticTrip.title,
        shortTitle: staticTrip.shortTitle,
        destination: staticTrip.destination,
        state: staticTrip.state,
        source: staticTrip.source,
        category: staticTrip.category,
        status: "open",
        tripDate: staticTrip.startDate,
        returnDate: staticTrip.endDate,
        departureTime: staticTrip.departureTime,
        returnTime: staticTrip.returnTime,
        basePrice: staticTrip.basePrice.toString(),
        maxSlots: staticTrip.maxSlots,
        bookedSlots: 0,
        shortDescription: staticTrip.shortDescription,
        description: staticTrip.longDescription,
        highlights: staticTrip.highlights,
        inclusions: staticTrip.included,
        exclusions: staticTrip.excluded,
        difficulty: staticTrip.difficulty,
        coverImage: staticTrip.coverImage,
        registrationOpen: staticTrip.registrationOpen,
        tag: staticTrip.tag,
        tagColor: staticTrip.tagColor,
      })
      .returning({ id: trips.id });
    return created.id;
  } catch {
    // Another request created it first (unique slug race) — fetch what won.
    const [raced] = await db.select({ id: trips.id }).from(trips).where(eq(trips.slug, slug)).limit(1);
    if (raced) return raced.id;
    throw new Error(`Failed to sync trip "${slug}" into the database`);
  }
}
