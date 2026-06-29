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
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? "rgba(10, 10, 10, 0.72)"
          : "rgba(10, 10, 10, 0.35)",
        backdropFilter: "blur(20px) saturate(1.4)",
        WebkitBackdropFilter: "blur(20px) saturate(1.4)",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — mascot mark + wordmark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src="/logos/mascot-orange.png"
                alt="MysTrip"
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-110"
                sizes="32px"
              />
            </div>
            <span
              className="text-white font-bold text-xl leading-none"
              style={{ fontFamily: "'Clash Display', sans-serif", letterSpacing: "-0.02em" }}
            >
              Mys<span style={{ color: "#FF6016" }}>Trip</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white rounded-full hover:bg-white/8 transition-all duration-200"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors px-3 py-2"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-bold px-5 py-2.5 rounded-full text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              style={{
                background: "#FF6016",
                boxShadow: "0 0 0 0 rgba(255,96,22,0)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(255,96,22,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 0 rgba(255,96,22,0)";
              }}
            >
              Join the Tribe
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-full text-white hover:bg-white/10 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{
          maxHeight: open ? "400px" : "0px",
          opacity: open ? 1 : 0,
        }}
      >
        <div
          className="border-t px-4 pb-6 pt-4"
          style={{
            background: "rgba(10,10,10,0.90)",
            backdropFilter: "blur(20px)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm font-medium text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-all"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-4 mt-2 border-t border-white/8">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="flex-1 text-center text-sm font-medium border border-white/15 rounded-full py-2.5 text-white/80 hover:border-white/30 transition-all"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setOpen(false)}
                className="flex-1 text-center text-sm font-bold rounded-full py-2.5 text-white transition-all hover:opacity-90"
                style={{ background: "#FF6016" }}
              >
                Join the Tribe
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
