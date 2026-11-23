import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { defaultLocale, hasLocale, LOCALE_COOKIE } from "@/lib/i18n/config";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Storefront: "/" goes to the visitor's saved language, Indonesian by default.
  if (pathname === "/") {
    const saved = request.cookies.get(LOCALE_COOKIE)?.value ?? "";
    const locale = hasLocale(saved) ? saved : defaultLocale;
    // Keep the query string, so ad links like /?product=midnight-sin survive the redirect.
    const target = new URL(`/${locale}`, request.url);
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target);
  }

  if (pathname === "/admin/login") return NextResponse.next();

  // Cookie presence only decides the redirect. Admin pages validate the session.
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin", "/admin/:path*"],
};
