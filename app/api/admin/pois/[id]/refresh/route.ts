import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { pois } from "@/lib/db/schema";
import { fetchPlaceDetails, mapPlaceDetails } from "@/lib/planner/googlePlaces";
import { isAdminRole } from "@/lib/admin-auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || !isAdminRole(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const [poi] = await db.select().from(pois).where(eq(pois.id, id)).limit(1);
  if (!poi) {
    return NextResponse.json({ error: "POI not found" }, { status: 404 });
  }
  if (!poi.googlePlaceId) {
    return NextResponse.json({ error: "This POI has no linked Google Place ID." }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY is not configured on the server." }, { status: 500 });
  }

  let mapped;
  try {
    const details = await fetchPlaceDetails(poi.googlePlaceId, apiKey);
    mapped = mapPlaceDetails(details);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to refresh from Google" }, { status: 502 });
  }

  await db
    .update(pois)
    .set({
      name: mapped.name,
      address: mapped.address,
      latitude: String(mapped.latitude),
      longitude: String(mapped.longitude),
      openingHours: mapped.openingHours,
      googleRating: mapped.googleRating !== null ? String(mapped.googleRating) : null,
      updatedAt: new Date(),
    })
    .where(eq(pois.id, id));

  revalidatePath("/admin");
  revalidatePath("/plan/jaipur");

  return NextResponse.json({ ok: true, poi: mapped });
}
