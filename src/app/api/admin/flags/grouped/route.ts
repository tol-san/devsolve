import { type NextRequest } from "next/server";

import {
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

/**
 * The grouped report queue (one row per reported content target).
 */
export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const query = forwardQuery(request.nextUrl.searchParams, [
    "status",
    "flaggableType",
    "reason",
    "search",
    "sort",
    "pageNumber",
    "pageSize",
  ]);

  try {
    const upstream = await upstreamFetch(`/admin/flags/grouped${query}`, token);
    return relay(upstream, "Unable to load the grouped report queue.");
  } catch {
    return unreachable("moderation");
  }
}
