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
    { message: "Unable to reach the reports service. Please try again." },
    { status: 502 },
  );

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const searchParams = request.nextUrl.searchParams;
  const programId = searchParams.get("programId");
  const state = searchParams.get("state");
  const page = searchParams.get("page") || "0";
  const size = searchParams.get("size") || "10";
  const sort = searchParams.get("sort") || "submittedAt,desc";

  const queryParams = new URLSearchParams();
  queryParams.set("page", page);
  queryParams.set("size", size);
  queryParams.set("sort", sort);
  if (programId) queryParams.set("programId", programId);
  if (state) queryParams.set("state", state);

  const targetUrl = `${BACKEND_API_URL}/reports?${queryParams.toString()}`;

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
        "Failed to fetch reports.";
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
