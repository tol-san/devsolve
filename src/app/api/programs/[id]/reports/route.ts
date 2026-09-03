import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  saveReportSuggestedWeakness,
  enrichReportsWithWeakness,
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
    { message: "Unable to reach the report submission service. Please try again." },
    { status: 502 }
  );

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "0";
  const size = searchParams.get("size") || "20";
  const sort = searchParams.get("sort") || "submittedAt,desc";

  const queryParams = new URLSearchParams();
  queryParams.set("page", page);
  queryParams.set("size", size);
  queryParams.set("sort", sort);
  const state = searchParams.get("state");
  if (state) queryParams.set("state", state);

  const targetUrl = `${BACKEND_API_URL}/programs/${id}/reports?${queryParams.toString()}`;

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
        "Failed to fetch program reports.";
      return NextResponse.json(
        { message, details: body },
        { status: upstream.status }
      );
    }

    const envelope = (typeof body === "object" && body !== null ? body : {}) as Record<string, any>;
    const items = Array.isArray(envelope.content)
      ? envelope.content
      : Array.isArray(envelope.items)
      ? envelope.items
      : Array.isArray(body)
      ? (body as any[])
      : [];

    if (items.length > 0) {
      await enrichReportsWithWeakness(items);
    }

    return NextResponse.json(body, { status: 200 });
  } catch {
    return unreachable();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;

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
    const upstream = await fetch(`${BACKEND_API_URL}/programs/${id}/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
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
        "Failed to submit report.";
      return NextResponse.json(
        { message, details: body },
        { status: upstream.status }
      );
    }

    const created = (typeof body === "object" && body !== null ? body : {}) as Record<string, any>;
    const reportId = created?.id;
    const customWeakness =
      (payload as any)?.suggestedWeakness ||
      (payload as any)?.suggested_weakness ||
      null;
    const weaknessId =
      (payload as any)?.weaknessId ||
      (payload as any)?.weakness_id ||
      null;

    if (reportId) {
      await saveReportSuggestedWeakness(reportId, customWeakness, weaknessId);
      if (customWeakness) {
        created.suggestedWeakness = customWeakness;
        created.suggested_weakness = customWeakness;
        created.weakness = null;
      }
    }

    return NextResponse.json(created, { status: upstream.status });
  } catch {
    return unreachable();
  }
}

