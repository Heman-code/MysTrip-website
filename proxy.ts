import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { referralClicks } from "@/lib/db/schema";
import { REFERRAL_COOKIE, getActiveAmbassadorByCode } from "@/lib/referral";

const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const { pathname, searchParams } = req.nextUrl;

  const needsLogin = pathname.startsWith("/dashboard") || pathname.startsWith("/plan") || pathname.endsWith("/register");

  if (needsLogin && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin")) {
    const role = (req.auth?.user as { role?: string } | undefined)?.role;
    if (!isLoggedIn || role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Referral link capture: cheap early-return for the vast majority of
  // requests that don't carry a ?ref= — only the rare referred visit pays
  // for the ambassador lookup + click log below.
  const ref = searchParams.get("ref");
  if (ref) {
    const ambassador = await getActiveAmbassadorByCode(ref);
    if (ambassador) {
      const tripSlug = pathname.startsWith("/trips/") ? pathname.split("/")[2] || null : null;
      await db.insert(referralClicks).values({ ambassadorId: ambassador.id, tripSlug });

      const res = NextResponse.next();
      res.cookies.set(REFERRAL_COOKIE, ambassador.referralCode, {
        maxAge: REFERRAL_COOKIE_MAX_AGE,
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
      return res;
    }
  }
});

export const config = {
  matcher: ["/", "/dashboard/:path*", "/admin/:path*", "/plan/:path*", "/trips/:path*"],
};
