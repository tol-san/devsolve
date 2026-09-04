import { authClient } from "./auth-client";

/**
 * The backend expects the Keycloak JWT as a bearer token. better-auth holds it
 * server-side against the session cookie, so it has to be asked for — it is
 * never written to localStorage, and reading it from there yields nothing.
 */

/** better-auth has returned this in a few shapes across versions. */
interface AccessTokenResponse {
  data?: string | { accessToken?: string; token?: string } | null;
  token?: string;
}

const PROVIDER_ID = "keycloak";

/** Renew a little before the real expiry so a request never races the clock. */
const EXPIRY_SKEW_MS = 30_000;

/** Fallback lifetime when the token carries no readable `exp`. */
const FALLBACK_TTL_MS = 60_000;

let cached: { token: string; expiresAt: number } | null = null;
let inFlight: Promise<string | null> | null = null;
/** Incremented on every clearAccessToken call; lets in-flight fetches know they are stale. */
let generation = 0;

function expiryOf(jwt: string): number {
  try {
    const part = jwt.split(".")[1];
    if (!part) return Date.now() + FALLBACK_TTL_MS;

    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));

    return typeof payload?.exp === "number"
      ? payload.exp * 1000
      : Date.now() + FALLBACK_TTL_MS;
  } catch {
    return Date.now() + FALLBACK_TTL_MS;
  }
}

/**
 * Current Keycloak access token, or null when signed out. Cached until just
 * before it expires so a page of RTK Query hooks doesn't fan out one
 * better-auth round trip per request, and de-duped while a fetch is in flight.
 */
export async function getAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (cached && cached.expiresAt - EXPIRY_SKEW_MS > Date.now()) {
    return cached.token;
  }
  if (inFlight) return inFlight;

  const myGeneration = generation;
  inFlight = (async () => {
    try {
      const sessionRes = await authClient.getSession();
      if (!sessionRes?.data || myGeneration !== generation) {
        cached = null;
        return null;
      }

      const res = (await authClient.getAccessToken({
        providerId: PROVIDER_ID,
      })) as AccessTokenResponse;

      // If clearAccessToken() was called while we were awaiting, discard the result.
      if (myGeneration !== generation) {
        cached = null;
        return null;
      }

      const raw =
        typeof res?.data === "string"
          ? res.data
          : res?.data?.accessToken || res?.data?.token || res?.token;

      if (!raw) {
        cached = null;
        return null;
      }

      cached = { token: raw, expiresAt: expiryOf(raw) };
      return raw;
    } catch {
      cached = null;
      return null;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/** Drop the cached token — call after a 401 or on sign-out. */
export function clearAccessToken() {
  cached = null;
  inFlight = null;
  generation += 1; // Poison any in-flight fetch started before this clear.
}
