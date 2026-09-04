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

const softEmpty = (upstreamStatus: number | "unreachable") =>
  NextResponse.json([], {
    status: 200,
    headers: { "x-upstream-status": String(upstreamStatus) },
  });

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  try {
    const upstream = await fetch(
      withOrganizationScope(
        request,
        `${BACKEND_API_URL}/organizations/me/members`,
      ),
      {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (upstream.status === 404 || upstream.status === 403) {
      return softEmpty(upstream.status);
    }

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
      return softEmpty(upstream.status);
    }

    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return softEmpty("unreachable");
  }
}
