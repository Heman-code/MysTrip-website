import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "MysTrip is the original travel tribe community at Manipal University Jaipur, founded 1st March 2025 by Hemant Kumar Sharma and Arpita Dutta. Not a tour agency, not a package seller — the story of how a solo gap-year trip became MUJ's first travel community.",
  alternates: { canonical: "https://www.mystrip.in/about" },
};

const values = [
  {
    icon: Compass,
    title: "Tribe-led",
    body: "Every trip is planned with the group in mind, not a checklist of monuments. You show up, your people are already on the list.",
  },
  {
    icon: Sparkles,
    title: "Authentic & great experiences",
    body: "No fake filters on what a trip actually feels like. Real terrain, real food, real 2am conversations with people you met three days ago.",
  },
  {
    icon: HeartHandshake,
    title: "Cultural respect",
    body: "We're guests wherever we go. Every itinerary is built to respect the places and people that host us, not just pass through them.",
  },
  {
    icon: ShieldCheck,
    title: "Human-first travel",
    body: "Safety, consent, and comfort aren't fine print. Verified crew leads, real-time support, and a community that looks out for its own.",
  },
];

const steps = [
  {
    n: "01",
    title: "Find your people",
    body: "Browse a trip, see who's already in. Every MysTrip batch is a mix of strangers who turn out to have a lot in common — starting with wanting off campus for a weekend.",
  },
  {
    n: "02",
    title: "Show up",
    body: "We handle the stays, the routes, the permits, the awkward-icebreaker-avoidance logistics. You handle showing up with a bag and an open mind.",
  },
  {
    n: "03",
    title: "Stay connected",
    body: "The group chat doesn't die when the trip ends. Most tribes keep planning the next one before the bus even gets back to campus.",
  },
];

const galleryPhotos = [
  { src: "/trips/gallery-kedarkantha-boots.webp", alt: "Kedarkantha trek, boots in the snow" },
  { src: "/trips/gallery-sumel-campfire.webp", alt: "Campfire night at Mount Sumel" },
  { src: "/trips/gallery-udaipur-friends.webp", alt: "Friends made on the Udaipur trip" },
  { src: "/trips/gallery-jaisalmer-group.webp", alt: "Group at Jaisalmer Fort" },
  { src: "/trips/gallery-saan-helping-hands.webp", alt: "Helping hands on the Saan Valley trail" },
  { src: "/trips/gallery-raghunath-smile.webp", alt: "A smile at Raghunath Fort" },
];

const stats = [
  { num: "900+", label: "Tribe Members" },
  { num: "2", label: "National Awards" },
  { num: "12,500 ft", label: "Summited" },
  { num: "17+", label: "Trips Done" },
];

