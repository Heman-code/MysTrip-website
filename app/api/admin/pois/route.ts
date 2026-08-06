import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { pois, poiSpecialEvents } from "@/lib/db/schema";
import { isAdminRole } from "@/lib/admin-auth";

interface SpecialEventInput {
  name: string;
  description?: string;
  daysOfWeek?: string[] | null;
  startTime: string;
  endTime: string;
  isMustSee?: boolean;
}

const ENTRY_FEE_KEYS = ["adult", "student", "child", "foreigner", "foreignerStudent"] as const;

function sanitizeEntryFees(input: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!input || typeof input !== "object") return out;
  for (const key of ENTRY_FEE_KEYS) {
    const value = (input as Record<string, unknown>)[key];
    if (value === undefined || value === null || value === "") continue;
    const num = Number(value);
    if (!Number.isNaN(num)) out[key] = num;
  }
  return out;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string) {
  let slug = base;
  let n = 1;
  while (true) {
    const [existing] = await db.select({ id: pois.id }).from(pois).where(eq(pois.slug, slug)).limit(1);
    if (!existing) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || !isAdminRole(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    citySlug, name, category, latitude, longitude, address,
    shortDescription, longDescription, interestTags,
    photos, coverImage, openingHours,
    avgVisitDurationMinutes, entryFees, googleRating,
    isActive, specialEvents,
  } = body ?? {};

  const requiredFields = { name, latitude, longitude };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (value === undefined || value === null || value === "") {
      return NextResponse.json({ error: `Missing required field: ${key}` }, { status: 400 });
    }
  }

  const slug = await uniqueSlug(slugify(name));
  const id = randomUUID();

  const poiInsert = db.insert(pois).values({
    id,
    citySlug: citySlug || "jaipur",
    slug,
    name,
    category: category || "other",
    latitude: String(latitude),
    longitude: String(longitude),
    address: address || null,
    shortDescription: shortDescription || null,
    longDescription: longDescription || null,
    interestTags: Array.isArray(interestTags) ? interestTags : [],
    photos: Array.isArray(photos) ? photos : [],
    coverImage: coverImage || null,
    openingHours: openingHours || null,
    avgVisitDurationMinutes: avgVisitDurationMinutes ? Number(avgVisitDurationMinutes) : 60,
    entryFees: sanitizeEntryFees(entryFees),
    googleRating: googleRating !== undefined && googleRating !== "" ? String(googleRating) : null,
    isActive: isActive !== undefined ? !!isActive : true,
    source: "manual",
  });

  const eventInserts = (Array.isArray(specialEvents) ? (specialEvents as SpecialEventInput[]) : [])
    .filter((e) => e?.name && e?.startTime && e?.endTime)
    .map((e) =>
      db.insert(poiSpecialEvents).values({
        poiId: id,
        name: e.name,
        description: e.description || null,
        daysOfWeek: e.daysOfWeek?.length ? e.daysOfWeek : null,
        startTime: e.startTime,
        endTime: e.endTime,
        isMustSee: e.isMustSee !== undefined ? !!e.isMustSee : true,
      })
    );

  if (eventInserts.length > 0) {
    await db.batch([poiInsert, ...eventInserts]);
  } else {
    await poiInsert;
  }

  revalidatePath("/admin");
  revalidatePath("/plan/jaipur");

  return NextResponse.json({ ok: true, poi: { id, slug } }, { status: 201 });
}
