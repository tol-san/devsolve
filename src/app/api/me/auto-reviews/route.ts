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

  // Forward target, approved, page, size. Omit sort by default to avoid 400s.
  const query = forwardQuery(request.nextUrl.searchParams, [
    "target",
    "approved",
    "page",
    "size",
  ]);

  try {
    const upstream = await upstreamFetch(`/me/auto-reviews${query}`, token);
    return relay(upstream, "Unable to load auto-reviews.");
  } catch {
    return unreachable("auto-review");
  }
}
