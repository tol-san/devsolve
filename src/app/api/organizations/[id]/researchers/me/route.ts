import { NextResponse, type NextRequest } from "next/server";

import {
  asUuid,
  bearerTokenFor,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  const orgId = asUuid(id);
  if (!orgId) {
    return NextResponse.json({ message: "Invalid organization id" }, { status: 400 });
  }

  try {
    const upstream = await upstreamFetch(
      `/organizations/${orgId}/researchers/me`,
      token,
    );
    if (upstream.status === 404) return NextResponse.json(null, { status: 200 });
    return relay(upstream, "Unable to load your access with this organization.");
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the organization service. Please try again." },
      { status: 502 },
    );
  }
}
