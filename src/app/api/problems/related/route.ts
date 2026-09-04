import { type NextRequest, NextResponse } from "next/server";
import {
  bearerTokenFor,
  forwardQuery,
  relay,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

const RELATED_PARAMS = ["q", "excludeId", "limit"] as const;

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  const q = request.nextUrl.searchParams.get("q");

  if (!q || q.trim().length < 4) {
    return NextResponse.json([], {
      status: 200,
      headers: { "Cache-Control": "max-age=60, public" },
    });
  }

  const query = forwardQuery(request.nextUrl.searchParams, RELATED_PARAMS);

  try {
    const upstream = await upstreamFetch(`/problems/related${query}`, token);
    const response = await relay(upstream, "Unable to load related problems.");
    const cacheControl = upstream.headers.get("cache-control");
    if (cacheControl) {
      response.headers.set("cache-control", cacheControl);
    }
    return response;
  } catch {
    return unreachable("related problems");
  }
}
