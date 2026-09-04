import { type NextRequest } from "next/server";
import {
  asUuid,
  badRequest,
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";
import {
  BOOKMARK_TARGET_TYPES,
  type BookmarkTargetType,
} from "@/lib/validations/engagement";

type Context = { params: Promise<{ type: string; targetId: string }> };

export async function GET(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { type, targetId } = await context.params;
  const upper = type.toUpperCase() as BookmarkTargetType;
  const id = asUuid(targetId);

  if (!BOOKMARK_TARGET_TYPES.includes(upper) || !id) {
    return badRequest(
      `type must be one of ${BOOKMARK_TARGET_TYPES.join(", ")} and targetId must be a UUID`,
    );
  }

  try {
    const upstream = await upstreamFetch(
      `/bookmarks/${upper}/${id}/status`,
      token,
    );
    return relay(upstream, "Unable to check that bookmark.");
  } catch {
    return unreachable("bookmark");
  }
}
