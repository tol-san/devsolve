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
