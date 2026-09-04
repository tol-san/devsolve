import { type NextRequest, NextResponse } from "next/server";
import { forwardQuery, unreachable, upstreamFetch } from "@/lib/api/proxy";

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
