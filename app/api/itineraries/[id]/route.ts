import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { itineraries } from "@/lib/db/schema";
import { getItineraryForUser } from "@/lib/db/itineraries";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const itinerary = await getItineraryForUser(id, session.user.id);
  if (!itinerary) {
    return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) ?? {};
  const updates: Record<string, unknown> = {};

  if ("planDate" in body) {
    if (typeof body.planDate !== "string" || !DATE_RE.test(body.planDate)) {
      return NextResponse.json({ error: "planDate must be in YYYY-MM-DD format." }, { status: 400 });
    }
    updates.planDate = body.planDate;
  }
  if ("startTime" in body) {
    if (typeof body.startTime !== "string" || !TIME_RE.test(body.startTime)) {
      return NextResponse.json({ error: "startTime must be in HH:MM format." }, { status: 400 });
    }
    updates.startTime = body.startTime;
  }
  if ("startLat" in body) {
    updates.startLat = body.startLat === null ? null : String(Number(body.startLat));
  }
  if ("startLng" in body) {
    updates.startLng = body.startLng === null ? null : String(Number(body.startLng));
  }
  if ("startLabel" in body) {
    updates.startLabel = body.startLabel ? String(body.startLabel) : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  updates.updatedAt = new Date();
  await db.update(itineraries).set(updates).where(eq(itineraries.id, id));

  return NextResponse.json({ ok: true });
}
