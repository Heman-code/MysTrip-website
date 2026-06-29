import Link from "next/link";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ background: "#01180F" }} className="text-white relative overflow-hidden">
      {/* Mascot watermark */}
      <div className="absolute right-0 bottom-0 w-80 h-80 opacity-[0.05] pointer-events-none select-none">
        <Image src="/logos/mascot-orange.png" alt="" fill className="object-contain object-right-bottom" aria-hidden />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>

          {/* Brand */}
          <div className="md:col-span-2">
            {/* Logo — mascot + wordmark */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image src="/logos/mascot-orange.png" alt="MysTrip" fill className="object-contain" sizes="40px" />
              </div>
              <span
                className="text-white font-bold text-2xl leading-none"
                style={{ fontFamily: "'Clash Display', sans-serif", letterSpacing: "-0.02em" }}
              >
                Mys<span style={{ color: "#FF6016" }}>Trip</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Mozilla Text, system-ui, sans-serif" }}>
              Not a tour. Not a package. A bunch of strangers who become your people. India&apos;s most trusted youth travel community.
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              {["AIC-MUJ", "Sundarone Partner"].map((badge) => (
                <span
                  key={badge}
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: "rgba(255,176,1,0.1)", color: "#FFB001", border: "1px solid rgba(255,176,1,0.15)" }}
                >
                  {badge}
                </span>
              ))}
            </div>
            <div className="flex gap-4 mt-6">
              <a
                href="https://instagram.com/mystrip.in"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full transition-colors hover:bg-white/10"
                aria-label="Instagram"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/mystrip"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full transition-colors hover:bg-white/10"
                aria-label="LinkedIn"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
              Explore
            </h4>
            <ul className="space-y-3">
              {[
                { label: "All Trips", href: "/trips" },
                { label: "Sundarone Students", href: "/sundarone" },
                { label: "Blog", href: "/blog" },
                { label: "About MysTrip", href: "/about" },
                { label: "Join the Tribe", href: "/auth/signup" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
              Get in Touch
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:team@mystrip.in"
                  className="flex items-center gap-2.5 text-sm transition-colors hover:text-white"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  <Mail size={14} />
                  team@mystrip.in
                </a>
              </li>
              <li>
                <a
                  href="tel:+918107613759"
                  className="flex items-center gap-2.5 text-sm transition-colors hover:text-white"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  <Phone size={14} />
                  +91 81076 13759
                </a>
              </li>
            </ul>

            <div className="mt-8 p-4 rounded-xl" style={{ background: "rgba(255,96,22,0.08)", border: "1px solid rgba(255,96,22,0.15)" }}>
              <p className="text-xs font-bold" style={{ color: "#FF6016" }}>🏆 National Award Winner</p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                Student Travel Experience of the Year — India
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            © {new Date().getFullYear()} MysTrip. All rights reserved.
          </p>
          <div className="flex gap-6">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
