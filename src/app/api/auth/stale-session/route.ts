import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = /^(__Secure-|__Host-)?better-auth\.session[_.]/;
const OIDC_COOKIE =
  /^(__Secure-|__Host-)?(better-auth\.|oidc[-_.]|keycloak[-_.]|oauth[-_.]state|oauth[-_.]nonce|oauth[-_.]pkce|oauth[-_.]code)/i;

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

  response.headers.set("Cache-Control", "no-store");
  return response;
}
