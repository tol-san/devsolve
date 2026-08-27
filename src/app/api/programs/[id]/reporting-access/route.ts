import { NextResponse, type NextRequest } from "next/server";

import {
  asUuid,
  bearerTokenFor,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";

/**
 * `GET /api/programs/{id}/reporting-access` — may the caller file here?
 *
 * Asked before the report form offers a submit button, so a researcher who is
 * not cleared finds that out with an empty form rather than a written one.
 * The answer is about the *organization* behind the program: one approval
 * covers every program that company runs.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  const programId = asUuid(id);
  if (!programId) {
    return NextResponse.json({ message: "Invalid program id" }, { status: 400 });
  }

  try {
    const upstream = await upstreamFetch(
      `/programs/${programId}/reporting-access`,
      token,
    );
    return relay(upstream, "Unable to check your reporting access.");
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the program service. Please try again." },
      { status: 502 },
    );
  }
}
