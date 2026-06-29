"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Trips", href: "/trips" },
  { label: "Sundarone", href: "/sundarone" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(1,87,74,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo — clipping wrapper removes the PNG's canvas padding */}
          <Link href="/" className="flex items-center">
            <div className="relative overflow-hidden" style={{ width: "148px", height: "40px" }}>
              <div style={{ position: "absolute", width: "210px", height: "210px", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                <Image
                  src="/logos/wordmark-orange.png"
                  alt="MysTrip"
                  fill
                  className="object-contain"
                  sizes="210px"
                />
              </div>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/trips"
              className="text-sm font-bold px-5 py-2.5 rounded-full text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: "#FF6016" }}
            >
              Book a Trip
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-md text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div
          className="md:hidden border-t px-4 pb-5 pt-3"
          style={{ background: "rgba(1,87,74,0.98)", borderColor: "rgba(255,255,255,0.1)" }}
        >
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-white/80 py-1"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-3 border-t border-white/10">
              <Link
                href="/auth/login"
                className="flex-1 text-center text-sm font-medium border border-white/20 rounded-full py-2.5 text-white"
              >
                Login
              </Link>
              <Link
                href="/trips"
                className="flex-1 text-center text-sm font-bold rounded-full py-2.5 text-white"
                style={{ background: "#FF6016" }}
              >
                Book a Trip
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
