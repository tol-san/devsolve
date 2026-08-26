import { type NextRequest } from "next/server";

import {
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";

/**
 * `GET /api/report-drafts` — the caller's saved report drafts.
 *
 * Filtered by `programId` when the report form wants to know whether the
 * reporter already has something unfinished for the program they just opened.
 */
export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const query = forwardQuery(request.nextUrl.searchParams, [
    "programId",
    "page",
    "size",
    "sort",
  ]);

  try {
    const upstream = await upstreamFetch(`/report-drafts${query}`, token);
    return relay(upstream, "Unable to load your drafts.");
  } catch {
    return Response.json(
      { message: "Unable to reach the report service. Please try again." },
      { status: 502 },
    );
  }
}
