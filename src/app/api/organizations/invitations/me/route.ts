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
 * The invitations addressed to the signed-in account.
 *
 * Upstream only returns invitations that would actually succeed if accepted
 * right now — pending, unexpired, into an organization that is still active —
 * sorted soonest-to-expire first. Nothing is filtered or reordered here.
 *
 * Note the shape of the empty answer: `200` with `[]`, never a 404. Anything
 * that is not ok really is a failure and is relayed as one, so the screen can
 * tell "you have no invitations" apart from "we could not ask".
 */
export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  try {
    const upstream = await fetch(
      `${BACKEND_API_URL}/organizations/invitations/me`,
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
      const message =
        (body as { message?: string } | null)?.message ??
        "Failed to load your invitations.";
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
