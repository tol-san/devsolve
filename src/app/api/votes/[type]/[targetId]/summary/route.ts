import { type NextRequest } from "next/server";
import {
  asUuid,
  badRequest,
  bearerTokenFor,
  relay,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";
import {
  VOTE_TARGET_TYPES,
  type VoteTargetType,
} from "@/lib/validations/engagement";

type Context = { params: Promise<{ type: string; targetId: string }> };

export async function GET(request: NextRequest, context: Context) {
  const { type, targetId } = await context.params;
  const upper = type.toUpperCase() as VoteTargetType;
  const id = asUuid(targetId);

  if (!VOTE_TARGET_TYPES.includes(upper) || !id) {
    return badRequest(
      `type must be one of ${VOTE_TARGET_TYPES.join(", ")} and targetId must be a UUID`,
    );
  }

  const token = await bearerTokenFor(request);

  try {
    const upstream = await upstreamFetch(
      `/votes/${upper}/${id}/summary`,
      token,
    );
    return relay(upstream, "Unable to load the vote count.");
  } catch {
    return unreachable("vote");
  }
}
