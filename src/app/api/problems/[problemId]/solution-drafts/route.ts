import { NextResponse, type NextRequest } from "next/server";

import {
  bearerTokenFor,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";
import { saveSolutionDraftSchema } from "@/lib/validations/solution-draft";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const unreachable = () =>
  NextResponse.json(
    { message: "Unable to reach the solution service. Please try again." },
    { status: 502 },
  );

const badId = () =>
  NextResponse.json({ message: "Invalid problem id" }, { status: 400 });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ problemId: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { problemId } = await params;
  if (!UUID.test(problemId)) return badId();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const parsed = saveSolutionDraftSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "The solution draft could not be saved.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const upstream = await upstreamFetch(
      `/problems/${problemId}/solution-drafts`,
      token,
      {
        method: "POST",
        body: JSON.stringify(parsed.data),
      },
    );
    return relay(upstream, "The solution draft could not be saved.");
  } catch {
    return unreachable();
  }
}
