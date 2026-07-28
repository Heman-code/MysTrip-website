import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-24" style={{ background: "#F9F7F4" }}>
      <div className="rounded-full p-4 mb-5" style={{ background: "rgba(255,96,22,0.1)" }}>
        <Compass size={32} style={{ color: "#FF6016" }} />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#FF6016" }}>
        404
      </p>
      <h1
        className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3"
        style={{ fontFamily: "'Clash Display', sans-serif" }}
      >
        This trail doesn&apos;t exist.
      </h1>
      <p className="text-sm sm:text-base text-gray-500 max-w-md mb-8">
        The page you&apos;re looking for has moved or never existed. Let&apos;s get you back on the map.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-full font-bold text-white text-sm transition-all hover:opacity-90"
          style={{ background: "#FF6016" }}
        >
          Back to Home
        </Link>
        <Link
          href="/trips"
          className="px-6 py-3 rounded-full font-bold text-sm transition-all hover:bg-gray-100"
          style={{ border: "1.5px solid #e5e7eb", color: "#374151" }}
        >
          Explore Trips
        </Link>
      </div>
    </div>
  );
}
