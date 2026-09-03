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
    { message: "Unable to reach the analytics service. Please try again." },
    { status: 502 },
  );

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { message: "Organization ID is required" },
      { status: 400 },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const timeRange = searchParams.get("timeRange");
  const programId = searchParams.get("programId");

  const queryParams = new URLSearchParams();
  if (timeRange) queryParams.set("timeRange", timeRange);
  if (programId) queryParams.set("programId", programId);

  const queryString = queryParams.toString();
  const targetUrl = queryString
    ? `${BACKEND_API_URL}/organizations/${encodeURIComponent(id)}/analytics?${queryString}`
    : `${BACKEND_API_URL}/organizations/${encodeURIComponent(id)}/analytics`;

  try {
    const upstream = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

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
        "Failed to fetch organization analytics.";
      return NextResponse.json(
        { message, details: body },
        { status: upstream.status },
      );
    }

    return NextResponse.json(body, { status: 200 });
  } catch {
    return unreachable();
  }
}
