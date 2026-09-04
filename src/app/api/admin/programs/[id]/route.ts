import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const PROVIDER_ID = "keycloak";
const programIdSchema = z.uuid("Program id must be a UUID");

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
    { message: "Unable to reach the program service. Please try again." },
    { status: 502 }
  );

function parseResponseBody(raw: string): unknown {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return { message: raw };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  const parsedId = programIdSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json(
      { message: parsedId.error.issues[0]?.message ?? "Invalid program id" },
      { status: 400 }
    );
  }

  if (!BACKEND_API_URL) return unreachable();

  try {
    const upstream = await fetch(
      `${BACKEND_API_URL}/admin/programs/${encodeURIComponent(parsedId.data)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const body = parseResponseBody(await upstream.text());

    if (!upstream.ok) {
      const message =
        (body as { message?: string } | null)?.message ??
        "Failed to fetch program details.";
      return NextResponse.json(
        { message, details: body },
        { status: upstream.status }
      );
    }

    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return unreachable();
  }
}
