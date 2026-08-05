import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { pois, poiSpecialEvents, itineraryStops } from "@/lib/db/schema";

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const [existing] = await db.select({ id: pois.id }).from(pois).where(eq(pois.id, id)).limit(1);
  if (!existing) {
    return NextResponse.json({ error: "POI not found" }, { status: 404 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  const passthroughFields = [
    "citySlug", "name", "category", "address",
    "shortDescription", "longDescription", "coverImage",
  ] as const;
  for (const field of passthroughFields) {
    if (field in body) updates[field] = body[field] || null;
  }

  if ("latitude" in body) updates.latitude = String(body.latitude);
  if ("longitude" in body) updates.longitude = String(body.longitude);
  if ("interestTags" in body) updates.interestTags = Array.isArray(body.interestTags) ? body.interestTags : [];
  if ("photos" in body) updates.photos = Array.isArray(body.photos) ? body.photos : [];
  if ("openingHours" in body) updates.openingHours = body.openingHours || null;
  if ("avgVisitDurationMinutes" in body) updates.avgVisitDurationMinutes = Number(body.avgVisitDurationMinutes) || 60;
  if ("entryFees" in body) updates.entryFees = sanitizeEntryFees(body.entryFees);
  if ("googleRating" in body) updates.googleRating = body.googleRating !== "" && body.googleRating !== null ? String(body.googleRating) : null;
  if ("isActive" in body) updates.isActive = !!body.isActive;

  if (Object.keys(updates).length === 0 && !("specialEvents" in body)) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  updates.updatedAt = new Date();

  const poiUpdate = db.update(pois).set(updates).where(eq(pois.id, id));

  if ("specialEvents" in body) {
    const events = (Array.isArray(body.specialEvents) ? (body.specialEvents as SpecialEventInput[]) : [])
      .filter((e) => e?.name && e?.startTime && e?.endTime);

    const deleteEvents = db.delete(poiSpecialEvents).where(eq(poiSpecialEvents.poiId, id));
    const insertEvents = events.map((e) =>
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
    await db.batch([poiUpdate, deleteEvents, ...insertEvents]);
  } else {
    await poiUpdate;
  }

  revalidatePath("/admin");
  revalidatePath("/plan/jaipur");

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const [existing] = await db.select({ id: pois.id }).from(pois).where(eq(pois.id, id)).limit(1);
  if (!existing) {
    return NextResponse.json({ error: "POI not found" }, { status: 404 });
  }

  const [referenced] = await db.select({ id: itineraryStops.id }).from(itineraryStops).where(eq(itineraryStops.poiId, id)).limit(1);
  if (referenced) {
    return NextResponse.json(
      { error: "This POI is used in an existing itinerary — deactivate it instead of deleting." },
      { status: 409 }
    );
  }

  await db.batch([
    db.delete(poiSpecialEvents).where(eq(poiSpecialEvents.poiId, id)),
    db.delete(pois).where(eq(pois.id, id)),
  ]);

  revalidatePath("/admin");
  revalidatePath("/plan/jaipur");

  return NextResponse.json({ ok: true });
}
