import { type NextRequest } from "next/server";
import {
  bearerTokenFor,
  forwardQuery,
  relay,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

/**
 * GET /api/hacktivity — proxy for /api/v1/hacktivity, the public disclosure
 * stream behind `/hacktivity`.
 *
 * A token is not required: the page is public. Signed-in callers still send
 * theirs, since the upstream personalises what it will show them.
 */

const ALLOWED_QUERY = ["page", "size", "sort"] as const;

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);

  const query = forwardQuery(request.nextUrl.searchParams, ALLOWED_QUERY);

  try {
    const upstream = await upstreamFetch(`/hacktivity${query}`, token);
    return relay(upstream, "Unable to load the hacktivity feed.");
  } catch {
    return unreachable("hacktivity");
  }
}
