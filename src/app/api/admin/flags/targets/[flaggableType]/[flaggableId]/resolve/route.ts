import { type NextRequest } from "next/server";

import {
  badJson,
  badRequest,
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
  validationFailed,
} from "@/lib/api/proxy";
import { flagResolveSchema } from "@/lib/validations/moderation";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ flaggableType: string; flaggableId: string }> }
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { flaggableType, flaggableId } = await context.params;
  if (!flaggableType || !flaggableId) {
    return badRequest("Both flaggableType and flaggableId are required");
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = flagResolveSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const upstream = await upstreamFetch(
      `/admin/flags/targets/${encodeURIComponent(flaggableType)}/${encodeURIComponent(flaggableId)}/resolve`,
      token,
      {
        method: "PATCH",
        body: JSON.stringify(parsed.data),
      }
    );
    return relay(upstream, "Unable to resolve target flags.");
  } catch {
    return unreachable("moderation");
  }
}
