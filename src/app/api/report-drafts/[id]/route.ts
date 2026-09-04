import { NextResponse, type NextRequest } from "next/server";

import {
  bearerTokenFor,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";
import { saveReportDraftSchema } from "@/lib/validations/report-draft";
import {
  enrichDraftsWithWeakness,
  saveDraftSuggestedWeakness,
} from "@/lib/server/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const unreachable = () =>
  NextResponse.json(
    { message: "Unable to reach the report service. Please try again." },
    { status: 502 },
  );

const badId = () =>
  NextResponse.json({ message: "Invalid draft id" }, { status: 400 });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  if (!UUID.test(id)) return badId();

  try {
    const upstream = await upstreamFetch(`/report-drafts/${id}`, token);
    const raw = await upstream.text();
    let body: any = null;
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        body = { message: raw };
      }
    }
    if (!upstream.ok) {
      return NextResponse.json(body, { status: upstream.status });
    }
    if (body && typeof body === "object") {
      await enrichDraftsWithWeakness([body]);
    }
    return NextResponse.json(body, { status: 200 });
  } catch {
    return unreachable();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  if (!UUID.test(id)) return badId();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const parsed = saveReportDraftSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "The draft could not be saved.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const upstream = await upstreamFetch(`/report-drafts/${id}`, token, {
      method: "PUT",
      body: JSON.stringify(parsed.data),
    });

    if (upstream.ok) {
      const customWeakness = parsed.data.suggestedWeakness ?? null;
      const weaknessId = parsed.data.weaknessId ?? null;
      await saveDraftSuggestedWeakness(id, customWeakness, weaknessId);
    }

    return relay(upstream, "The draft could not be saved.");
  } catch {
    return unreachable();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  if (!UUID.test(id)) return badId();

  try {
    const upstream = await upstreamFetch(`/report-drafts/${id}`, token, {
      method: "DELETE",
    });
    return relay(upstream, "The draft could not be discarded.");
  } catch {
    return unreachable();
  }
}
