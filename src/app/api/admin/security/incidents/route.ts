import { type NextRequest } from "next/server";
import {
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

const ALLOWED_QUERY = [
  "search",
  "verdict",
  "page",
  "size",
  "sort",
  "organizationId",
] as const;

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const query = forwardQuery(request.nextUrl.searchParams, ALLOWED_QUERY);

  try {
    const upstream = await upstreamFetch(
      `/admin/security/incidents${query}`,
      token,
    );
    return relay(upstream, "Unable to load security incidents.");
  } catch {
    return unreachable("security incidents");
  }
}
