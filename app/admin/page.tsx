import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users, reviews, registrations, trips } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { getAllDbTripsForAdmin } from "@/lib/db/trips";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") redirect("/");

  const [[{ total: totalUsers }], [{ total: totalBookings }], [{ total: pendingReviews }], [{ total: pendingRegistrations }], allUsers, rawReviews, rawRegistrations, allTrips] =
    await Promise.all([
      db.select({ total: count() }).from(users),
      db.select({ total: count() }).from(registrations),
      db.select({ total: count() }).from(reviews).where(eq(reviews.isApproved, false)),
      db.select({ total: count() }).from(registrations).where(eq(registrations.bookingStatus, "pending_payment")),
      db.select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        college: users.college,
        role: users.role,
        createdAt: users.createdAt,
      }).from(users).orderBy(users.createdAt),
      db.select({
        id: reviews.id,
        rating: reviews.rating,
        body: reviews.body,
        createdAt: reviews.createdAt,
        userName: users.fullName,
        tripTitle: trips.title,
      })
        .from(reviews)
        .innerJoin(users, eq(reviews.userId, users.id))
        .innerJoin(trips, eq(reviews.tripId, trips.id))
        .where(eq(reviews.isApproved, false))
        .orderBy(reviews.createdAt),
      db.select({
        id: registrations.id,
        amount: registrations.amount,
        discountAmount: registrations.discountAmount,
        whatsappNumber: registrations.whatsappNumber,
        guardianPhone: registrations.guardianPhone,
        collegeRegNumber: registrations.collegeRegNumber,
        paymentScreenshot: registrations.paymentScreenshot,
        createdAt: registrations.createdAt,
        userName: users.fullName,
        userEmail: users.email,
        tripTitle: trips.title,
      })
        .from(registrations)
        .innerJoin(users, eq(registrations.userId, users.id))
        .innerJoin(trips, eq(registrations.tripId, trips.id))
        .where(eq(registrations.bookingStatus, "pending_payment"))
        .orderBy(registrations.createdAt),
      getAllDbTripsForAdmin(),
    ]);

  return (
    <AdminClient
      stats={{
        totalUsers: Number(totalUsers),
        totalBookings: Number(totalBookings),
        pendingReviews: Number(pendingReviews),
        pendingRegistrations: Number(pendingRegistrations),
      }}
      users={allUsers.map((u) => ({
        ...u,
        role: u.role ?? "user",
        createdAt: u.createdAt?.toISOString() ?? "",
      }))}
      pendingReviews={rawReviews.map((r) => ({
        ...r,
        createdAt: r.createdAt?.toISOString() ?? "",
      }))}
      pendingRegistrations={rawRegistrations.map((r) => ({
        ...r,
        amount: Number(r.amount),
        discountAmount: Number(r.discountAmount ?? 0),
        createdAt: r.createdAt?.toISOString() ?? "",
      }))}
      trips={allTrips.map((t) => ({
        id: t.id,
        slug: t.slug,
        title: t.title,
        shortTitle: t.shortTitle ?? "",
        destination: t.destination,
        state: t.state ?? "",
        source: t.source ?? "mystrip",
        category: t.category ?? "day_exploration",
        status: t.status ?? "open",
        difficulty: t.difficulty ?? "Easy",
        tripDate: t.tripDate,
        returnDate: t.returnDate ?? "",
        departureTime: t.departureTime ?? "",
        returnTime: t.returnTime ?? "",
        basePrice: Number(t.basePrice),
        maxSlots: t.maxSlots,
        minSlots: t.minSlots ?? 10,
        bookedSlots: t.bookedSlots ?? 0,
        shortDescription: t.shortDescription ?? "",
        description: t.description ?? "",
        highlights: (t.highlights as string[] | null) ?? [],
        inclusions: (t.inclusions as string[] | null) ?? [],
        exclusions: (t.exclusions as string[] | null) ?? [],
        coverImage: t.coverImage ?? "",
        tag: t.tag ?? "",
        tagColor: t.tagColor ?? "#FF6016",
        accentColor: t.accentColor ?? "#FF6016",
        registrationOpen: !!t.registrationOpen,
      }))}
    />
  );
}
