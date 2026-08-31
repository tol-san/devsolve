import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/seo/site";
import { LOCALES, localise } from "@/lib/i18n/config";

/**
 * What crawlers may read. Served at `/robots.txt`.
 *
 * Three kinds of URL are kept out. Anything private (`/dashboard`, `/api`) is
 * gated by the session middleware anyway, so a crawler would only ever see the
 * redirect. Anything transactional — signing in, composing a problem, editing
 * a solution — is a form, not a document. And `/profile/me` is an alias that
 * resolves to whoever is signed in, which for a crawler is nobody.
 *
 * Note that disallow only stops crawling, not indexing: a blocked URL someone
 * links to can still appear as a bare result. The pages that must never be
 * listed also carry `robots: noindex` in their own metadata.
 */
/** Paths kept out of the index: anything behind sign-in, transactional, or
 *  a duplicate of a canonical page. */
const PRIVATE_PREFIXES = [
  "/dashboard/",
  "/login",
  "/register/",
  "/account-type",
  "/test-login",
  // Single-use invitation links: the token in the path is a credential.
  "/invitations/",
  "/community/create",
  "/community/*/edit",
  "/community/*/solutions/",
  "/profile/me",
];

export default function robots(): MetadataRoute.Robots {
  const privatePaths = Array.from(
    new Set(
      PRIVATE_PREFIXES.flatMap((path) => [
        path,
        ...LOCALES.map((locale) => localise(path, locale)),
      ]),
    ),
  );

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Not localised: API routes live outside the [lang] segment.
          "/api/",
          /* Every page path now exists once per locale, so a bare rule like
             "/dashboard/" would no longer match anything a crawler can reach.
             Each is expanded across the locales, and the unprefixed form is
             kept too — the proxy still answers those with a redirect, and a
             stale link may point at one. */
          ...privatePaths,
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
