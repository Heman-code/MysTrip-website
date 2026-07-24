import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";

const WELCOME_TIERS = {
  welcome_new: { discountPercent: 5, maxDiscountAmount: "500" },
  welcome_returning: { discountPercent: 10, maxDiscountAmount: "1000" },
} as const;

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `WELCOME-${s}`;
}

async function uniqueCouponCode() {
  for (let i = 0; i < 8; i++) {
    const code = randomCode();
    const [existing] = await db.select({ id: coupons.id }).from(coupons).where(eq(coupons.code, code)).limit(1);
    if (!existing) return code;
  }
  // astronomically unlikely, but stay correct
  return `WELCOME-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function issueWelcomeCoupon(userId: string, hasTraveledBefore: boolean) {
  const type = hasTraveledBefore ? "welcome_returning" : "welcome_new";
  const tier = WELCOME_TIERS[type];
  const code = await uniqueCouponCode();

  const [coupon] = await db
    .insert(coupons)
    .values({
      userId,
      code,
      type,
      discountPercent: tier.discountPercent,
      maxDiscountAmount: tier.maxDiscountAmount,
    })
    .returning();

  return coupon;
}

export function computeDiscount(basePrice: number, discountPercent: number, maxDiscountAmount: number) {
  const raw = Math.round((basePrice * discountPercent) / 100);
  const discountAmount = Math.min(raw, maxDiscountAmount);
  const finalAmount = Math.max(basePrice - discountAmount, 0);
  return { discountAmount, finalAmount };
}
