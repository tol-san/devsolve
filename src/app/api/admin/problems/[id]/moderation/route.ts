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
import { problemModerationSchema } from "@/lib/validations/problem";

const DECISIONS = ["PUBLISHED", "REJECTED"] as const;

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badRequest("Problem id must be a UUID");

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = problemModerationSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  if (!DECISIONS.includes(parsed.data.status as (typeof DECISIONS)[number])) {
    return badRequest(
      `A moderation decision must be one of ${DECISIONS.join(", ")}`,
    );
  }

  try {
    const upstream = await upstreamFetch(
      `/admin/problems/${id}/moderation`,
      token,
      { method: "PATCH", body: JSON.stringify(parsed.data) },
    );
    return relay(upstream, "The moderation decision could not be saved.");
  } catch {
    return unreachable("problem");
  }
}
