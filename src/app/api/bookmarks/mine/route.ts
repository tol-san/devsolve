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

  const { searchParams } = new URL(request.url);
  const query = forwardQuery(searchParams, ["type", "pageNumber", "pageSize"]);

  try {
    const upstream = await upstreamFetch(`/bookmarks/mine${query}`, token);
    return relay(upstream, "Unable to fetch bookmarks.");
  } catch {
    return unreachable("bookmark");
  }
}
