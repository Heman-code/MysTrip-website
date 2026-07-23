import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { registrations, reviews, trips } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please log in to leave a review." }, { status: 401 });
  }

  const body = await req.json();
  const { registrationId, rating, title, text } = body ?? {};

  if (typeof registrationId !== "string" || !registrationId) {
    return NextResponse.json({ error: "Missing trip." }, { status: 400 });
  }
  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: "Please choose a rating." }, { status: 400 });
  }
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Please write a few words about your trip." }, { status: 400 });
  }

  const [reg] = await db
    .select({ id: registrations.id, tripId: registrations.tripId, bookingStatus: registrations.bookingStatus, tripStatus: trips.status })
    .from(registrations)
    .innerJoin(trips, eq(registrations.tripId, trips.id))
    .where(and(eq(registrations.id, registrationId), eq(registrations.userId, session.user.id)))
    .limit(1);

  if (!reg) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (reg.bookingStatus !== "confirmed" || reg.tripStatus !== "executed") {
    return NextResponse.json({ error: "Reviews open once your trip is confirmed and completed." }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.registrationId, registrationId))
    .limit(1);
  if (existing) {
    return NextResponse.json({ error: "You've already reviewed this trip." }, { status: 409 });
  }

  const [review] = await db
    .insert(reviews)
    .values({
      userId: session.user.id,
      tripId: reg.tripId,
      registrationId,
      rating: ratingNum,
      title: typeof title === "string" && title.trim() ? title.trim() : null,
      body: text.trim(),
      isApproved: false,
    })
    .returning({ id: reviews.id });

  return NextResponse.json({ ok: true, reviewId: review.id }, { status: 201 });
}
