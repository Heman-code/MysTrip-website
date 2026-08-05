import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ambassadors } from "@/lib/db/schema";

export { REFERRAL_COOKIE, readReferralCode } from "@/lib/referral-cookie";

// referralCode is always stored uppercase (see uniqueReferralCode / the admin
// promote flow), so a direct equality check is enough — no need for a case-
// insensitive SQL function that would bypass the index.
export async function getActiveAmbassadorByCode(code: string) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  const [ambassador] = await db
    .select()
    .from(ambassadors)
    .where(and(eq(ambassadors.referralCode, normalized), eq(ambassadors.status, "active")))
    .limit(1);
  return ambassador ?? null;
}

export async function getAmbassadorByUserId(userId: string) {
  const [ambassador] = await db.select().from(ambassadors).where(eq(ambassadors.userId, userId)).limit(1);
  return ambassador ?? null;
}
