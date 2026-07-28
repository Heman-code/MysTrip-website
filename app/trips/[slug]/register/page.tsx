import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { getDbTripBySlug } from "@/lib/db/trips";
import { UPI_ID } from "@/lib/upi";
import RegisterClient from "./RegisterClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getDbTripBySlug(slug);
  return {
    title: trip ? `Register — ${trip.title}` : "Register",
    robots: { index: false, follow: false },
  };
}

export default async function RegisterPage({ params }: Props) {
  const { slug } = await params;
  const trip = await getDbTripBySlug(slug);
  if (!trip || !trip.registrationOpen) notFound();
  if ((trip.bookedSlots ?? 0) >= trip.maxSlots) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect(`/auth/login?callbackUrl=/trips/${slug}/register`);

  const basePrice = Number(trip.basePrice);

  const [myCoupon] = await db
    .select()
    .from(coupons)
    .where(and(eq(coupons.userId, session.user.id), eq(coupons.isUsed, false)))
    .limit(1);

  return (
    <RegisterClient
      trip={{
        slug: trip.slug,
        title: trip.title,
        destination: trip.destination,
        basePrice,
        coverImage: trip.coverImage ?? "",
        startDate: trip.tripDate,
        tagColor: trip.tagColor ?? "#FF6016",
      }}
      upiId={UPI_ID}
      userName={session.user.name ?? ""}
      userEmail={session.user.email ?? ""}
      myCoupon={
        myCoupon
          ? { code: myCoupon.code, discountPercent: myCoupon.discountPercent, maxDiscountAmount: Number(myCoupon.maxDiscountAmount) }
          : null
      }
    />
  );
}
