import { type NextRequest, NextResponse } from "next/server";

import {
  bearerTokenFor,
  forwardQuery,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";
import { enrichDraftsWithWeakness } from "@/lib/server/db";

/**
 * `GET /api/report-drafts` — the caller's saved report drafts.
 *
 * Filtered by `programId` when the report form wants to know whether the
 * reporter already has something unfinished for the program they just opened.
 */
export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const query = forwardQuery(request.nextUrl.searchParams, [
    "programId",
    "page",
    "size",
    "sort",
  ]);

  try {
    const upstream = await upstreamFetch(`/report-drafts${query}`, token);
    const raw = await upstream.text();
    let body: any = null;
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        body = { message: raw };
      }
    }
    if (!upstream.ok) {
      return NextResponse.json(body, { status: upstream.status });
    }
    const items = Array.isArray(body?.content)
      ? body.content
      : Array.isArray(body?.items)
      ? body.items
      : Array.isArray(body)
      ? body
      : [];

    if (items.length > 0) {
      await enrichDraftsWithWeakness(items);
    }
    return NextResponse.json(body, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the report service. Please try again." },
      { status: 502 },
    );
  }
}
