import { NextResponse } from "next/server";
import { unreachable, upstreamFetch } from "@/lib/api/proxy";

/**
 * GET /api/search/types — the `type` values `/api/search` accepts.
 *
 * Anonymous, like the search itself. The list is also mirrored as
 * `SEARCH_TYPES` so the UI can render tabs without waiting on a request; this
 * endpoint is what tells us the mirror has drifted.
 */
export async function GET() {
  try {
    const upstream = await upstreamFetch("/search/types", null);
    const body = await upstream.text();

    const headers = new Headers({ "content-type": "application/json" });
    const cacheControl = upstream.headers.get("cache-control");
    if (cacheControl) headers.set("cache-control", cacheControl);

    return new NextResponse(body || "[]", {
      status: upstream.status,
      headers,
    });
  } catch {
    return unreachable("search");
  }
}
