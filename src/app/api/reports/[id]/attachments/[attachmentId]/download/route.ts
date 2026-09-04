import { type NextRequest, NextResponse } from "next/server";
import {
  asUuid,
  badRequest,
  bearerTokenFor,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

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
