import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ambassadors, users } from "@/lib/db/schema";
import { isAdminRole } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || !isAdminRole(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    userId, referralCode, tier, instagramHandle, upiId,
    discountType, discountValue, discountMaxCap,
    commissionType, commissionValue, commissionBase,
    notes,
  } = body ?? {};

  const requiredFields = { userId, referralCode, discountType, discountValue, commissionType, commissionValue };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (value === undefined || value === null || value === "") {
      return NextResponse.json({ error: `Missing required field: ${key}` }, { status: 400 });
    }
  }

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const [existingAmbassador] = await db.select({ id: ambassadors.id }).from(ambassadors).where(eq(ambassadors.userId, userId)).limit(1);
  if (existingAmbassador) {
    return NextResponse.json({ error: "This user is already an ambassador." }, { status: 409 });
  }

  const normalizedCode = String(referralCode).trim().toUpperCase();
  const [existingCode] = await db.select({ id: ambassadors.id }).from(ambassadors).where(eq(ambassadors.referralCode, normalizedCode)).limit(1);
  if (existingCode) {
    return NextResponse.json({ error: "That referral code is already taken." }, { status: 409 });
  }

  const id = randomUUID();
  await db.batch([
    db.insert(ambassadors).values({
      id,
      userId,
      referralCode: normalizedCode,
      tier: tier || "micro",
      instagramHandle: instagramHandle || null,
      upiId: upiId || null,
      discountType,
      discountValue: String(discountValue),
      discountMaxCap: discountMaxCap !== undefined && discountMaxCap !== null && discountMaxCap !== "" ? String(discountMaxCap) : null,
      commissionType,
      commissionValue: String(commissionValue),
      commissionBase: commissionBase || "post_discount",
      notes: notes || null,
      createdBy: session.user?.email ?? session.user?.id ?? "admin",
    }),
    db.update(users).set({ isAmbassador: true }).where(eq(users.id, userId)),
  ]);

  revalidatePath("/admin");
  revalidatePath("/dashboard");

  return NextResponse.json({ ok: true, ambassador: { id, referralCode: normalizedCode } }, { status: 201 });
}
