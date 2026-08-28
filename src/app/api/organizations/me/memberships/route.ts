import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const PROVIDER_ID = "keycloak";

async function bearerTokenFor(request: NextRequest): Promise<string | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return null;

  try {
    const { accessToken } = await auth.api.getAccessToken({
      body: { providerId: PROVIDER_ID },
      headers: request.headers,
    });
    return accessToken ?? null;
  } catch {
    return null;
  }
}

const unauthorized = () =>
  NextResponse.json({ message: "Not authenticated" }, { status: 401 });

const unreachable = () =>
  NextResponse.json(
    { message: "Unable to reach the organization service. Please try again." },
    { status: 502 }
  );

/**
 * Every organization the caller belongs to — owned or joined.
 *
 * The one call that answers "does this account have a company workspace, and
 * what may it do there". Unlike the rest of `/organizations/me/*`, this is not
 * owner-only: an invited member appears here with `owner: false` and the
 * permissions they were granted, which is exactly the case the realm role can
 * never describe.
 *
 * An empty array is the honest answer for most accounts and is relayed as a
 * `200`, not an error — a researcher with no company is not a failure.
 */
export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  try {
    const upstream = await fetch(
      `${BACKEND_API_URL}/organizations/me/memberships`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const raw = await upstream.text();
    let body: unknown = null;
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        body = { message: raw };
      }
    }

    if (!upstream.ok) {
      /* 404 here means the upstream has no memberships for this account, not
         that the route is missing — either way the answer the UI needs is
         "no company workspace", and an error state would be a lie. */
      if (upstream.status === 404) {
        return NextResponse.json([], { status: 200 });
      }

      const message =
        (body as { message?: string } | null)?.message ??
        "Failed to load your organization memberships.";
      return NextResponse.json(
        { message, details: body },
        { status: upstream.status }
      );
    }

    return NextResponse.json(body ?? [], { status: 200 });
  } catch {
    return unreachable();
  }
}
