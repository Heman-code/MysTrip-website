import Link from "next/link";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ background: "#01180F" }} className="text-white relative overflow-hidden">
      {/* Mascot watermark */}
      <div className="absolute right-0 bottom-0 w-80 h-80 opacity-[0.05] pointer-events-none select-none">
        <Image src="/logos/mascot-orange.webp" alt="" fill sizes="320px" className="object-contain object-right-bottom" aria-hidden />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 sm:pt-16 sm:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 sm:gap-10 sm:pb-12 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>

          {/* Brand */}
          <div className="md:col-span-2">
            {/* Logo — mascot + wordmark, pixel-exact clipping (measured via canvas) */}
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              {/*
                Mascot: at 100px render → orange pixels x=31–68, y=29–70 (37×41px content)
                Target height 52px → scale=52/41=1.268 → render at 127px
                At 127px: x=31×1.268=39, x=68×1.268=86 → width=47px
                          y=29×1.268=37 → top=-37
                Container: 47×52px
              */}
              <div className="relative overflow-hidden flex-shrink-0 w-[39px] h-[43px] sm:w-[47px] sm:h-[52px]">
                <Image
                  src="/logos/mascot-orange.webp"
                  alt="MysTrip"
                  width={127}
                  height={127}
                  className="absolute -top-[31px] -left-8 w-[105px] h-[105px] max-w-none sm:-top-[37px] sm:-left-[39px] sm:w-[127px] sm:h-[127px]"
                />
              </div>
              {/*
                Wordmark: at 138px render → orange pixels x=30–107, y=59–78 (77×19px content)
                Target height 44px → scale=44/19=2.316 → render at 319px
                At 319px: x=30×2.316=69, x=107×2.316=248 → width=179px
                          y=59×2.316=137 → top=-137
                Container: 179×44px
              */}
              <div className="relative overflow-hidden flex-shrink-0 w-[111px] h-[27px] sm:w-[134px] sm:h-[33px]">
                <Image
                  src="/logos/wordmark-orange.webp"
                  alt=""
                  width={239}
                  height={239}
                  className="absolute -top-[85px] -left-[43px] w-[198px] h-[198px] max-w-none sm:-top-[103px] sm:-left-[52px] sm:w-[239px] sm:h-[239px]"
                  aria-hidden
                />
              </div>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Mozilla Text, system-ui, sans-serif" }}>
              Not a tour. Not a package. A bunch of strangers who become your people. India&apos;s most trusted youth travel community.
            </p>
            <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
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
            <div className="flex gap-4 mt-5 sm:mt-6">
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

          {/* Links + Contact — side by side even on mobile, becomes 2 direct grid columns at md+ */}
          <div className="grid grid-cols-2 gap-4 md:contents">

            {/* Links */}
            <div>
              <h4 className="font-bold text-[11px] sm:text-xs uppercase tracking-widest mb-2.5 sm:mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
                Explore
              </h4>
              <ul className="space-y-2 sm:space-y-3">
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
                      className="text-xs sm:text-sm transition-colors hover:text-white"
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
              <h4 className="font-bold text-[11px] sm:text-xs uppercase tracking-widest mb-2.5 sm:mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
                Get in Touch
              </h4>
              <ul className="space-y-2 sm:space-y-4">
                <li>
                  <a
                    href="mailto:team@mystrip.in"
                    className="flex items-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    <Mail size={13} className="flex-shrink-0" />
                    <span className="truncate">team@mystrip.in</span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+918822068322"
                    className="flex items-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    <Phone size={13} className="flex-shrink-0" />
                    +91 88220 68322
                  </a>
                </li>
              </ul>

              <div className="mt-4 sm:mt-8 p-2.5 sm:p-4 rounded-xl" style={{ background: "rgba(255,96,22,0.08)", border: "1px solid rgba(255,96,22,0.15)" }}>
                <p className="text-[11px] sm:text-xs font-bold" style={{ color: "#FF6016" }}>🏆 National Award Winner</p>
                <p className="text-[11px] sm:text-xs mt-1 leading-snug" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Student Travel Experience of the Year — India
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-5 sm:pt-8">
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
