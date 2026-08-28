import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { withOrganizationScope } from "@/lib/api/organization-scope";

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

export async function POST(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(
      withOrganizationScope(
        request,
        `${BACKEND_API_URL}/organizations/me/members/invitations`,
      ),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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
      /* Statuses are relayed as they arrive. A 404 here does not mean the
         organization is missing — it means the invited address has no
         DevSolve account yet, which is the whole reason a team invitation can
         only reach someone who has already registered. Rewriting it to a 400
         with a message about registering an organization pointed the inviter
         at their own account instead of at the person they were inviting. */
      const message =
        (body as { message?: string } | null)?.message ??
        "Failed to invite organization member.";
      return NextResponse.json(
        { message, details: body },
        { status: upstream.status }
      );
    }

    return NextResponse.json(body, { status: 201 });
  } catch {
    return unreachable();
  }
}
