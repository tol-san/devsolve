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

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const handle = request.nextUrl.searchParams.get("handle");
  if (!handle) {
    return NextResponse.json(
      { message: "A handle is required." },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({ handle });
  const programId = request.nextUrl.searchParams.get("programId");
  if (programId) params.set("programId", programId);

  try {
    const upstream = await fetch(
      `${BACKEND_API_URL}/organizations/me/programs/handle-available?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
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
        "The handle could not be checked.";
      return NextResponse.json(
        { message, details: body },
        { status: upstream.status },
      );
    }

    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the program service. Please try again." },
      { status: 502 },
    );
  }
}
