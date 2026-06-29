import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users, registrations, trips } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/dashboard");

  // Look up user by email to get createdAt and past trips
  const [dbUser] = await db
    .select({ id: users.id, fullName: users.fullName, college: users.college, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.email, session.user.email!))
    .limit(1);

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
    />
  );
}
