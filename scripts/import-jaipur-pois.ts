// One-off bulk backfill: pulls base data (name, coords, hours, rating) from
// Google Places for a hand-picked list of Jaipur Place IDs and inserts them
// as inactive POIs. Run manually (`npm run import:pois`), not automatically —
// admin then fills in the manual fields (category, descriptions, interest
// tags, visit duration, special events) in /admin and activates each one.
//
// Setup:
//   1. cp scripts/jaipur-place-ids.example.json scripts/jaipur-place-ids.json
//   2. Fill in real Place IDs (find them at
//      https://developers.google.com/maps/documentation/places/web-service/place-id)
//   3. Set GOOGLE_PLACES_API_KEY in .env.local
//   4. npm run import:pois

import { config } from "dotenv";
config({ path: ".env.local" });

import { existsSync, readFileSync } from "fs";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { fetchPlaceDetails, mapPlaceDetails } from "@/lib/planner/googlePlaces";

interface PlaceIdEntry {
  placeId: string;
  note?: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error("Missing GOOGLE_PLACES_API_KEY in .env.local — set it first.");
    process.exit(1);
  }

  const listPath = "scripts/jaipur-place-ids.json";
  if (!existsSync(listPath)) {
    console.error(
      `Missing ${listPath}.\n` +
        `Copy scripts/jaipur-place-ids.example.json to ${listPath} and fill in real Place IDs\n` +
        `(find them at https://developers.google.com/maps/documentation/places/web-service/place-id)`
    );
    process.exit(1);
  }

  const entries: PlaceIdEntry[] = JSON.parse(readFileSync(listPath, "utf-8"));

  // Imported after env is loaded — lib/db reads DATABASE_URL at import time.
  const { db } = await import("@/lib/db");
  const { pois } = await import("@/lib/db/schema");

  let imported = 0;
  let skipped = 0;

  for (const entry of entries) {
    if (!entry.placeId || entry.placeId === "REPLACE_ME") {
      console.warn(`Skipping placeholder entry (${entry.note ?? "no note"}) — add a real Place ID.`);
      skipped += 1;
      continue;
    }

    try {
      const details = await fetchPlaceDetails(entry.placeId, apiKey);
      const mapped = mapPlaceDetails(details);

      const [existing] = await db.select({ id: pois.id }).from(pois).where(eq(pois.googlePlaceId, mapped.googlePlaceId)).limit(1);
      if (existing) {
        console.log(`Already imported: ${mapped.name} — skipping (use "Refresh from Google" in admin to update it).`);
        skipped += 1;
        continue;
      }

      const slugBase = slugify(mapped.name);
      let slug = slugBase;
      let n = 1;
      while (true) {
        const [dup] = await db.select({ id: pois.id }).from(pois).where(eq(pois.slug, slug)).limit(1);
        if (!dup) break;
        n += 1;
        slug = `${slugBase}-${n}`;
      }

      await db.insert(pois).values({
        id: randomUUID(),
        citySlug: "jaipur",
        slug,
        name: mapped.name,
        category: "other",
        latitude: String(mapped.latitude),
        longitude: String(mapped.longitude),
        address: mapped.address,
        googlePlaceId: mapped.googlePlaceId,
        openingHours: mapped.openingHours,
        googleRating: mapped.googleRating !== null ? String(mapped.googleRating) : null,
        source: "google_places",
        isActive: false, // hidden on the map until an admin fills in the manual fields
      });

      console.log(`Imported (inactive): ${mapped.name}`);
      imported += 1;
    } catch (err) {
      console.error(`Failed to import ${entry.note ?? entry.placeId}:`, err instanceof Error ? err.message : err);
      skipped += 1;
    }
  }

  console.log(`\nDone. ${imported} imported, ${skipped} skipped.`);
  if (imported > 0) {
    console.log("New POIs are inactive — add descriptions/tags/visit duration in /admin, then activate them.");
  }
}

main();
