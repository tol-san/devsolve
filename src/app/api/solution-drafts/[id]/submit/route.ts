import { NextResponse, type NextRequest } from "next/server";

import {
  bearerTokenFor,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const unreachable = () =>
  NextResponse.json(
    { message: "Unable to reach the solution service. Please try again." },
    { status: 502 },
  );

const badId = () =>
  NextResponse.json({ message: "Invalid draft id" }, { status: 400 });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  if (!UUID.test(id)) return badId();

  try {
    const upstream = await upstreamFetch(`/solution-drafts/${id}/submit`, token, {
      method: "POST",
    });
    return relay(upstream, "The solution could not be submitted.");
  } catch {
    return unreachable();
  }
}
