import { NextResponse, type NextRequest } from "next/server";

import {
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";

/**
 * `GET /api/researchers/me/access` — every company the caller has approached.
 *
 * What the "My access" screen reads: one row per organization, whatever state
 * it is in, so a researcher can see where they may file before they start
 * writing.
 */
export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const query = forwardQuery(request.nextUrl.searchParams, [
    "status",
    "page",
    "size",
    "sort",
  ]);

  try {
    const upstream = await upstreamFetch(`/researchers/me/access${query}`, token);
    return relay(upstream, "Unable to load your access.");
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the researcher service. Please try again." },
      { status: 502 },
    );
  }
}
