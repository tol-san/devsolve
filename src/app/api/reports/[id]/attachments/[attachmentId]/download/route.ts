import { type NextRequest, NextResponse } from "next/server";
import {
  asUuid,
  badRequest,
  bearerTokenFor,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

/**
 * GET /api/reports/{id}/attachments/{attachmentId}/download — evidence on a
 * report, streamed back through us.
 *
 * Unlike the problem and solution equivalents this one is never public: a
 * report is confidential, so the upstream wants the caller's token. That is
 * the whole reason attachments are fetched through here rather than from the
 * backend host directly — an `<img src>` cannot carry an Authorization
 * header, and this route can.
 *
 * The upstream answers 307 to a presigned storage URL; `fetch` follows that
 * on its own, so redirects are deliberately left alone. The real content type
 * is passed through, which is what lets an image render inline.
 */

type Context = { params: Promise<{ id: string; attachmentId: string }> };

export async function GET(request: NextRequest, context: Context) {
  const { id: rawId, attachmentId: rawAttachmentId } = await context.params;
  const id = asUuid(rawId);
  const attachmentId = asUuid(rawAttachmentId);
  if (!id || !attachmentId) {
    return badRequest("id and attachmentId must be valid UUIDs");
  }

  const token = await bearerTokenFor(request);

  try {
    const upstream = await upstreamFetch(
      `/reports/${id}/attachments/${attachmentId}/download`,
      token,
    );

    if (!upstream.ok) {
      return new NextResponse(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
      });
    }

    /* Only the headers that decide how the bytes are read. Anything else the
       storage layer set is its own business, not the browser's. */
    const headers = new Headers();
    for (const name of [
      "content-type",
      "content-disposition",
      "content-length",
      "cache-control",
    ]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }

    return new NextResponse(upstream.body, { status: 200, headers });
  } catch {
    return unreachable("report attachment download");
  }
}
