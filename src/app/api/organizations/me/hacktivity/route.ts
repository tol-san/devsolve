import { type NextRequest } from "next/server";
import {
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

const ALLOWED_QUERY = ["organizationId", "page", "size", "sort"] as const;

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const query = forwardQuery(request.nextUrl.searchParams, ALLOWED_QUERY);

  try {
    const upstream = await upstreamFetch(
      `/organizations/me/hacktivity${query}`,
      token,
    );
    return relay(upstream, "Unable to load your organization hacktivity.");
  } catch {
    return unreachable("organization hacktivity");
  }
}
