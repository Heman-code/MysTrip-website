import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const needsLogin = pathname.startsWith("/dashboard") || pathname.endsWith("/register");

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
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/trips/:slug/register"],
};
