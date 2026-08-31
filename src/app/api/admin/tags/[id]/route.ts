import { NextResponse, type NextRequest } from "next/server";

import {
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const badId = () =>
  NextResponse.json({ message: "Invalid tag id" }, { status: 400 });

/**
 * `DELETE /api/admin/tags/{id}` — admin tag moderation deletion.
 *
 * Supports `?force=true` query parameter to forcefully remove and unlink the tag
 * from any existing problems, showcases, or revisions.
 * Relays upstream `TagDeletionResponse` detailing unlinked item counts.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  if (!UUID.test(id)) return badId();

  const force = request.nextUrl.searchParams.get("force") === "true";
  const query = force ? "?force=true" : "";

  try {
    const upstream = await upstreamFetch(`/admin/tags/${id}${query}`, token, {
      method: "DELETE",
    });
    return relay(upstream, "The tag could not be deleted.");
  } catch {
    return unreachable("tag moderation");
  }
}
