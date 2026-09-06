import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  enrichReportsWithWeakness,
  enrichReportsWithProgramAndOrg,
} from "@/lib/server/db";

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
    { status: 502 }
  );

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  const targetUrl = `${BACKEND_API_URL}/reports/mine${
    queryString ? `?${queryString}` : ""
  }`;

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
      return NextResponse.json(
        typeof body === "object" && body !== null
          ? body
          : { message: "Failed to fetch researcher reports" },
        { status: upstream.status }
      );
    }

    const envelope = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
    const items = (
      Array.isArray(envelope.content)
        ? envelope.content
        : Array.isArray(envelope.items)
        ? envelope.items
        : Array.isArray(body)
        ? body
        : []
    ).filter((item): item is Record<string, unknown> & { id: string } => typeof item === "object" && item !== null && typeof (item as { id?: unknown }).id === "string");

    if (items.length > 0) {
      await enrichReportsWithWeakness(items);
      await enrichReportsWithProgramAndOrg(items);
    }

    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return unreachable();
  }
}
