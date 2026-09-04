import { NextResponse, type NextRequest } from "next/server";

import {
  bearerTokenFor,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";
import { saveShowcaseDraftSchema } from "@/lib/validations/showcase-draft";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const unreachable = () =>
  NextResponse.json(
    { message: "Unable to reach the showcase service. Please try again." },
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
    const upstream = await upstreamFetch(`/showcase-drafts/${id}`, token);
    return relay(upstream, "Unable to load showcase draft.");
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

  const parsed = saveShowcaseDraftSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "The showcase draft could not be saved.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const upstream = await upstreamFetch(`/showcase-drafts/${id}`, token, {
      method: "PUT",
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "The showcase draft could not be saved.");
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
    const upstream = await upstreamFetch(`/showcase-drafts/${id}`, token, {
      method: "DELETE",
    });
    return relay(upstream, "The showcase draft could not be discarded.");
  } catch {
    return unreachable();
  }
}
