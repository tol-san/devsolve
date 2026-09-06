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
import { takedownSchema } from "@/lib/validations/moderation";

/** Permanently removes a published showcase. Returns the audit record. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  const showcaseId = asUuid(id);
  if (!showcaseId) return badRequest("A valid showcase id is required");

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = takedownSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const upstream = await upstreamFetch(
      `/admin/showcases/${showcaseId}/takedown`,
      token,
      { method: "POST", body: JSON.stringify(parsed.data) },
    );
    return relay(upstream, "The showcase could not be taken down.");
  } catch {
    return unreachable("moderation");
  }
}
