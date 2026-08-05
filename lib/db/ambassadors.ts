import { and, count, desc, eq, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { ambassadors, payouts, referralClicks, registrations, users } from "@/lib/db/schema";

export async function getAllAmbassadorsForAdmin() {
  const [rows, clickCounts, bookingStats, payoutSums, pendingPayoutRows] = await Promise.all([
    db
      .select({
        id: ambassadors.id,
        userId: ambassadors.userId,
        fullName: users.fullName,
        email: users.email,
        referralCode: ambassadors.referralCode,
        tier: ambassadors.tier,
        instagramHandle: ambassadors.instagramHandle,
        upiId: ambassadors.upiId,
        status: ambassadors.status,
        discountType: ambassadors.discountType,
        discountValue: ambassadors.discountValue,
        discountMaxCap: ambassadors.discountMaxCap,
        commissionType: ambassadors.commissionType,
        commissionValue: ambassadors.commissionValue,
        commissionBase: ambassadors.commissionBase,
        notes: ambassadors.notes,
        createdAt: ambassadors.createdAt,
      })
      .from(ambassadors)
      .innerJoin(users, eq(ambassadors.userId, users.id))
      .orderBy(desc(ambassadors.createdAt)),
    db.select({ ambassadorId: referralClicks.ambassadorId, clicks: count() }).from(referralClicks).groupBy(referralClicks.ambassadorId),
    db
      .select({ ambassadorId: registrations.referredAmbassadorId, bookings: count(), revenue: sum(registrations.amount) })
      .from(registrations)
      .where(eq(registrations.bookingStatus, "confirmed"))
      .groupBy(registrations.referredAmbassadorId),
    db.select({ ambassadorId: payouts.ambassadorId, status: payouts.status, total: sum(payouts.amount) }).from(payouts).groupBy(payouts.ambassadorId, payouts.status),
    db
      .select({ id: payouts.id, ambassadorId: payouts.ambassadorId, amount: payouts.amount, createdAt: payouts.createdAt })
      .from(payouts)
      .where(eq(payouts.status, "pending"))
      .orderBy(desc(payouts.createdAt)),
  ]);

  const clicksByAmbassador = new Map(clickCounts.map((c) => [c.ambassadorId, Number(c.clicks)]));
  const bookingsByAmbassador = new Map(bookingStats.filter((b) => b.ambassadorId).map((b) => [b.ambassadorId as string, { bookings: Number(b.bookings), revenue: Number(b.revenue ?? 0) }]));
  const payoutsByAmbassador = new Map<string, { pending: number; paid: number }>();
  for (const p of payoutSums) {
    const entry = payoutsByAmbassador.get(p.ambassadorId) ?? { pending: 0, paid: 0 };
    if (p.status === "paid") entry.paid += Number(p.total ?? 0);
    else entry.pending += Number(p.total ?? 0);
    payoutsByAmbassador.set(p.ambassadorId, entry);
  }

  const pendingPayoutsByAmbassador = new Map<string, { id: string; amount: number; createdAt: string }[]>();
  for (const p of pendingPayoutRows) {
    const list = pendingPayoutsByAmbassador.get(p.ambassadorId) ?? [];
    list.push({ id: p.id, amount: Number(p.amount), createdAt: p.createdAt?.toISOString() ?? "" });
    pendingPayoutsByAmbassador.set(p.ambassadorId, list);
  }

  return rows.map((r) => ({
    ...r,
    clicks: clicksByAmbassador.get(r.id) ?? 0,
    bookingsAttributed: bookingsByAmbassador.get(r.id)?.bookings ?? 0,
    revenue: bookingsByAmbassador.get(r.id)?.revenue ?? 0,
    payoutPending: payoutsByAmbassador.get(r.id)?.pending ?? 0,
    payoutPaid: payoutsByAmbassador.get(r.id)?.paid ?? 0,
    pendingPayouts: pendingPayoutsByAmbassador.get(r.id) ?? [],
  }));
}

export async function getAmbassadorDashboardData(userId: string) {
  const [ambassador] = await db.select().from(ambassadors).where(eq(ambassadors.userId, userId)).limit(1);
  if (!ambassador) return null;

  const [[clickRow], [bookingRow], payoutRows] = await Promise.all([
    db.select({ clicks: count() }).from(referralClicks).where(eq(referralClicks.ambassadorId, ambassador.id)),
    db
      .select({ bookings: count(), revenue: sum(registrations.amount) })
      .from(registrations)
      .where(and(eq(registrations.referredAmbassadorId, ambassador.id), eq(registrations.bookingStatus, "confirmed"))),
    db.select().from(payouts).where(eq(payouts.ambassadorId, ambassador.id)).orderBy(desc(payouts.createdAt)),
  ]);

  const payoutPending = payoutRows.filter((p) => p.status === "pending").reduce((sum_, p) => sum_ + Number(p.amount), 0);

  return {
    ambassador,
    clicks: Number(clickRow?.clicks ?? 0),
    bookingsAttributed: Number(bookingRow?.bookings ?? 0),
    revenue: Number(bookingRow?.revenue ?? 0),
    payoutPending,
    payoutHistory: payoutRows,
  };
}
