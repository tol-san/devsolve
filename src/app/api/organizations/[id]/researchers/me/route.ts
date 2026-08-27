import { NextResponse, type NextRequest } from "next/server";

import {
  asUuid,
  bearerTokenFor,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";

/**
 * `GET /api/organizations/{id}/researchers/me` — the caller's own record with
 * one company.
 *
 * The upstream answers 404 when the researcher has never approached this
 * company. That is not a failure — it is the commonest state there is, and the
 * one the "Request access" button exists for — so it is flattened to `null`
 * here rather than passed on as an error the caller would have to special-case
 * at every call site.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  const orgId = asUuid(id);
  if (!orgId) {
    return NextResponse.json({ message: "Invalid organization id" }, { status: 400 });
  }

  try {
    const upstream = await upstreamFetch(
      `/organizations/${orgId}/researchers/me`,
      token,
    );
    if (upstream.status === 404) return NextResponse.json(null, { status: 200 });
    return relay(upstream, "Unable to load your access with this organization.");
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the organization service. Please try again." },
      { status: 502 },
    );
  }
}
