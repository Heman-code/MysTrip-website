import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getDbTripBySlug } from "@/lib/db/trips";
import { generateUpiQrDataUrl, UPI_ID } from "@/lib/upi";
import RegisterClient from "./RegisterClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getDbTripBySlug(slug);
  return { title: trip ? `Register — ${trip.title} | MysTrip` : "Register | MysTrip" };
}

export default async function RegisterPage({ params }: Props) {
  const { slug } = await params;
  const trip = await getDbTripBySlug(slug);
  if (!trip || !trip.registrationOpen) notFound();

  const session = await auth();
  if (!session?.user) redirect(`/auth/login?callbackUrl=/trips/${slug}/register`);

  const basePrice = Number(trip.basePrice);
  const qrDataUrl = await generateUpiQrDataUrl(basePrice, `${trip.title} ${trip.shortTitle ?? ""}`);

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
      qrDataUrl={qrDataUrl}
      upiId={UPI_ID}
      userName={session.user.name ?? ""}
      userEmail={session.user.email ?? ""}
    />
  );
}
