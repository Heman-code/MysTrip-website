import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getItineraryForUser } from "@/lib/db/itineraries";
import { resequenceItinerary } from "@/lib/planner/itinerary";

export async function POST(
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

  const body = await req.json().catch(() => ({}));
  const { currentLat, currentLng, currentTime } = body ?? {};

  const result = await resequenceItinerary(id, {
    lat: typeof currentLat === "number" ? currentLat : undefined,
    lng: typeof currentLng === "number" ? currentLng : undefined,
    time: typeof currentTime === "string" ? currentTime : undefined,
  });

  revalidatePath(`/plan/jaipur/itinerary/${id}`);

  return NextResponse.json(result);
}
