import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "MysTrip — Not a Tour. A Tribe.",
    template: "%s | MysTrip",
  },
  description:
    "India's youth travel community. Not a tour. Not a package. A bunch of strangers who become your people. Treks, explorations, and adventures built for college students.",
  keywords: ["youth travel", "college trips", "tribe travel", "Jaipur student travel", "MysTrip", "trekking", "Sundarone"],
  openGraph: {
    title: "MysTrip — Not a Tour. A Tribe.",
    description: "Not a tour. Not a package. A bunch of strangers who become your people.",
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
        {/* Mozilla Text — brand body font */}
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=mozilla-text:400,500,600,700&display=swap"
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
