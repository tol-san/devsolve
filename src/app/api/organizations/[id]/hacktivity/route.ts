import { type NextRequest } from "next/server";
import {
  asUuid,
  badRequest,
  bearerTokenFor,
  forwardQuery,
  relay,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

/**
 * GET /api/organizations/{id}/hacktivity — proxy for
 * /api/v1/organizations/{orgId}/hacktivity.
 */

type Context = { params: Promise<{ id: string }> };

const ALLOWED_QUERY = ["page", "size", "sort"] as const;

export async function GET(request: NextRequest, context: Context) {
  const { id } = await context.params;
  const orgId = asUuid(id);
  if (!orgId) return badRequest("id must be a UUID");

  const token = await bearerTokenFor(request);
  const query = forwardQuery(request.nextUrl.searchParams, ALLOWED_QUERY);

  try {
    const upstream = await upstreamFetch(
      `/organizations/${orgId}/hacktivity${query}`,
      token,
    );
    return relay(upstream, "Unable to load organization hacktivity.");
  } catch {
    return unreachable("organization hacktivity");
  }
}
