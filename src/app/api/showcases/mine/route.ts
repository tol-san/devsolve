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
    "pageNumber",
    "pageSize",
  ]);

  try {
    const upstream = await upstreamFetch(`/showcases/mine${query}`, token);
    return relay(upstream, "Unable to load your showcases.");
  } catch {
    return unreachable("showcase");
  }
}
