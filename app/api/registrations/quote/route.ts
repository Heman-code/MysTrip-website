import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { getDbTripBySlug } from "@/lib/db/trips";
import { generateUpiQrDataUrl } from "@/lib/upi";
import { computeDiscount } from "@/lib/coupons";
import { computeAmbassadorDiscount } from "@/lib/ambassadors";
import { getActiveAmbassadorByCode } from "@/lib/referral";

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
  let appliedAmbassador: { code: string; discountType: string; discountValue: number; discountMaxCap: number | null } | null = null;

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
    } else if (!coupon) {
      // Not a coupon — the same input doubles as an ambassador referral code.
      const ambassador = await getActiveAmbassadorByCode(couponCode);
      if (ambassador) {
        const result = computeAmbassadorDiscount(originalAmount, ambassador);
        discountAmount = result.discountAmount;
        appliedAmbassador = {
          code: ambassador.referralCode,
          discountType: ambassador.discountType,
          discountValue: Number(ambassador.discountValue),
          discountMaxCap: ambassador.discountMaxCap !== null ? Number(ambassador.discountMaxCap) : null,
        };
      }
    }
    // an invalid/stale code at this point silently falls back to full price —
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
    ambassador: appliedAmbassador,
    qrDataUrl,
  });
}
