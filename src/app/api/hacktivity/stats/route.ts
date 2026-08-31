import { type NextRequest } from "next/server";
import {
  bearerTokenFor,
  relay,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

/**
 * GET /api/hacktivity/stats — proxy for /api/v1/hacktivity/stats.
 *
 * The four figures above the feed. They are platform-wide totals, so they are
 * asked for once rather than counted from whichever page happens to be loaded.
 */

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);

  try {
    const upstream = await upstreamFetch("/hacktivity/stats", token);
    return relay(upstream, "Unable to load the hacktivity totals.");
  } catch {
    return unreachable("hacktivity");
  }
}
