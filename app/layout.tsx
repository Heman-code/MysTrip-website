import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "MysTrip — Every Trip is a Mystery",
    template: "%s | MysTrip",
  },
  description:
    "Personalised travel experiences for college students. Explore smarter with curated trips, treks, and adventures across India.",
  keywords: ["travel", "trips", "treks", "college travel", "Jaipur", "student travel", "MysTrip"],
  openGraph: {
    title: "MysTrip — Every Trip is a Mystery",
    description: "Personalised travel experiences for college students.",
    url: "https://www.mystrip.in",
    siteName: "MysTrip",
    locale: "en_IN",
    type: "website",
  },
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
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@700,600,500,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
