import { type NextRequest } from "next/server";
import {
  asUuid,
  badJson,
  badRequest,
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
  validationFailed,
} from "@/lib/api/proxy";
import {
  COMMENTABLE_TYPES,
  commentCreateSchema,
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
    "parentCommentId",
    "pageNumber",
    "pageSize",
  ]);

  try {
    const upstream = await upstreamFetch(`/comments${query}`, token);
    return relay(upstream, "Unable to load the comments.");
  } catch {
    return unreachable("comment");
  }
}

export async function POST(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = commentCreateSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const upstream = await upstreamFetch("/comments", token, {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "Your comment could not be posted.");
  } catch {
    return unreachable("comment");
  }
}
