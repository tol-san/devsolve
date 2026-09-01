import { type NextRequest } from "next/server";
import {
  asUuid,
  badRequest,
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

/**
 * GET /api/organizations/{id}/security/incidents — Next proxy for
 * /api/v1/organizations/{orgId}/security/incidents.
 *
 * Requires TRIAGE_REPORTS on that organization (or platform ADMIN).
 * Returns 403 with upstream message if caller lacks permission.
 */

type Context = { params: Promise<{ id: string }> };

const ALLOWED_QUERY = ["search", "verdict", "page", "size", "sort"] as const;

export async function GET(request: NextRequest, context: Context) {
  const { id } = await context.params;
  const orgId = asUuid(id);
  if (!orgId) return badRequest("id must be a UUID");

  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const query = forwardQuery(request.nextUrl.searchParams, ALLOWED_QUERY);

  try {
    const upstream = await upstreamFetch(
      `/organizations/${orgId}/security/incidents${query}`,
      token,
    );
    return relay(upstream, "Unable to load organization security incidents.");
  } catch {
    return unreachable("organization security incidents");
  }
}
