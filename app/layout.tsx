import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/Providers";
import JsonLd from "@/components/seo/JsonLd";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "MysTrip",
  alternateName: "MysTrip Travel Tribe",
  url: "https://www.mystrip.in",
  logo: "https://www.mystrip.in/logos/primary-logo.png",
  description:
    "MysTrip is a tribe-led youth travel community for college students in Jaipur, including Manipal University Jaipur (MUJ). Treks, day explorations, weekend escapes, and semester trips.",
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
    images: [{ url: "/trips/hero-udaipur-cliff-group-2.jpg", width: 1200, height: 630, alt: "MysTrip travellers on a trip" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MysTrip — Your Travel Tribe in Jaipur",
    description: "Not a tour. Not a package. A bunch of strangers who become your people.",
    images: ["/trips/hero-udaipur-cliff-group-2.jpg"],
  },
  alternates: { canonical: "https://www.mystrip.in" },
  robots: { index: true, follow: true },
  metadataBase: new URL("https://www.mystrip.in"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        {/* Loaded via JS instead of a blocking <link rel="stylesheet"> so it doesn't delay first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://api.fontshare.com/v2/css?f[]=clash-display@700,600,500,400&display=swap';document.head.appendChild(l);})();`,
          }}
        />
        <noscript>
          <link
            href="https://api.fontshare.com/v2/css?f[]=clash-display@700,600,500,400&display=swap"
            rel="stylesheet"
          />
        </noscript>
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
