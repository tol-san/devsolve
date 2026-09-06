import { type NextRequest } from "next/server";

import {
  badRequest,
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

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

  try {
    const upstream = await upstreamFetch(
      `/admin/flags/targets/${encodeURIComponent(flaggableType)}/${encodeURIComponent(flaggableId)}/dismiss`,
      token,
      {
        method: "PATCH",
      }
    );
    return relay(upstream, "Unable to dismiss target flags.");
  } catch {
    return unreachable("moderation");
  }
}
