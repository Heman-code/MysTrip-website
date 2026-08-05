import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users, reviews, registrations, trips } from "@/lib/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { getAllDbTripsForAdmin } from "@/lib/db/trips";
import { getAllPoisWithEventsForAdmin, type EntryFees } from "@/lib/db/pois";
import { getAllAmbassadorsForAdmin } from "@/lib/db/ambassadors";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") redirect("/");

  const [[{ total: totalUsers }], [{ total: totalBookings }], [{ total: pendingReviews }], [{ total: pendingRegistrations }], allUsers, rawReviews, rawRegistrations, rawConfirmedRegistrations, allTrips, allPoisWithEvents] =
    await Promise.all([
      db.select({ total: count() }).from(users),
      db.select({ total: count() }).from(registrations),
      db.select({ total: count() }).from(reviews).where(eq(reviews.isApproved, false)),
      db.select({ total: count() }).from(registrations).where(eq(registrations.bookingStatus, "pending_payment")),
      db.select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        college: users.college,
        role: users.role,
        isAmbassador: users.isAmbassador,
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
        .where(eq(registrations.bookingStatus, "confirmed"))
        .orderBy(desc(registrations.createdAt)),
      getAllDbTripsForAdmin(),
      getAllPoisWithEventsForAdmin(),
    ]);

  // Run after the main batch, not folded into the Promise.all above — the
  // POI query's own comment already flags Neon HTTP-driver connection
  // throttling as a real prior issue with this many concurrent queries, and
  // this fetches its own 4 aggregate queries internally.
  const allAmbassadors = await getAllAmbassadorsForAdmin();

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
        isAmbassador: !!u.isAmbassador,
        createdAt: u.createdAt?.toISOString() ?? "",
      }))}
      ambassadors={allAmbassadors.map((a) => ({
        ...a,
        discountValue: Number(a.discountValue),
        discountMaxCap: a.discountMaxCap !== null ? Number(a.discountMaxCap) : null,
        commissionValue: Number(a.commissionValue),
        tier: a.tier ?? "micro",
        status: a.status ?? "active",
        commissionBase: a.commissionBase ?? "post_discount",
        createdAt: a.createdAt?.toISOString() ?? "",
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
      confirmedRegistrations={rawConfirmedRegistrations.map((r) => ({
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
      pois={allPoisWithEvents.map(({ poi: p, events }) => ({
        id: p.id,
        citySlug: p.citySlug,
        slug: p.slug,
        name: p.name,
        category: p.category ?? "other",
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
        address: p.address ?? "",
        shortDescription: p.shortDescription ?? "",
        longDescription: p.longDescription ?? "",
        interestTags: (p.interestTags as string[] | null) ?? [],
        photos: (p.photos as string[] | null) ?? [],
        coverImage: p.coverImage ?? "",
        openingHours: (p.openingHours as Record<string, { open: string; close: string }[]> | null) ?? null,
        avgVisitDurationMinutes: p.avgVisitDurationMinutes ?? 60,
        entryFees: (p.entryFees as EntryFees | null) ?? {},
        googleRating: p.googleRating !== null ? Number(p.googleRating) : null,
        isActive: !!p.isActive,
        source: p.source ?? "manual",
        specialEvents: events.map((e) => ({
          name: e.name,
          description: e.description ?? "",
          daysOfWeek: (e.daysOfWeek as string[] | null) ?? [],
          startTime: e.startTime,
          endTime: e.endTime,
          isMustSee: !!e.isMustSee,
        })),
      }))}
    />
  );
}
