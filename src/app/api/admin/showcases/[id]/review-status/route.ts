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
import { showcaseReviewStatusSchema } from "@/lib/validations/showcase";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badRequest("Showcase id must be a UUID");

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = showcaseReviewStatusSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  if (parsed.data.reviewStatus === "REJECTED" && !parsed.data.rejectionReason) {
    return badRequest("A rejection needs a reason the author can act on");
  }

  try {
    const upstream = await upstreamFetch(
      `/admin/showcases/${id}/review-status`,
      token,
      { method: "PATCH", body: JSON.stringify(parsed.data) },
    );
    return relay(upstream, "The review decision could not be saved.");
  } catch {
    return unreachable("showcase");
  }
}
