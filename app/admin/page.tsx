import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users, reviews, registrations, trips } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") redirect("/");

  const [[{ total: totalUsers }], [{ total: totalBookings }], [{ total: pendingReviews }], allUsers, rawReviews] =
    await Promise.all([
      db.select({ total: count() }).from(users),
      db.select({ total: count() }).from(registrations),
      db.select({ total: count() }).from(reviews).where(eq(reviews.isApproved, false)),
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
    ]);

  return (
    <AdminClient
      stats={{
        totalUsers: Number(totalUsers),
        totalBookings: Number(totalBookings),
        pendingReviews: Number(pendingReviews),
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
    />
  );
}
