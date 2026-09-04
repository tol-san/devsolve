import { type NextRequest } from "next/server";
import {
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

/**
 * GET /api/admin/disputes — fetch the admin dispute queue from the backend.
 *
 * Returns disputes that require administrator ruling (or settled ones),
 * carrying reportedSeverity, triageSeverity, cvssVector, cvssScore, reason,
 * resolvedSeverity, status, and respondBy.
 */
export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  const path = `/admin/disputes${queryString ? `?${queryString}` : ""}`;

  try {
    const upstream = await upstreamFetch(path, token, { method: "GET" });
    return relay(upstream, "Unable to load disputes.");
  } catch {
    return unreachable("disputes");
  }
}
