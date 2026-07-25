import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { coupons, registrations, trips, users } from "@/lib/db/schema";
import { getDbTripBySlug } from "@/lib/db/trips";
import { computeDiscount } from "@/lib/coupons";

const MAX_SCREENSHOT_BASE64_LENGTH = 5_600_000; // ~4MB decoded

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please log in to register." }, { status: 401 });
  }

  const body = await req.json();
  const {
    slug,
    fullName,
    whatsappNumber,
    guardianPhone,
    collegeRegNumber,
    couponCode,
    paymentScreenshot,
  } = body ?? {};

  const trip = slug ? await getDbTripBySlug(slug) : null;
  if (!trip || !trip.registrationOpen) {
    return NextResponse.json({ error: "Registration is not open for this trip." }, { status: 400 });
  }

  // Re-validate the coupon authoritatively — never trust a client-sent amount.
  // Since the QR they already paid was generated with this same discount, a
  // coupon that's gone invalid between quote and submit must fail loudly
  // rather than silently charge a different amount than what was actually paid.
  let finalAmount = Number(trip.basePrice);
  let discountAmount = 0;
  let coupon: typeof coupons.$inferSelect | null = null;
  if (typeof couponCode === "string" && couponCode.trim()) {
    const [found] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, couponCode.trim().toUpperCase()))
      .limit(1);
    if (!found || found.userId !== session.user.id || found.isUsed) {
      return NextResponse.json(
        { error: "That coupon is no longer valid. Please go back and reapply, or continue without it." },
        { status: 409 }
      );
    }
    coupon = found;
    const result = computeDiscount(Number(trip.basePrice), found.discountPercent, Number(found.maxDiscountAmount));
    discountAmount = result.discountAmount;
    finalAmount = result.finalAmount;
  }

  const requiredFields = { whatsappNumber, guardianPhone, collegeRegNumber };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (typeof value !== "string" || !value.trim()) {
      return NextResponse.json({ error: `Missing required field: ${key}` }, { status: 400 });
    }
  }

  if (typeof paymentScreenshot !== "string" || !paymentScreenshot.startsWith("data:image/")) {
    return NextResponse.json({ error: "Please upload a payment screenshot." }, { status: 400 });
  }
  if (paymentScreenshot.length > MAX_SCREENSHOT_BASE64_LENGTH) {
    return NextResponse.json({ error: "Screenshot is too large. Please upload an image under 4MB." }, { status: 400 });
  }

  const dbTripId = trip.id;

  const [existing] = await db
    .select({ id: registrations.id, bookingStatus: registrations.bookingStatus })
    .from(registrations)
    .where(and(eq(registrations.userId, session.user.id), eq(registrations.tripId, dbTripId)))
    .limit(1);

  if (existing && existing.bookingStatus !== "canceled" && existing.bookingStatus !== "refunded") {
    return NextResponse.json({ error: "You've already registered for this trip." }, { status: 409 });
  }

  if (typeof fullName === "string" && fullName.trim()) {
    await db.update(users).set({ fullName: fullName.trim() }).where(eq(users.id, session.user.id));
  }

  const [registration] = await db
    .insert(registrations)
    .values({
      userId: session.user.id,
      tripId: dbTripId,
      bookingStatus: "pending_payment",
      amount: finalAmount.toString(),
      discountApplied: discountAmount > 0,
      discountAmount: discountAmount.toString(),
      couponId: coupon?.id ?? null,
      whatsappNumber: whatsappNumber.trim(),
      guardianPhone: guardianPhone.trim(),
      collegeRegNumber: collegeRegNumber.trim(),
      paymentScreenshot,
    })
    .returning({ id: registrations.id });

  await db
    .update(trips)
    .set({ bookedSlots: sql`${trips.bookedSlots} + 1` })
    .where(eq(trips.id, dbTripId));

  revalidatePath("/");
  revalidatePath("/trips");
  revalidatePath("/sundarone");
  revalidatePath(`/trips/${trip.slug}`);

  if (coupon) {
    await db
      .update(coupons)
      .set({ isUsed: true, usedAt: new Date(), usedOnRegistrationId: registration.id })
      .where(eq(coupons.id, coupon.id));
  }

  return NextResponse.json({ ok: true, registrationId: registration.id }, { status: 201 });
}
