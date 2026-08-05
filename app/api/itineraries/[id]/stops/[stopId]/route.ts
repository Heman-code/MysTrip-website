import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { itineraryStops } from "@/lib/db/schema";
import { getItineraryForUser } from "@/lib/db/itineraries";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stopId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, stopId } = await params;
  const itinerary = await getItineraryForUser(id, session.user.id);
  if (!itinerary) {
    return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
  }

  const { status } = (await req.json().catch(() => ({}))) ?? {};
  if (!["pending", "visited", "skipped"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { status };
  if (status === "visited") updates.visitedAt = new Date();

  await db.update(itineraryStops).set(updates).where(and(eq(itineraryStops.id, stopId), eq(itineraryStops.itineraryId, id)));

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; stopId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, stopId } = await params;
  const itinerary = await getItineraryForUser(id, session.user.id);
  if (!itinerary) {
    return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
  }
  if (itinerary.status !== "draft") {
    return NextResponse.json({ error: "This itinerary is no longer editable." }, { status: 400 });
  }

  await db.delete(itineraryStops).where(and(eq(itineraryStops.id, stopId), eq(itineraryStops.itineraryId, id)));

  return NextResponse.json({ ok: true });
}
