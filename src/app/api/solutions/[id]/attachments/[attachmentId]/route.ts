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

  const ifMatch =
    request.headers.get("x-if-match") || request.headers.get("if-match");
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
