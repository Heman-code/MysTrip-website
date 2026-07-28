import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How MysTrip collects, uses, and protects your information.",
};

const sections = [
  {
    title: "1. What we collect",
    body: [
      "When you create an account: your name, college email, phone number, and college (optional).",
      "When you register for a trip: your WhatsApp number, a guardian's contact number, your college registration number, a screenshot of your UPI payment, and a referral or coupon code if you have one.",
      "Automatically: basic technical data like IP address and browser type, used only for security (e.g. rate-limiting login attempts) and not for tracking or advertising.",
    ],
  },
  {
    title: "2. How we use it",
    body: [
      "To create and secure your account, and to confirm your seat on a trip.",
      "Your guardian's number is collected specifically for emergency contact purposes during treks and multi-day trips — we don't use it for anything else.",
      "Your WhatsApp number is used to add you to the trip group and send logistics updates (departure times, meeting points, changes).",
      "Payment screenshots are used only to manually verify that a UPI transfer was completed, by a MysTrip admin, before confirming your seat.",
    ],
  },
  {
    title: "3. Payment information",
    body: [
      "MysTrip does not process card or bank details directly. Payments are made via UPI to our published UPI ID, and you upload a screenshot as proof — that's it. We never ask for your UPI PIN, OTP, or banking password, and you should never share these with anyone claiming to be from MysTrip.",
    ],
  },
  {
    title: "4. Who we share it with",
    body: [
      "We don't sell your data. It's shared only where necessary to run the service: our database and hosting providers (to store your account and trip data securely), and our email provider (to send account and password-reset emails).",
      "Trip photos/reels shot by our crew during trips may be used on MysTrip's or Sundarone Tribe's Instagram and marketing. If you'd rather not be featured, just tell a crew lead on the day.",
    ],
  },
  {
    title: "5. Data security",
    body: [
      "Passwords are hashed (never stored in plain text). Password reset links are single-use and expire after one hour. Access to admin tools (user lists, payment screenshots) is restricted to MysTrip's own team.",
    ],
  },
  {
    title: "6. Your rights",
    body: [
      "You can ask us to show you what data we hold on you, correct it, or delete your account entirely, by emailing us at team@mystrip.in. We'll respond within a reasonable time.",
    ],
  },
  {
    title: "7. Cookies",
    body: [
      "We use a single essential cookie to keep you logged in. We don't use third-party advertising or tracking cookies.",
    ],
  },
  {
    title: "8. Changes to this policy",
    body: [
      "If this policy changes in a meaningful way, we'll update this page and, where appropriate, let you know directly.",
    ],
  },
];

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/50 max-w-lg">
            Last updated July 2026. Plain-language version — if anything&apos;s unclear, just ask.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        {sections.map((s) => (
          <div key={s.title} className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              {s.title}
            </h2>
            <div className="space-y-3">
              {s.body.map((p) => (
                <p key={p} className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-2xl p-6 sm:p-8 text-center" style={{ background: "#01574A" }}>
          <p className="text-white font-bold mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Questions about your data?
          </p>
          <p className="text-white/60 text-sm mb-5">We&apos;re a small team — email goes straight to us.</p>
          <a
            href="mailto:team@mystrip.in"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:opacity-90"
            style={{ background: "#FF6016", color: "#fff" }}
          >
            team@mystrip.in
          </a>
        </div>

        <p className="text-center text-sm text-gray-400">
          <Link href="/terms" className="font-semibold hover:underline" style={{ color: "#FF6016" }}>
            Read our Terms →
          </Link>
        </p>
      </div>
    </div>
  );
}
