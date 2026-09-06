import { NextResponse, type NextRequest } from "next/server";

import {
  asUuid,
  badRequest,
  bearerTokenFor,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { programId: rawId } = await params;
  const programId = asUuid(rawId);
  if (!programId) {
    return badRequest("Invalid program ID");
  }

  try {
    const upstream = await upstreamFetch(
      `/me/program-invitations/${programId}/accept`,
      token,
      {
        method: "PATCH",
      },
    );
    return relay(upstream, "Unable to accept program invitation.");
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the invitations service. Please try again." },
      { status: 502 },
    );
  }
}
