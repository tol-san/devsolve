
const PRODUCTION_URL = "https://devsolve.app";
const LEGACY_PRODUCTION_HOST = "www.devsolve.app";

const withoutTrailingSlash = (url: string) => url.replace(/\/+$/, "");

function canonicalOrigin(value: string): string {
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase();

  if (hostname === "devsolve.app" || hostname === LEGACY_PRODUCTION_HOST) {
    return PRODUCTION_URL;
  }

  return url.origin;
}

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

export const TWITTER_HANDLE: string | undefined = undefined;

export const DEFAULT_LOCALE = "en_US";

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
