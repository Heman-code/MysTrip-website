import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { registrations, trips } from "@/lib/db/schema";
import { sendServerEvent } from "@/lib/ga4-server";

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
  const { action } = await req.json();
  if (action !== "confirm" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const [registration] = await db
    .select({
      tripId: registrations.tripId,
      bookingStatus: registrations.bookingStatus,
      amount: registrations.amount,
      gaClientId: registrations.gaClientId,
    })
    .from(registrations)
    .where(eq(registrations.id, id))
    .limit(1);

  if (!registration) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }
  if (registration.bookingStatus !== "pending_payment") {
    return NextResponse.json({ error: "Registration already reviewed" }, { status: 409 });
  }

  await db
    .update(registrations)
    .set({ bookingStatus: action === "confirm" ? "confirmed" : "canceled" })
    .where(eq(registrations.id, id));

  if (action === "confirm") {
    const [trip] = await db
      .select({ slug: trips.slug, title: trips.title })
      .from(trips)
      .where(eq(trips.id, registration.tripId))
      .limit(1);
    // The definitive revenue conversion — fired here (not at submission time)
    // because this is the moment an admin actually verified the payment.
    await sendServerEvent(registration.gaClientId, "purchase", {
      transaction_id: id,
      currency: "INR",
      value: Number(registration.amount),
      items: trip ? [{ item_id: trip.slug, item_name: trip.title, price: Number(registration.amount) }] : [],
    });
  }

  if (action === "reject") {
    await db
      .update(trips)
      .set({ bookedSlots: sql`greatest(${trips.bookedSlots} - 1, 0)` })
      .where(eq(trips.id, registration.tripId));

    const [trip] = await db.select({ slug: trips.slug }).from(trips).where(eq(trips.id, registration.tripId)).limit(1);
    revalidatePath("/", "layout");
    revalidatePath("/trips");
    revalidatePath("/sundarone");
    if (trip) revalidatePath(`/trips/${trip.slug}`);
  }

  return NextResponse.json({ ok: true });
}
