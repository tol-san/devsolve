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
 * The report queue. Uses `pageNumber`/`pageSize` — not Spring's `page`/`size`.
 *
 * A 403 here means the caller is signed in but is not an ADMIN. It is relayed
 * as a 403 so the console can say so; an empty 200 would read as "no reports
 * to review", which is the opposite of the truth.
 */
export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const query = forwardQuery(request.nextUrl.searchParams, [
    "status",
    "flaggableType",
    "reason",
    "pageNumber",
    "pageSize",
  ]);

  try {
    const upstream = await upstreamFetch(`/admin/flags${query}`, token);
    return relay(upstream, "Unable to load the report queue.");
  } catch {
    return unreachable("moderation");
  }
}
