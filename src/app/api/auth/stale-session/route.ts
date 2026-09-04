import { NextResponse, type NextRequest } from "next/server";

/**
 * Drops a session cookie that no longer resolves to a session, then forwards
 * the visitor on.
 *
 * The dashboard layout is what discovers this: the middleware can only see
 * that a cookie *exists*, so a stale one gets waved through to a layout that
 * then finds nothing behind it. Sending that visitor to `/` on its own would
 * loop — the middleware reads the same cookie there and bounces them back to
 * `/dashboard`. A Server Component cannot delete a cookie during render, so
 * the redirect goes through this handler, which can.
 *
 * With the cookie gone the middleware and the session store finally agree,
 * and the home page renders as it does for any signed-out visitor.
 */

/**
 * Cookie patterns to wipe on logout / stale-session cleanup.
 *
 * - SESSION_COOKIE  — every shape better-auth stores the session token in.
 * - OIDC_COOKIE     — state / nonce / PKCE verifier cookies written during the
 *                     Keycloak redirect dance; these can survive a normal
 *                     better-auth signOut and cause the middleware to see an
 *                     active-looking cookie on the very next navigation.
 */
const SESSION_COOKIE = /^(__Secure-|__Host-)?better-auth\.session[_.]/;
const OIDC_COOKIE =
  /^(__Secure-|__Host-)?(better-auth\.|oidc[-_.]|keycloak[-_.]|oauth[-_.]state|oauth[-_.]nonce|oauth[-_.]pkce|oauth[-_.]code)/i;

/**
 * Only same-origin paths. An open redirect here would be handed to anyone who
 * can get a stale cookie in front of it, so anything protocol-relative
 * (`//evil.test`), backslash-smuggled, or absolute is refused rather than
 * cleaned up.
 */
function safePath(value: string | null): string {
  if (!value) return "/";
  if (!value.startsWith("/")) return "/";
  if (value.startsWith("//") || value.includes("\\")) return "/";
  return value;
}

export async function GET(request: NextRequest) {
  const target = safePath(request.nextUrl.searchParams.get("to"));
  const response = NextResponse.redirect(new URL(target, request.url));

  for (const cookie of request.cookies.getAll()) {
    if (SESSION_COOKIE.test(cookie.name) || OIDC_COOKIE.test(cookie.name)) {
      response.cookies.set(cookie.name, "", { path: "/", maxAge: 0 });
    }
  }

  /* Never cached: the response's whole job is a Set-Cookie the next request
     must actually receive. */
  response.headers.set("Cache-Control", "no-store");
  return response;
}
