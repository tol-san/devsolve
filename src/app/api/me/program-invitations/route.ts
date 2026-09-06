import { NextResponse, type NextRequest } from "next/server";

import {
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";

const ALLOWED_QUERY = ["status", "page", "size", "sort"] as const;

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const queryParams = new URLSearchParams(request.nextUrl.searchParams);
  const status = queryParams.get("status");
  if (status === "ALL") {
    queryParams.delete("status");
  }

  const query = forwardQuery(queryParams, ALLOWED_QUERY);

  try {
    const upstream = await upstreamFetch(
      `/me/program-invitations${query}`,
      token,
    );
    return relay(upstream, "Unable to load your program invitations.");
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the invitations service. Please try again." },
      { status: 502 },
    );
  }
}
