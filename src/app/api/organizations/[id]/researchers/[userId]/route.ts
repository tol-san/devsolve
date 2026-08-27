import { NextResponse, type NextRequest } from "next/server";

import {
  asUuid,
  badJson,
  bearerTokenFor,
  relay,
  unauthorized,
  upstreamFetch,
  validationFailed,
} from "@/lib/api/proxy";
import { reviewResearcherAccessSchema } from "@/lib/validations/researcher-access";

/**
 * `PATCH /api/organizations/{id}/researchers/{userId}` — approve, reject or
 * revoke one researcher.
 *
 * The screen only offers the decisions that are legal from the row's current
 * state, so a 409 here means the row was stale — someone else reviewed it
 * first. The upstream's message says so and is relayed unchanged.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id, userId } = await params;
  const orgId = asUuid(id);
  const researcherId = asUuid(userId);
  if (!orgId || !researcherId) {
    return NextResponse.json(
      { message: "Invalid organization or researcher id" },
      { status: 400 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = reviewResearcherAccessSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  const { decision, note } = parsed.data;

  try {
    const upstream = await upstreamFetch(
      `/organizations/${orgId}/researchers/${researcherId}`,
      token,
      {
        method: "PATCH",
        body: JSON.stringify({ decision, note: note?.trim() || undefined }),
      },
    );
    return relay(upstream, "The decision could not be saved.");
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the organization service. Please try again." },
      { status: 502 },
    );
  }
}
