import { type NextRequest } from "next/server";
import {
  asUuid,
  badRequest,
  bearerTokenFor,
  forwardQuery,
  relay,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";
import {
  COMMENTABLE_TYPES,
  type CommentableType,
} from "@/lib/validations/engagement";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const type = (search.get("commentableType") ?? "").toUpperCase() as
    | CommentableType
    | "";
  const id = asUuid(search.get("commentableId") ?? undefined);

  if (!type || !COMMENTABLE_TYPES.includes(type) || !id) {
    return badRequest(
      `commentableType must be one of ${COMMENTABLE_TYPES.join(", ")} and commentableId must be a UUID`,
    );
  }

  const token = await bearerTokenFor(request);
  const query = forwardQuery(search, [
    "commentableType",
    "commentableId",
    "sort",
    "replyLimit",
    "pageNumber",
    "pageSize",
  ]);

  try {
    const upstream = await upstreamFetch(`/comments/thread${query}`, token);
    return relay(upstream, "Unable to load the comments.");
  } catch {
    return unreachable("comment");
  }
}
