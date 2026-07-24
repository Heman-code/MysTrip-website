import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";

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
  const [existing] = await db.select({ id: trips.id }).from(trips).where(eq(trips.id, id)).limit(1);
  if (!existing) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  const passthroughFields = [
    "title", "shortTitle", "destination", "state", "source", "category", "status",
    "tripDate", "returnDate", "departureTime", "returnTime",
    "shortDescription", "description", "difficulty",
    "coverImage", "tag", "tagColor", "accentColor",
  ] as const;

  for (const field of passthroughFields) {
    if (field in body) updates[field] = body[field] || null;
  }

  if ("basePrice" in body) updates.basePrice = String(body.basePrice);
  if ("maxSlots" in body) updates.maxSlots = Number(body.maxSlots);
  if ("minSlots" in body) updates.minSlots = Number(body.minSlots);
  if ("highlights" in body) updates.highlights = Array.isArray(body.highlights) ? body.highlights : [];
  if ("inclusions" in body) updates.inclusions = Array.isArray(body.inclusions) ? body.inclusions : [];
  if ("exclusions" in body) updates.exclusions = Array.isArray(body.exclusions) ? body.exclusions : [];
  if ("registrationOpen" in body) updates.registrationOpen = !!body.registrationOpen;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  updates.updatedAt = new Date();

  await db.update(trips).set(updates).where(eq(trips.id, id));

  return NextResponse.json({ ok: true });
}
