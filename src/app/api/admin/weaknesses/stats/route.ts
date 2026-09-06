import { type NextRequest } from "next/server";
import {
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  // Strictly forward only allowed params. Never forward `sort` as it causes 400.
  const query = forwardQuery(request.nextUrl.searchParams, [
    "includeUnused",
    "activeOnly",
    "page",
    "size",
  ]);

  try {
    const upstream = await upstreamFetch(
      `/admin/weaknesses/stats${query}`,
      token,
    );
    return relay(upstream, "Unable to load weakness statistics.");
  } catch {
    return unreachable("weakness stats");
  }
}
