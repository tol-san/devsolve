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
  const query = forwardQuery(request.nextUrl.searchParams, [
    "query",
    "pageNumber",
    "pageSize",
  ]);

  try {
    const upstream = await upstreamFetch(`/user-profiles${query}`, token);
    return relay(upstream, "Unable to search public user profiles.");
  } catch {
    return unreachable("user profiles");
  }
}
