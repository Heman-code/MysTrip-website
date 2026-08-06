"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { isAdminRole } from "@/lib/admin-auth";

const links = [
  { label: "Trips", href: "/trips" },
  { label: "Plan Jaipur", href: "/plan/jaipur" },
  { label: "Sundarone", href: "/sundarone" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  const isAdmin = isAdminRole((user as { role?: string } | undefined)?.role);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(10, 10, 10, 0.72)" : "rgba(10, 10, 10, 0.35)",
        backdropFilter: "blur(20px) saturate(1.4)",
        WebkitBackdropFilter: "blur(20px) saturate(1.4)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative overflow-hidden flex-shrink-0 w-[113px] h-7 sm:w-[145px] sm:h-9">
              <Image
                src="/logos/wordmark-orange.png"
                alt="MysTrip"
                width={259}
                height={259}
                className="absolute -top-[87px] -left-11 w-[202px] h-[202px] max-w-none transition-opacity duration-200 group-hover:opacity-80 sm:-top-[111px] sm:-left-14 sm:w-[259px] sm:h-[259px]"
              />
            </div>
          </Link>

          {/* Desktop links */}
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

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : status === "authenticated" && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all hover:bg-white/10"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: "#FF6016" }}
                  >
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-white/80 max-w-[120px] truncate">
                    {user.name?.split(" ")[0]}
                  </span>
                  <ChevronDown size={14} className={`text-white/50 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden shadow-2xl"
                    style={{ background: "#0B1210", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <div className="px-4 py-3 border-b border-white/8">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-white/40 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/8 transition-all"
                      >
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/8 transition-all"
                        >
                          <ShieldCheck size={15} /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm font-bold px-5 py-2.5 rounded-full text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                  style={{ background: "#FF6016" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(255,96,22,0.4)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                >
                  Join the Tribe
                </Link>
              </>
            )}
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
        style={{ maxHeight: open ? "500px" : "0px", opacity: open ? 1 : 0 }}
      >
        <div
          className="border-t px-4 pb-6 pt-4"
          style={{ background: "rgba(10,10,10,0.90)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.08)" }}
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

            <div className="pt-4 mt-2 border-t border-white/8">
              {status === "authenticated" && user ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: "#FF6016" }}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-white/40">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/dashboard" onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-all">
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-all">
                      <ShieldCheck size={15} /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:text-red-300 rounded-xl hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link href="/auth/login" onClick={() => setOpen(false)}
                    className="flex-1 text-center text-sm font-medium border border-white/15 rounded-full py-2.5 text-white/80 hover:border-white/30 transition-all">
                    Login
                  </Link>
                  <Link href="/auth/signup" onClick={() => setOpen(false)}
                    className="flex-1 text-center text-sm font-bold rounded-full py-2.5 text-white transition-all hover:opacity-90"
                    style={{ background: "#FF6016" }}>
                    Join the Tribe
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
