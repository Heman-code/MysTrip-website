import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ambassadors, payouts, registrations } from "@/lib/db/schema";
import { computeCommission } from "@/lib/ambassadors";
import { isAdminRole } from "@/lib/admin-auth";

// Manual attribution for the current WhatsApp-based flow: the admin logs
// "this booking / this amount was referred by this code" after the fact.
// Two shapes:
//  - registrationId given: an in-app booking that exists but never captured
//    the referral code (no ref-link click, or it was told to the founder
//    verbally) — we snapshot the code/commission onto that row and create
//    the payout directly, since confirmation already happened.
//  - registrationId omitted: a WhatsApp-only booking with no registration
//    row at all — a standalone payout, per the schema's nullable registrationId.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || !isAdminRole(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: ambassadorId } = await params;
  const [ambassador] = await db.select().from(ambassadors).where(eq(ambassadors.id, ambassadorId)).limit(1);
  if (!ambassador) {
    return NextResponse.json({ error: "Ambassador not found" }, { status: 404 });
  }

  const body = await req.json();
  const { registrationId, commissionAmount } = body ?? {};

  if (registrationId) {
    const [registration] = await db
      .select({
        id: registrations.id,
        bookingStatus: registrations.bookingStatus,
        amount: registrations.amount,
        discountAmount: registrations.discountAmount,
        referredAmbassadorId: registrations.referredAmbassadorId,
      })
      .from(registrations)
      .where(eq(registrations.id, registrationId))
      .limit(1);

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }
    if (registration.bookingStatus !== "confirmed") {
      return NextResponse.json({ error: "Only confirmed registrations can be attributed to a payout." }, { status: 409 });
    }
    if (registration.referredAmbassadorId) {
      return NextResponse.json({ error: "This registration is already attributed to an ambassador." }, { status: 409 });
    }

    const finalAmount = Number(registration.amount);
    const originalAmount = finalAmount + Number(registration.discountAmount ?? 0);
    const amount = commissionAmount !== undefined && commissionAmount !== ""
      ? Number(commissionAmount)
      : computeCommission(originalAmount, finalAmount, ambassador);

    await db.batch([
      db.update(registrations).set({ referredAmbassadorId: ambassadorId, referralCode: ambassador.referralCode, referralCommissionSnapshot: String(amount) }).where(eq(registrations.id, registrationId)),
      db.insert(payouts).values({ ambassadorId, registrationId, amount: String(amount), status: "pending" }),
    ]);

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  if (commissionAmount === undefined || commissionAmount === "" || Number.isNaN(Number(commissionAmount))) {
    return NextResponse.json({ error: "Enter a commission amount for this manual entry." }, { status: 400 });
  }

  await db.insert(payouts).values({ ambassadorId, registrationId: null, amount: String(Number(commissionAmount)), status: "pending" });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return NextResponse.json({ ok: true }, { status: 201 });
}
