import { type NextRequest } from "next/server";
import {
  asUuid,
  badJson,
  badRequest,
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
  validationFailed,
} from "@/lib/api/proxy";
import {
  VOTE_TARGET_TYPES,
  voteRequestSchema,
  type VoteTargetType,
} from "@/lib/validations/engagement";

type Context = { params: Promise<{ type: string; targetId: string }> };

async function resolveTarget(context: Context) {
  const { type, targetId } = await context.params;
  const upper = type.toUpperCase() as VoteTargetType;
  const id = asUuid(targetId);

  return VOTE_TARGET_TYPES.includes(upper) && id ? { type: upper, id } : null;
}

const badTarget = () =>
  badRequest(
    `type must be one of ${VOTE_TARGET_TYPES.join(", ")} and targetId must be a UUID`,
  );

export async function PUT(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const target = await resolveTarget(context);
  if (!target) return badTarget();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = voteRequestSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const upstream = await upstreamFetch(
      `/votes/${target.type}/${target.id}`,
      token,
      { method: "PUT", body: JSON.stringify(parsed.data) },
    );
    return relay(upstream, "Your vote could not be recorded.");
  } catch {
    return unreachable("vote");
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const target = await resolveTarget(context);
  if (!target) return badTarget();

  try {
    const upstream = await upstreamFetch(
      `/votes/${target.type}/${target.id}`,
      token,
      { method: "DELETE" },
    );
    return relay(upstream, "Your vote could not be withdrawn.");
  } catch {
    return unreachable("vote");
  }
}
