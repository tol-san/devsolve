import type { NextRequest } from "next/server";

/**
 * Carries the caller's chosen organization through to the upstream.
 *
 * The `/organizations/me/*` endpoints name no organization of their own, so an
 * account that belongs to more than one gets a `409` rather than a guess. Which
 * one the workspace is showing is a choice the person made in the switcher, and
 * it lives in the browser — these route handlers run on the server and cannot
 * read it. So the client appends `organizationId` and every proxy in that
 * family passes it along; dropping it here is the same as never sending it.
 *
 * Absent for an account with exactly one membership, where the upstream
 * resolves it unaided.
 */
export function withOrganizationScope(
  request: NextRequest,
  upstreamUrl: string,
): string {
  const organizationId = request.nextUrl.searchParams.get("organizationId");
  if (!organizationId) return upstreamUrl;

  const separator = upstreamUrl.includes("?") ? "&" : "?";
  return `${upstreamUrl}${separator}organizationId=${encodeURIComponent(organizationId)}`;
}
