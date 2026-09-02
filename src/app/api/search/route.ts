import { type NextRequest, NextResponse } from "next/server";
import { forwardQuery, unreachable, upstreamFetch } from "@/lib/api/proxy";

/**
 * GET /api/search — the Meilisearch-backed search, proxied.
 *
 * Anonymous by design: no token is read and none is sent, because the index
 * holds only what is already public. It still goes through here rather than
 * straight to the backend from the browser — this app sends nothing to the API
 * host directly, and going through us settles same-origin and CORS for a
 * request that fires on every keystroke.
 *
 * The upstream's `Cache-Control: max-age=60, public` is passed on untouched,
 * so a repeated query is answered from cache rather than re-run. Nothing here
 * adds a cache-buster.
 *
 * A 503 is normal: search can be switched off on a deployment, or Meilisearch
 * can be unreachable, and there is no database fallback by design. It is
 * relayed as itself so the UI can say "temporarily unavailable" rather than
 * treating it as an empty result.
 */

const ALLOWED_QUERY = ["q", "type", "page", "size"] as const;

export async function GET(request: NextRequest) {
  const query = forwardQuery(request.nextUrl.searchParams, ALLOWED_QUERY);

  try {
    const upstream = await upstreamFetch(`/search${query}`, null);
    const body = await upstream.text();

    const headers = new Headers({ "content-type": "application/json" });
    const cacheControl = upstream.headers.get("cache-control");
    if (cacheControl) headers.set("cache-control", cacheControl);

    return new NextResponse(body || "null", {
      status: upstream.status,
      headers,
    });
  } catch {
    return unreachable("search");
  }
}
