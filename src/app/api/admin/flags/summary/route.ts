import { type NextRequest } from "next/server";

import {
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

/**
 * Moderation flags summary counters (totalPending, totalResolved, totalDismissed, byReason, byType).
 */
export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  try {
    const upstream = await upstreamFetch("/admin/flags/summary", token);
    return relay(upstream, "Unable to load flag summary.");
  } catch {
    return unreachable("moderation");
  }
}
