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
import { inviteResearcherSchema } from "@/lib/validations/researcher-access";

/**
 * `POST /api/organizations/{id}/researchers/invite` — approve without a
 * request.
 *
 * Named "invite" upstream, but nothing is sent anywhere: it links an account
 * that already exists and marks it approved. That is why the body carries a
 * `userId` and not an email — there is no signup to invite someone to.
 */
export async function POST(
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

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = inviteResearcherSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  const { userId, note } = parsed.data;

  try {
    const upstream = await upstreamFetch(
      `/organizations/${orgId}/researchers/invite`,
      token,
      {
        method: "POST",
        /* An empty note is the form saying "none", not an instruction to
           store a blank one. */
        body: JSON.stringify({ userId, note: note?.trim() || undefined }),
      },
    );
    return relay(upstream, "The researcher could not be approved.");
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the organization service. Please try again." },
      { status: 502 },
    );
  }
}