export default function AboutPage() {
  return (
    <div style={{ background: "#0B1210" }}>
      {/* Hero */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] flex flex-col justify-end overflow-hidden">
        <Image
          src="/trips/hero-raghunath-drone-2.webp"
          alt="MysTrip travellers at Raghunath Fort"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20 pt-24">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#FF6016" }}>
            Our Story
          </p>
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05]"
            style={{ fontFamily: "'Clash Display', sans-serif", letterSpacing: "-0.025em" }}
          >
            You start as
            <br />
            strangers. You leave
            <br />
            as <span style={{ color: "#FF6016" }}>a tribe.</span>
          </h1>
          <p className="mt-6 text-sm sm:text-lg text-white/60 max-w-xl leading-relaxed">
            MysTrip isn&apos;t a travel agency. It&apos;s the friend group you didn&apos;t have yet — built one trip at a time.
          </p>
        </div>
      </section>

      {/* Chapter 1 — the problem */}
      <section className="py-16 sm:py-24" style={{ background: "#F9F7F4" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 md:gap-14 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#FF6016" }}>
              Chapter One
            </p>
            <h2
              className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight mb-5"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Every college has the same story.
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
              <p>
                Classes, assignments, the same three canteens, the same group chat that talks about
                &quot;a trip&quot; for months and never books one. You want to get off campus and actually
                see something — but plans die the second someone&apos;s schedule doesn&apos;t line up.
              </p>
              <p>
                Budget hostels feel unsafe to figure out alone. Big travel agencies feel like a school
                excursion. And the friend group you&apos;d actually want to go with? Half of them haven&apos;t
                even met yet.
              </p>
              <p className="font-semibold text-gray-900">
                We built MysTrip because &quot;we should travel together&quot; kept dying in the group chat —
                and someone finally had to plan it.
              </p>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
            <Image
              src="/trips/gallery-kedarkantha-peaks-2.webp"
              alt="A student looking out at the Kedarkantha peaks"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Chapter 2 — the origin story */}
      <section className="py-16 sm:py-24" style={{ background: "#01574A" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 md:gap-14 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#FFB001" }}>
              Chapter Two
            </p>
            <h2
              className="text-2xl sm:text-4xl font-bold text-white leading-tight mb-5"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              The 1st of March.
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-white/70 leading-relaxed">
              <p>
                Our founder, Hemant, took a gap year after 12th — one year, solo, across India.
                Northeast to Rajasthan, buses to trains to whatever got him there next. Somewhere in
                that year, stuck without a plan more than once, the idea for MysTrip started forming.
              </p>
              <p>
                Then college happened. Classes, assignments, the usual loop — until he told a
                classmate, Arpita, about the idea. She&apos;s the reason it didn&apos;t stay a
                gap-year story. They pitched it at AIC-MUJ in October 2024 and got pre-incubated.
              </p>
              <p>
                The first team didn&apos;t last. By January 2025 it was back down to two people with
                more conviction than tech skills. So instead of building an app nobody had asked for
                yet, they did something smaller and scarier: planned an actual trip, and asked people
                to trust them with it.
              </p>
              <p>
                Hatni Kund, 1st March 2025 — a sunrise trek in the Aravalis, on Arpita&apos;s
                birthday. The website was barely a form. Three registrations in three hours, then
                silence for twelve — and those three asked for refunds. They got them. Five more
                hours of nothing.
              </p>
              <p className="font-semibold text-white">
                Then it flipped: 50 registrations in 4 hours, sold out in a day. 50 strangers trusted
                two people and a very basic website, showed up at sunrise, and that trip became
                MysTrip&apos;s real birthday.
              </p>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
            <Image
              src="/trips/hatni-kund.webp"
              alt="The very first MysTrip trek — Hatni Kund, 1st March 2025"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Chapter 3 — what we built */}
      <section className="py-16 sm:py-24" style={{ background: "#0B1210" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 md:gap-14 items-center">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] order-2 md:order-1">
            <Image
              src="/trips/gallery-sumel-girls-breakfast.webp"
              alt="Breakfast with the tribe at Mount Sumel"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="order-1 md:order-2">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#FFB001" }}>
              Chapter Three
            </p>
            <h2
              className="text-2xl sm:text-4xl font-bold text-white leading-tight mb-5"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Not a tour. Not a package.
            </h2>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed mb-6">
              A bunch of strangers who become your people. That&apos;s the whole idea. MysTrip is a
              tribe-led, human-first travel community — every trip is intentionally crafted to connect
              people, not just move them from point A to point B.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl p-4" style={{ background: "rgba(255,96,22,0.08)", border: "1px solid rgba(255,96,22,0.2)" }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#FF6016" }}>What we are</p>
                <p className="text-sm text-white/70">A living community that keeps going long after the trip ends.</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-1 text-white/50">What we&apos;re not</p>
                <p className="text-sm text-white/50">A checklist-of-sights agency, or another Instagram travel page.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Difference — business vs. tribe */}
      <section className="py-16 sm:py-24" style={{ background: "#F9F7F4" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#FF6016" }}>
            The Difference
          </p>
          <h2
            className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight mb-8 max-w-2xl"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            We were never in the business of selling trips.
          </h2>
          <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-start">
            <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
              <p>
                MysTrip started the whole &quot;travel community&quot; thing at Manipal — before the
                20-odd travel pages that showed up after us existed. We&apos;re not a tour agency. We
                don&apos;t sell packages, and we&apos;re not chasing the same five Instagram-famous
                itineraries everyone else runs.
              </p>
              <p>
                Anyone can plan a trip. Book a bus, pick a place, done. MysTrip designs an
                experience — the difference is what happens between the stops, not the stops
                themselves. It was never about the number of seats we sold. It&apos;s about watching
                our people actually be happy, out there, together.
              </p>
              <p className="font-semibold text-gray-900">
                If someone&apos;s using our name and it doesn&apos;t feel like this — it&apos;s not us.
              </p>
            </div>
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{ background: "rgba(255,96,22,0.06)", border: "1px solid rgba(255,96,22,0.15)" }}
            >
              <p
                className="text-3xl sm:text-4xl font-bold mb-3"
                style={{ fontFamily: "'Clash Display', sans-serif", color: "#FF6016" }}
              >
                15 strangers.
              </p>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                On our last Himalayan trek, all 15 trekkers went up the mountain as strangers. Six
                months later, they&apos;re still eating together in the hostel mess. That&apos;s not
                a coincidence — that&apos;s the whole point of a tribe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-24" style={{ background: "#01574A" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#FFB001" }}>
              What We Stand For
            </p>
            <h2
              className="text-2xl sm:text-4xl font-bold text-white leading-tight"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              The four things we never compromise on.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(255,176,1,0.15)" }}>
                  <v.icon size={18} style={{ color: "#FFB001" }} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  {v.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24" style={{ background: "#F9F7F4" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#FF6016" }}>
              How It Works
            </p>
            <h2
              className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight max-w-lg"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              We did the planning. You do the showing up.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((s) => (
              <div key={s.n}>
                <p className="text-4xl sm:text-5xl font-bold mb-3" style={{ fontFamily: "'Clash Display', sans-serif", color: "#FFD9BC" }}>
                  {s.n}
                </p>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  {s.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo gallery strip */}
      <section className="py-16 sm:py-24" style={{ background: "#0B1210" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#FF6016" }}>
            Moments, Not Monuments
          </p>
          <h2
            className="text-2xl sm:text-4xl font-bold text-white leading-tight"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            A few frames from the road.
          </h2>
        </div>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-2 snap-x snap-mandatory scrollbar-none">
          {galleryPhotos.map((p) => (
            <div
              key={p.src}
              className="relative flex-shrink-0 rounded-2xl overflow-hidden snap-start"
              style={{ width: "min(78vw, 320px)", aspectRatio: "3/4" }}
            >
              <Image src={p.src} alt={p.alt} fill className="object-cover" sizes="320px" />
            </div>
          ))}
        </div>
      </section>

      {/* Stats + Sundarone note */}
      <section className="py-16 sm:py-20" style={{ background: "#0B1210", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 pb-14 sm:pb-16 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>{s.num}</p>
                <p className="text-xs sm:text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div className="pt-12 sm:pt-14 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#FFB001" }}>
                Sundarone Tribe
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Built exclusively for Sundarone Hostel students.
              </h3>
              <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                Sundarone Tribe is a project run by MysTrip, exclusive to Sundarone Hostel residents —
                same crew, same standards, same tribe energy, tuned for the students who call Sundarone home.
              </p>
            </div>
            <Link
              href="/sundarone"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-bold text-sm text-white transition-all hover:opacity-90 w-fit"
              style={{ background: "#FF6016" }}
            >
              Meet Sundarone Tribe <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Vision / mission pull quote */}
      <section className="py-16 sm:py-24" style={{ background: "#FFEFDD" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-2xl sm:text-4xl font-bold leading-snug"
            style={{ fontFamily: "'Clash Display', sans-serif", color: "#01574A", letterSpacing: "-0.015em" }}
          >
            &quot;To become India&apos;s most trusted youth travel community — expanding globally,
            while building a tribe that never stops growing.&quot;
          </p>
          <p className="mt-6 text-sm font-semibold uppercase tracking-widest" style={{ color: "#FF6016" }}>
            Our Vision
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24" style={{ background: "#0B1210" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-2xl sm:text-4xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Your tribe is already filling up.
          </h2>
          <p className="text-sm sm:text-base text-white/50 mb-10 max-w-md mx-auto">
            Got questions before you book, or want to plan something with us? We&apos;re a small team —
            reach out directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link
              href="/trips"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-white text-sm transition-all hover:opacity-90"
              style={{ background: "#FF6016" }}
            >
              Explore Trips <ArrowRight size={15} />
            </Link>
            <a
              href="https://wa.me/918822068322"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all hover:opacity-90"
              style={{ background: "#25D366", color: "#fff" }}
            >
              WhatsApp Us
            </a>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm">
            <a href="mailto:team@mystrip.in" className="font-semibold hover:underline" style={{ color: "#FF6016" }}>
              team@mystrip.in
            </a>
            <span className="hidden sm:inline text-white/20">·</span>
            <a href="tel:+918822068322" className="font-semibold text-white/60 hover:text-white transition-colors">
              +91 88220 68322
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
