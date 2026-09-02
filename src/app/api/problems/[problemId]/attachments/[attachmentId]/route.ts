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
 * DELETE /api/problems/{problemId}/attachments/{attachmentId} — removing one
 * file from a problem while its author edits it.
 *
 * Immediate and final: the file is gone from the problem as soon as this
 * answers, not when the form is saved. Whether the caller may do it at all is
 * the upstream's decision — a published problem with answers under it is not
 * an untouched draft — so a refusal is relayed as written rather than
 * pre-empted here.
 */

type Context = { params: Promise<{ problemId: string; attachmentId: string }> };

export async function DELETE(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { problemId: rawProblemId, attachmentId: rawAttachmentId } =
    await context.params;
  const problemId = asUuid(rawProblemId);
  const attachmentId = asUuid(rawAttachmentId);
  if (!problemId || !attachmentId) {
    return badRequest("problemId and attachmentId must be valid UUIDs");
  }

  try {
    const upstream = await upstreamFetch(
      `/problems/${problemId}/attachments/${attachmentId}`,
      token,
      { method: "DELETE" },
    );
    return relay(upstream, "That attachment could not be removed.");
  } catch {
    return unreachable("problem attachment");
  }
}
