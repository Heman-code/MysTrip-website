import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getTripBySlug } from "@/lib/data/trips";
import { generateUpiQrDataUrl, UPI_ID } from "@/lib/upi";
import RegisterClient from "./RegisterClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  return { title: trip ? `Register — ${trip.title} | MysTrip` : "Register | MysTrip" };
}

export default async function RegisterPage({ params }: Props) {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  if (!trip || !trip.inAppRegistration || !trip.registrationOpen) notFound();

  const session = await auth();
  if (!session?.user) redirect(`/auth/login?callbackUrl=/trips/${slug}/register`);

  const qrDataUrl = await generateUpiQrDataUrl(trip.basePrice, `${trip.title} ${trip.shortTitle}`);

  return (
    <RegisterClient
      trip={{
        slug: trip.slug,
        title: trip.title,
        destination: trip.destination,
        basePrice: trip.basePrice,
        coverImage: trip.coverImage,
        startDate: trip.startDate,
        tagColor: trip.tagColor,
      }}
      qrDataUrl={qrDataUrl}
      upiId={UPI_ID}
      userName={session.user.name ?? ""}
      userEmail={session.user.email ?? ""}
    />
  );
}
