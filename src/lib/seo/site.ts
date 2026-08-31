/**
 * The facts every other module under `src/lib/seo` builds on: where the site
 * lives, what it is called, and how it describes itself when a page has
 * nothing more specific to say.
 *
 * Canonical URLs, sitemap entries and social card URLs all have to be
 * absolute, so the origin is resolved once here rather than guessed per page.
 */

/** The domain the app is served from in production. */
const PRODUCTION_URL = "https://devsolve.app";
const LEGACY_PRODUCTION_HOST = "www.devsolve.app";

const withoutTrailingSlash = (url: string) => url.replace(/\/+$/, "");

/**
 * Keeps every DevSolve-owned production signal on the HTTPS apex origin even
 * if a stale Vercel environment variable still names the old www host.
 * Non-production origins (for example a staging domain) are left intact.
 */
function canonicalOrigin(value: string): string {
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase();

  if (hostname === "devsolve.app" || hostname === LEGACY_PRODUCTION_HOST) {
    return PRODUCTION_URL;
  }

  return url.origin;
}

/**
 * The origin canonical URLs are built from.
 *
 * `NEXT_PUBLIC_SITE_URL` wins, because that is what the rest of the app
 * (better-auth, the route middleware) already reads — except when it points at
 * a loopback address in a production build. A `localhost` canonical is worse
 * than none at all: it tells a crawler the real page lives somewhere it can
 * never reach, so production falls through to the deployment URL instead.
 */
function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    try {
      const { hostname } = new URL(configured);
      const isLoopback = hostname === "localhost" || hostname === "127.0.0.1";
      if (!isLoopback || process.env.NODE_ENV !== "production") {
        return canonicalOrigin(configured);
      }
    } catch {
      // Malformed value — treated as unset.
    }
  }

  /* Vercel injects this on every deployment, so a preview or a domain change
     still produces reachable URLs without a redeploy of the env var. */
  const vercel = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) {
    try {
      const value = withoutTrailingSlash(vercel);
      return canonicalOrigin(
        value.startsWith("http://") || value.startsWith("https://")
          ? value
          : `https://${value}`,
      );
    } catch {
      // Malformed Vercel value — use the known production origin below.
    }
  }

  return PRODUCTION_URL;
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "DevSolve";

export const SITE_TAGLINE = "Solve problems. Ship solutions. Earn reputation.";

export const SITE_DESCRIPTION =
  "DevSolve is where developers work through real engineering problems together — post the bug or blocker you are stuck on, share the solution that actually worked, showcase what you have built, and hunt vulnerabilities in live bug bounty programs.";

/**
 * Broad terms only. Keywords carry little weight with search engines now, and
 * a long list of near-duplicates reads as spam — these exist mainly for the
 * social and aggregator crawlers that still parse them.
 */
export const SITE_KEYWORDS = [
  "developer community",
  "programming problems",
  "debugging help",
  "code solutions",
  "developer showcase",
  "bug bounty programs",
  "security research",
  "vulnerability reports",
];

/** The site's own X/Twitter account, once one exists. */
export const TWITTER_HANDLE: string | undefined = undefined;

export const DEFAULT_LOCALE = "en_US";

/**
 * Turns a route path into a fully qualified URL. Anything already absolute is
 * handed back untouched, so a caller can pass an uploaded image URL straight
 * through.
 */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
