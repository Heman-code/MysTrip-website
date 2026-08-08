import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/Providers";
import JsonLd from "@/components/seo/JsonLd";
import UpcomingTripsPopup from "@/components/layout/UpcomingTripsPopup";
import StickyTripBar from "@/components/layout/StickyTripBar";
import { getDbUpcomingTrips, toTripCardData } from "@/lib/db/trips";

const organizationSchema = {
  "@context": "https://schema.org",
  // Deliberately not "TravelAgency" — MysTrip is a community, not a
  // commercial trip-booking business, and the structured data shouldn't
  // say otherwise.
  "@type": "Organization",
  name: "MysTrip",
  alternateName: "MysTrip Travel Tribe",
  url: "https://www.mystrip.in",
  logo: "https://www.mystrip.in/logos/primary-logo.webp",
  description:
    "MysTrip is the original tribe-led youth travel community at Manipal University Jaipur (MUJ), founded 1st March 2025. Not a travel agency — a student-run community that designs shared trekking and travel experiences to turn strangers into a tribe.",
  foundingDate: "2025-03-01",
  founder: [
    { "@type": "Person", name: "Hemant Kumar Sharma" },
    { "@type": "Person", name: "Arpita Dutta" },
  ],
  email: "team@mystrip.in",
  telephone: "+91-8822068322",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Jaipur",
    addressRegion: "Rajasthan",
    addressCountry: "IN",
  },
  areaServed: { "@type": "City", name: "Jaipur" },
  sameAs: ["https://instagram.com/mystrip.in", "https://linkedin.com/company/mystrip"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MysTrip",
  url: "https://www.mystrip.in",
};

export const metadata: Metadata = {
  title: {
    default: "MysTrip — Your Travel Tribe in Jaipur | Not a Tour. A Tribe.",
    template: "%s | MysTrip",
  },
  description:
    "MysTrip is Jaipur's youth travel tribe — treks, day explorations, and weekend escapes built for Manipal University Jaipur (MUJ) students and the wider Jaipur college crowd. Not a tour. Not a package. A bunch of strangers who become your people.",
  keywords: [
    "MysTrip",
    "travel tribe",
    "youth travel community India",
    "college trips Jaipur",
    "Manipal University Jaipur students",
    "MUJ student travel",
    "Jaipur student trips",
    "Jaipur trekking group",
    "upcoming trips Jaipur",
    "Sundarone Tribe",
    "Aravali treks",
    "weekend trips from Jaipur",
  ],
  openGraph: {
    title: "MysTrip — Your Travel Tribe in Jaipur",
    description: "Not a tour. Not a package. A bunch of strangers who become your people.",
    url: "https://www.mystrip.in",
    siteName: "MysTrip",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/trips/hero-udaipur-cliff-group-2.webp", width: 1200, height: 630, alt: "MysTrip travellers on a trip" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MysTrip — Your Travel Tribe in Jaipur",
    description: "Not a tour. Not a package. A bunch of strangers who become your people.",
    images: ["/trips/hero-udaipur-cliff-group-2.webp"],
  },
  alternates: { canonical: "https://www.mystrip.in" },
  robots: { index: true, follow: true },
  metadataBase: new URL("https://www.mystrip.in"),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const upcomingTrips = (await getDbUpcomingTrips(undefined, 2)).map(toTripCardData);

  return (
    <html lang="en">
      <head>
        {/* Self-hosted — the hero H1 uses this weight, and a third-party
            font CDN round trip was directly delaying LCP (the browser
            couldn't finalize the text paint until the webfont arrived). */}
        <link
          rel="preload"
          href="/fonts/clash-display/clash-display-700.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <UpcomingTripsPopup trips={upcomingTrips} />
          <StickyTripBar trip={upcomingTrips[0] ?? null} />
        </Providers>
      </body>
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <>
          {/* lazyOnload: analytics has zero business competing with LCP/FCP
              for main-thread or network time. trackEvent() already pushes
              straight onto window.dataLayer, so events fire and queue fine
              even before this script has loaded — gtag.js just drains the
              queue once it arrives. */}
          <Script
            id="ga-init"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');`,
            }}
          />
          <Script
            id="ga-src"
            strategy="lazyOnload"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          />
        </>
      )}
    </html>
  );
}
