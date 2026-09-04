import { NextResponse, type NextRequest } from "next/server";

import {
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";

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
