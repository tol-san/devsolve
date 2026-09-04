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

  const query = forwardQuery(request.nextUrl.searchParams, [
    "page",
    "size",
    "sort",
  ]);

  try {
    const upstream = await upstreamFetch(`/problems/mine${query}`, token);
    return relay(upstream, "Unable to load your problems.");
  } catch {
    return unreachable("problem");
  }
}
