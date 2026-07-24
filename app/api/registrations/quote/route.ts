import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { getDbTripBySlug } from "@/lib/db/trips";
import { generateUpiQrDataUrl } from "@/lib/upi";
import { computeDiscount } from "@/lib/coupons";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }

  const { slug, couponCode } = await req.json();
  const trip = typeof slug === "string" ? await getDbTripBySlug(slug) : null;
  if (!trip || !trip.registrationOpen) {
    return NextResponse.json({ error: "Registration is not open for this trip." }, { status: 400 });
  }

  const originalAmount = Number(trip.basePrice);
  let discountAmount = 0;
  let appliedCoupon: { code: string; discountPercent: number } | null = null;

  if (typeof couponCode === "string" && couponCode.trim()) {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, couponCode.trim().toUpperCase()))
      .limit(1);

    if (coupon && coupon.userId === session.user.id && !coupon.isUsed) {
      const result = computeDiscount(originalAmount, coupon.discountPercent, Number(coupon.maxDiscountAmount));
      discountAmount = result.discountAmount;
      appliedCoupon = { code: coupon.code, discountPercent: coupon.discountPercent };
    }
    // an invalid/stale coupon at this point silently falls back to full price —
    // apply-coupon already validated it on step 1, this just guards against races
  }

  const finalAmount = originalAmount - discountAmount;
  const qrDataUrl = await generateUpiQrDataUrl(finalAmount, `${trip.title} ${trip.shortTitle ?? ""}`);

  return NextResponse.json({
    ok: true,
    originalAmount,
    discountAmount,
    finalAmount,
    coupon: appliedCoupon,
    qrDataUrl,
  });
}
