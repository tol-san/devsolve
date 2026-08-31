import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import {
  DEFAULT_LOCALE,
  LOCALES,
  isLocale,
  localise,
  splitLocale,
  type Locale,
} from "@/lib/i18n/config";

/** Remembers the visitor's choice so the switcher survives a fresh visit. */
const LOCALE_COOKIE = "devsolve.locale";

/**
 * A request for a file rather than a page.
 *
 * Named extensions, not "contains a dot". A dot is legal in a username, and
 * `/dashboard/profile/taing.sengkim3110` was read as a file here: the request
 * skipped this middleware, never received its locale, and so matched no route
 * at all — every profile whose handle carries a dot was unreachable, along
 * with its followers and following pages.
 */
const STATIC_FILE =
  /\.(?:ico|png|jpe?g|gif|svg|webp|avif|bmp|css|js|mjs|map|txt|xml|json|webmanifest|woff2?|ttf|otf|eot|mp4|webm|ogg|mp3|wav|pdf|zip)$/i;

/**
 * Picks a locale for a request that arrived without one.
 *
 * Order is deliberate: an explicit choice the visitor made in the switcher
 * beats what their browser happens to advertise, and both beat the default.
 * Parsed by hand rather than pulling in Negotiator — with two locales the
 * whole grammar we care about is `km` appearing with a higher q-value.
 */
function detectLocale(request: NextRequest): Locale {
  const chosen = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(chosen)) return chosen;

  const header = request.headers.get("accept-language");
  if (!header) return DEFAULT_LOCALE;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return {
        // `km-KH` and `km` both mean Khmer to us.
        base: tag.trim().toLowerCase().split("-")[0],
        q: q ? Number.parseFloat(q.split("=")[1]) || 0 : 1,
      };
    })
    .filter((entry) => (LOCALES as readonly string[]).includes(entry.base))
    .sort((a, b) => b.q - a.q);

  const best = ranked[0]?.base;
  return isLocale(best) ? best : DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* Everything below is about pages. API routes, Next's own assets and any
     path that looks like a file are none of this middleware's business. */
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

  /* `/en/...` was the old English URL shape. Consolidate it permanently onto
     the unprefixed canonical while preserving the query string. */
  if (hadLocale && locale === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = rest || "/";
    return NextResponse.redirect(url, 308);
  }

  /* An unprefixed request is the English canonical unless the visitor has
     explicitly selected Khmer (or their browser strongly prefers it). English
     is rewritten internally to the physical `[lang]` route, so the browser
     and crawlers keep the clean URL without a redirect hop. */
  if (!hadLocale) {
    const picked = detectLocale(request);
    if (picked !== DEFAULT_LOCALE) {
      const url = request.nextUrl.clone();
      url.pathname = localise(pathname, picked);
      const redirect = NextResponse.redirect(url);
      redirect.cookies.set(LOCALE_COOKIE, picked, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
      return redirect;
    }

    locale = DEFAULT_LOCALE;
    rest = pathname;
    rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  }

  /* Presence only. `getSessionCookie` reads the cookie jar — it does not
     verify a signature or look the session up, so a stale or forged value
     satisfies it. Everything below is therefore routing, not authorization:
     the real check runs in the dashboard layout, which validates the session
     against better-auth's store before rendering anything private. */
  const sessionCookie = getSessionCookie(request);

  if (rest === "/" || rest === "") {
    // Only redirect authenticated users away from the home page on a direct
    // visit. Arriving from inside the app (a Home link) leaves a Referer on
    // this origin — let them through.
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

  /* No cookie at all and heading somewhere private: turn the request around
     here rather than paying for a render the layout would only discard. */
  if (!sessionCookie && rest.startsWith("/dashboard")) {
    /* A dashboard profile URL has a public twin. Someone signed out following
       a shared link wants the person's profile, not a login form. */
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
  /* Every page path now needs to be seen, because any of them may arrive
     without a locale. The negative lookahead keeps assets and API routes out
     rather than matching them and returning early. */
  matcher: [
    "/((?!api|_next/static|_next/image|originkit|.*\\.(?:ico|png|jpe?g|gif|svg|webp|avif|bmp|css|js|mjs|map|txt|xml|json|webmanifest|woff2?|ttf|otf|eot|mp4|webm|ogg|mp3|wav|pdf|zip)$).*)",
  ],
};
