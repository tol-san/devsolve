import type { NextRequest } from "next/server";

export function withOrganizationScope(
  request: NextRequest,
  upstreamUrl: string,
): string {
  const organizationId = request.nextUrl.searchParams.get("organizationId");
  if (!organizationId) return upstreamUrl;

  const separator = upstreamUrl.includes("?") ? "&" : "?";
  return `${upstreamUrl}${separator}organizationId=${encodeURIComponent(organizationId)}`;
}
