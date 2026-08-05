import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users, registrations, trips, reviews } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getAmbassadorDashboardData } from "@/lib/db/ambassadors";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/dashboard");

  // Look up user by email to get createdAt and past trips
  const [dbUser] = await db
    .select({ id: users.id, fullName: users.fullName, college: users.college, createdAt: users.createdAt, isAmbassador: users.isAmbassador })
    .from(users)
    .where(eq(users.email, session.user.email!))
    .limit(1);

  const ambassadorData = dbUser?.isAmbassador ? await getAmbassadorDashboardData(dbUser.id) : null;

  // Fetch past trips via registrations
  const pastTrips = dbUser
    ? await db
        .select({
          id: trips.id,
          title: trips.title,
          destination: trips.destination,
          tripDate: trips.tripDate,
          category: trips.category,
          amount: registrations.amount,
        })
        .from(registrations)
        .innerJoin(trips, eq(registrations.tripId, trips.id))
        .where(eq(registrations.userId, dbUser.id))
        .orderBy(trips.tripDate)
    : [];

  const joinedDate = dbUser?.createdAt
    ? dbUser.createdAt.toLocaleString("en-US", { month: "long", year: "numeric" })
    : new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  // Trips eligible for a review: booking confirmed, trip actually happened, not already reviewed
  const reviewedRegIds = dbUser
    ? new Set((await db.select({ registrationId: reviews.registrationId }).from(reviews).where(eq(reviews.userId, dbUser.id))).map((r) => r.registrationId))
    : new Set<string>();

  const reviewableRegs = dbUser
    ? await db
        .select({ registrationId: registrations.id, tripTitle: trips.title, tripDate: trips.tripDate })
        .from(registrations)
        .innerJoin(trips, eq(registrations.tripId, trips.id))
        .where(and(eq(registrations.userId, dbUser.id), eq(registrations.bookingStatus, "confirmed"), eq(trips.status, "executed")))
        .orderBy(trips.tripDate)
    : [];

  const reviewableTrips = reviewableRegs.filter((r) => !reviewedRegIds.has(r.registrationId));

  return (
    <DashboardClient
      user={{
        name: session.user.name ?? dbUser?.fullName ?? "Traveller",
        email: session.user.email ?? "",
        college: (session.user as { college?: string }).college ?? dbUser?.college ?? "",
        joinedDate,
      }}
      pastTrips={pastTrips.map((t) => ({
        id: t.id,
        title: t.title,
        destination: t.destination,
        tripDate: t.tripDate ?? "",
        category: t.category ?? "trek",
        amount: Number(t.amount),
      }))}
      reviewableTrips={reviewableTrips.map((r) => ({
        registrationId: r.registrationId,
        tripTitle: r.tripTitle,
        tripDate: r.tripDate ?? "",
      }))}
      reviewsLeftCount={reviewedRegIds.size}
      ambassador={
        ambassadorData
          ? {
              referralCode: ambassadorData.ambassador.referralCode,
              discountType: ambassadorData.ambassador.discountType,
              discountValue: Number(ambassadorData.ambassador.discountValue),
              discountMaxCap: ambassadorData.ambassador.discountMaxCap !== null ? Number(ambassadorData.ambassador.discountMaxCap) : null,
              clicks: ambassadorData.clicks,
              bookingsAttributed: ambassadorData.bookingsAttributed,
              revenue: ambassadorData.revenue,
              payoutPending: ambassadorData.payoutPending,
              payoutHistory: ambassadorData.payoutHistory.map((p) => ({
                id: p.id,
                amount: Number(p.amount),
                status: p.status ?? "pending",
                paidAt: p.paidAt?.toISOString() ?? null,
                createdAt: p.createdAt?.toISOString() ?? "",
              })),
            }
          : null
      }
    />
  );
}
