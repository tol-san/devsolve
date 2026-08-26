import { type NextRequest } from "next/server";

import {
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";

/**
 * `GET /api/weaknesses` — the CWE catalogue the report form classifies against.
 *
 * The upstream declares no security scheme for this path but answers 401
 * without a bearer token, so the caller's is required rather than optional.
 * That is fine for the only consumer: the submit-report form lives behind
 * `/dashboard`.
 *
 * `search` is passed through so the combobox filters server-side. The
 * catalogue is paginated and can outgrow any page size worth shipping, so
 * narrowing belongs upstream, not in a client-side `.filter()`.
 */
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
