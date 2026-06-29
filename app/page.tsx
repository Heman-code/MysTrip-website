import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import UpcomingTrips from "@/components/home/UpcomingTrips";
import TribeGallery from "@/components/home/TribeGallery";
import WhyMysTrip from "@/components/home/WhyMysTrip";
import SundaroneBanner from "@/components/home/SundaroneBanner";
import TestimonialsSection from "@/components/home/TestimonialsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <UpcomingTrips />
      <TribeGallery />
      <WhyMysTrip />
      <SundaroneBanner />
      <TestimonialsSection />
    </>
  );
}
