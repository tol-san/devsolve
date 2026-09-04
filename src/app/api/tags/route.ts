import { type NextRequest } from "next/server";

import {
  bearerTokenFor,
  forwardQuery,
  relay,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);

  const query = forwardQuery(request.nextUrl.searchParams, ["q", "limit"]);

  try {
    const upstream = await upstreamFetch(`/tags${query}`, token);
    return relay(upstream, "Unable to load tags.");
  } catch {
    return unreachable("tag");
  }
}
