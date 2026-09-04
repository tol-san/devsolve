import { NextResponse, type NextRequest } from "next/server";

import {
  bearerTokenFor,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ message: "Invalid draft id" }, { status: 400 });
  }

  try {
    const upstream = await upstreamFetch(`/report-drafts/${id}/submit`, token, {
      method: "POST",
    });
    return relay(upstream, "The report could not be submitted.");
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the report service. Please try again." },
      { status: 502 },
    );
  }
}
