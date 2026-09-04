import { type NextRequest } from "next/server";
import {
  bearerTokenFor,
  forwardQuery,
  relay,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

const ALLOWED_QUERY = [
  "q",
  "severity",
  "eventType",
  "programId",
  "organizationId",
  "page",
  "size",
  "sort",
] as const;

const REPEATABLE = ["severity", "eventType"] as const;

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);

  const query = forwardQuery(
    request.nextUrl.searchParams,
    ALLOWED_QUERY,
    REPEATABLE,
  );

  try {
    const upstream = await upstreamFetch(`/hacktivity${query}`, token);
    return relay(upstream, "Unable to load the hacktivity feed.");
  } catch {
    return unreachable("hacktivity");
  }
}
