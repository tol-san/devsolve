import { type NextRequest, NextResponse } from "next/server";

import {
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";

const unreachable = () =>
  NextResponse.json(
    { message: "Unable to reach the solution service. Please try again." },
    { status: 502 },
  );

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const query = forwardQuery(request.nextUrl.searchParams, [
    "problemId",
    "page",
    "size",
    "sort",
  ]);

  try {
    const upstream = await upstreamFetch(`/solution-drafts${query}`, token);
    return relay(upstream, "Unable to load solution drafts.");
  } catch {
    return unreachable();
  }
}
