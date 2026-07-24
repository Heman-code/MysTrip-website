import HeroSection from "@/components/home/HeroSection";
import UpcomingTrips from "@/components/home/UpcomingTrips";
import TribeGallery from "@/components/home/TribeGallery";
import WhyMysTrip from "@/components/home/WhyMysTrip";
import SundaroneBanner from "@/components/home/SundaroneBanner";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import { getDbUpcomingTrips, toTripCardData } from "@/lib/db/trips";

export default async function HomePage() {
  const dbTrips = await getDbUpcomingTrips();
  const allTrips = dbTrips.map(toTripCardData);

  return (
    <>
      <HeroSection />
      <UpcomingTrips featuredTrips={allTrips.slice(0, 3)} totalTripsCount={allTrips.length} />
      <TribeGallery />
      <WhyMysTrip />
      <SundaroneBanner />
      <TestimonialsSection />
    </>
  );
}
