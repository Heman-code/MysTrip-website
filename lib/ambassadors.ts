import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ambassadors } from "@/lib/db/schema";

type AmbassadorTerms = Pick<
  typeof ambassadors.$inferSelect,
  "discountType" | "discountValue" | "discountMaxCap" | "commissionType" | "commissionValue" | "commissionBase"
>;

export function computeAmbassadorDiscount(basePrice: number, ambassador: AmbassadorTerms) {
  const discountValue = Number(ambassador.discountValue);
  let discountAmount: number;
  if (ambassador.discountType === "flat") {
    discountAmount = discountValue;
  } else {
    discountAmount = (basePrice * discountValue) / 100;
    if (ambassador.discountMaxCap != null) {
      discountAmount = Math.min(discountAmount, Number(ambassador.discountMaxCap));
    }
  }
  discountAmount = Math.min(Math.max(Math.round(discountAmount), 0), basePrice);
  const finalAmount = Math.max(basePrice - discountAmount, 0);
  return { discountAmount, finalAmount };
}

export function computeCommission(basePrice: number, finalAmount: number, ambassador: AmbassadorTerms) {
  const baseAmount = ambassador.commissionBase === "pre_discount" ? basePrice : finalAmount;
  const commissionValue = Number(ambassador.commissionValue);
  const commission = ambassador.commissionType === "flat" ? commissionValue : (baseAmount * commissionValue) / 100;
  return Math.max(Math.round(commission), 0);
}

export async function uniqueReferralCode(firstName: string) {
  const base = (firstName || "MYSTRIP").trim().split(/\s+/)[0].toUpperCase().replace(/[^A-Z]/g, "").slice(0, 12) || "MYSTRIP";
  for (let i = 0; i < 8; i++) {
    const suffix = String(Math.floor(Math.random() * 900) + 100); // 3 digits
    const code = `${base}${suffix}`;
    const [existing] = await db.select({ id: ambassadors.id }).from(ambassadors).where(eq(ambassadors.referralCode, code)).limit(1);
    if (!existing) return code;
  }
  return `${base}${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}
