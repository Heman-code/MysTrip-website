import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms that cover booking and joining a MysTrip or Sundarone Tribe trip.",
};

const sections = [
  {
    title: "1. Who this covers",
    body: [
      "These terms apply to anyone who creates a MysTrip account or registers for a MysTrip or Sundarone Tribe trip. Sundarone Tribe is a project run by MysTrip, exclusively for Sundarone Hostel residents — same rules, same team behind it.",
    ],
  },
  {
    title: "2. Your account",
    body: [
      "You need an account to register for any trip. Keep your login details to yourself, and give us accurate information — especially your WhatsApp number and guardian's number, since that's how we reach you and your emergency contact if something comes up on a trip.",
    ],
  },
  {
    title: "3. Booking & payment",
    body: [
      "Trips are paid for via UPI. After paying, you upload a screenshot as proof, and our team manually verifies it and confirms your seat — usually within 24 hours. Your seat isn't guaranteed until you get that confirmation, and spots are limited on every trip.",
    ],
  },
  {
    title: "4. Cancellation & refunds",
    body: [
      "Full refund if you cancel 7+ days before departure.",
      "50% refund if you cancel 3–7 days before departure.",
      "No refund within 72 hours of departure.",
      "You can always transfer your spot to a future trip instead of cancelling outright — just message us on WhatsApp.",
    ],
  },
  {
    title: "5. On the trip",
    body: [
      "A few non-negotiables so everyone has a great day:",
      "No smoking or alcohol, anywhere, anytime during the trip. Zero exceptions.",
      "Carry a valid student/college ID. If a monument counter won't accept it, you cover any price difference yourself, on the spot.",
      "Stick with the group and your crew lead at every stop — buses and vehicles leave on schedule, with or without stragglers.",
      "Don't wander off solo. Tell a crew lead before you step away from the group.",
      "Respect monument rules and dress codes, especially at temples — we're guests there.",
      "Your belongings — phone, wallet, everything — are your own responsibility.",
      "Our crew may shoot photos and reels during the trip for MysTrip's or Sundarone Tribe's Instagram. Not feeling the camera on a given day? Just tell a crew lead.",
      "Repeated rule-breaking gets you sent home from the trip, with no refund. We'd rather that never happen, so let's not get there.",
    ],
  },
  {
    title: "6. Treks & physical activity",
    body: [
      "Treks involve early starts, uneven terrain, and real physical effort. Let us know about any medical condition that could affect your safety before you register, and carry enough water and basic essentials as listed on the trip page.",
    ],
  },
  {
    title: "7. Changes on our end",
    body: [
      "Occasionally a trip may be postponed or, rarely, cancelled — due to weather, low registrations, or circumstances outside our control. If that happens, you'll get a full refund or the option to move to another batch.",
    ],
  },
  {
    title: "8. Changes to these terms",
    body: [
      "We may update these terms as MysTrip grows. Meaningful changes will be reflected here with an updated date.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div style={{ background: "#F9F7F4" }} className="min-h-screen">
      <section className="pt-24 pb-14 sm:pt-28 sm:pb-16" style={{ background: "#0B1210" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#FF6016" }}>
            Legal
          </p>
          <h1
            className="text-3xl sm:text-5xl font-bold text-white leading-tight"
            style={{ fontFamily: "'Clash Display', sans-serif", letterSpacing: "-0.02em" }}
          >
            Terms
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/50 max-w-lg">
            Last updated July 2026. The rules that keep every trip running smoothly.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        {sections.map((s) => (
          <div key={s.title} className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              {s.title}
            </h2>
            <div className="space-y-2.5">
              {s.body.map((p) => (
                <p key={p} className="text-sm sm:text-base text-gray-600 leading-relaxed flex items-start gap-2.5">
                  <span className="mt-2 w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#FF6016" }} />
                  {p}
                </p>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-2xl p-6 sm:p-8 text-center" style={{ background: "#01574A" }}>
          <p className="text-white font-bold mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Questions before you book?
          </p>
          <p className="text-white/60 text-sm mb-5">Talk to a host before you apply.</p>
          <a
            href="https://wa.me/918822068322"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:opacity-90"
            style={{ background: "#25D366", color: "#fff" }}
          >
            WhatsApp Us
          </a>
        </div>

        <p className="text-center text-sm text-gray-400">
          <Link href="/privacy" className="font-semibold hover:underline" style={{ color: "#FF6016" }}>
            Read our Privacy Policy →
          </Link>
        </p>
      </div>
    </div>
  );
}
