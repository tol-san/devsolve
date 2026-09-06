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
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id, userId: targetUserId } = await params;
  const programId = asUuid(id);
  const userId = asUuid(targetUserId);

  if (!programId || !userId) {
    return badRequest("Invalid program ID or user ID");
  }

  try {
    const upstream = await upstreamFetch(
      `/programs/${programId}/invitations/${userId}/revoke`,
      token,
      {
        method: "PATCH",
      },
    );
    return relay(upstream, "Unable to revoke invitation.");
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the program service. Please try again." },
      { status: 502 },
    );
  }
}
