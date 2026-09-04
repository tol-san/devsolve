import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import {
  DEFAULT_LOCALE,
  localise,
  splitLocale,
} from "@/lib/i18n/config";

const LOCALE_COOKIE = "devsolve.locale";

const STATIC_FILE =
  /\.(?:ico|png|jpe?g|gif|svg|webp|avif|bmp|css|js|mjs|map|txt|xml|json|webmanifest|woff2?|ttf|otf|eot|mp4|webm|ogg|mp3|wav|pdf|zip)$/i;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/originkit") ||
    STATIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const parsed = splitLocale(pathname);
  let { locale, rest } = parsed;
  const { hadLocale } = parsed;
  let rewriteUrl: URL | null = null;

  if (hadLocale && locale === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = rest || "/";
    return NextResponse.redirect(url, 308);
  }

  if (!hadLocale) {
    locale = DEFAULT_LOCALE;
    rest = pathname;
    rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  }

  const sessionCookie = getSessionCookie(request);

  if (rest === "/" || rest === "") {
    const referer = request.headers.get("referer");
    let isInternalNav = false;
    if (referer) {
      try {
        isInternalNav = new URL(referer).origin === request.nextUrl.origin;
      } catch {
        // Invalid Referer headers are treated as external navigation.
      }
    }

    if (sessionCookie && !isInternalNav) {
      return NextResponse.redirect(
        new URL(localise("/dashboard", locale), request.url),
      );
    }
  }

  if (!sessionCookie && rest.startsWith("/dashboard")) {
    if (rest.startsWith("/dashboard/profile/")) {
      const tail = rest.slice("/dashboard/profile/".length);
      if (tail && !tail.startsWith("settings")) {
        return NextResponse.redirect(
          new URL(`/${locale}/profile/${tail}`, request.url),
        );
      }
    }

    return NextResponse.redirect(new URL(localise("/", locale), request.url));
  }

  if (rewriteUrl) {
    const rewrite = NextResponse.rewrite(rewriteUrl);
    rewrite.cookies.set(LOCALE_COOKIE, DEFAULT_LOCALE, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return rewrite;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|originkit|.*\\.(?:ico|png|jpe?g|gif|svg|webp|avif|bmp|css|js|mjs|map|txt|xml|json|webmanifest|woff2?|ttf|otf|eot|mp4|webm|ogg|mp3|wav|pdf|zip)$).*)",
  ],
};
