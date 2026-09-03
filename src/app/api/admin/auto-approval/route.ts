import { type NextRequest } from "next/server";
import {
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

/**
 * GET /api/admin/auto-approval — retrieves the current AI auto-approval configuration
 * for both PROBLEM and SHOWCASE content kinds.
 */
export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  try {
    const upstream = await upstreamFetch("/admin/auto-approval", token);
    return relay(upstream, "Unable to load auto-approval settings.");
  } catch {
    return unreachable("admin");
  }
}
