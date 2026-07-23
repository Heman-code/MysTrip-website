import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Coming Soon | MysTrip",
  description: "Trip stories, guides, and behind-the-scenes from the MysTrip tribe. Coming soon.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24" style={{ background: "#0B1210" }}>
      <div className="text-center max-w-lg">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(255,96,22,0.15)" }}>
          <PenLine size={24} style={{ color: "#FF6016" }} />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#FF6016" }}>
          Coming Soon
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Clash Display', sans-serif" }}>
          The Tribe&apos;s stories, coming soon.
        </h1>
        <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-10">
          Trip recaps, packing guides, hidden spots our hosts won&apos;t shut up about, and the odd 2am story from
          the road. We&apos;re writing it up — check back soon.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/trips"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-white text-sm transition-all hover:opacity-90"
            style={{ background: "#FF6016" }}
          >
            Explore Trips <ArrowRight size={15} />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-semibold text-sm text-white/60 hover:text-white transition-colors"
            style={{ border: "1.5px solid rgba(255,255,255,0.15)" }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
