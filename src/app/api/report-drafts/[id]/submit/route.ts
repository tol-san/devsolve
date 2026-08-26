import { NextResponse, type NextRequest } from "next/server";

import {
  bearerTokenFor,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * `POST /api/report-drafts/{id}/submit` — file the draft as a real report.
 *
 * The upstream promotes what it already holds, so nothing is sent with it.
 * This is where the draft's relaxed rules end: `reportedSeverity` may be
 * `NONE` on a draft and is refused on a report, so a 400 here is expected
 * and its message is relayed intact for the form to attach to a field.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ message: "Invalid draft id" }, { status: 400 });
  }

  try {
    const upstream = await upstreamFetch(`/report-drafts/${id}/submit`, token, {
      method: "POST",
    });
    return relay(upstream, "The report could not be submitted.");
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the report service. Please try again." },
      { status: 502 },
    );
  }
}
