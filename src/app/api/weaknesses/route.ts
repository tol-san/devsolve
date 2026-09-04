import { type NextRequest } from "next/server";

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
    "search",
    "page",
    "size",
    "sort",
  ]);

  try {
    const upstream = await upstreamFetch(`/weaknesses${query}`, token);
    return relay(upstream, "Unable to load the weakness catalogue.");
  } catch {
    return Response.json(
      { message: "Unable to reach the weakness service. Please try again." },
      { status: 502 },
    );
  }
}
