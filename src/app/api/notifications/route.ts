import { type NextRequest } from "next/server";
import {
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

const ALLOWED_PARAMS = ["pageNumber", "pageSize", "unreadOnly"] as const;

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const query = forwardQuery(request.nextUrl.searchParams, ALLOWED_PARAMS);

  try {
    const upstream = await upstreamFetch(`/notifications${query}`, token);
    return relay(upstream, "Unable to load notifications.");
  } catch {
    return unreachable("notification");
  }
}
