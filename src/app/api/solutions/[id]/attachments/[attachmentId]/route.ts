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

/**
 * DELETE /api/solutions/{id}/attachments/{attachmentId} — removing one file
 * from an answer while its author edits it.
 *
 * Unlike the problem equivalent this endpoint **requires `If-Match`**, the
 * solution's `version`, and refuses the call without one. It is the same
 * optimistic-concurrency guard the solution's own PATCH uses: two people
 * editing one answer must not silently overwrite each other, and a stale
 * version means someone else moved first. The header is forwarded from the
 * caller rather than invented, so a stale value is refused upstream — which is
 * the point of sending it.
 */

type Context = { params: Promise<{ id: string; attachmentId: string }> };

export async function DELETE(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: rawId, attachmentId: rawAttachmentId } = await context.params;
  const id = asUuid(rawId);
  const attachmentId = asUuid(rawAttachmentId);
  if (!id || !attachmentId) {
    return badRequest("id and attachmentId must be valid UUIDs");
  }

  const ifMatch = request.headers.get("if-match");
  if (!ifMatch) {
    return badRequest(
      "An If-Match header carrying the solution's version is required",
    );
  }

  try {
    const upstream = await upstreamFetch(
      `/solutions/${id}/attachments/${attachmentId}`,
      token,
      { method: "DELETE", headers: { "If-Match": ifMatch } },
    );
    return relay(upstream, "That attachment could not be removed.");
  } catch {
    return unreachable("solution attachment");
  }
}
