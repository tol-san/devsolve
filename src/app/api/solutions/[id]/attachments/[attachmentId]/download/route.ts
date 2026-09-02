import { type NextRequest, NextResponse } from "next/server";
import {
  asUuid,
  badRequest,
  bearerTokenFor,
  unreachable,
} from "@/lib/api/proxy";

type Context = {
  params: Promise<{ id: string; attachmentId: string }>;
};

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "https://devsolve-api.quizzy.it.com/api/v1";

export async function GET(request: NextRequest, context: Context) {
  const { id: rawSolutionId, attachmentId: rawAttachmentId } =
    await context.params;
  const solutionId = asUuid(rawSolutionId);
  const attachmentId = asUuid(rawAttachmentId);
  if (!solutionId || !attachmentId) {
    return badRequest("solutionId and attachmentId must be valid UUIDs");
  }

  const token = await bearerTokenFor(request);

  try {
    const upstreamUrl = `${BACKEND_API_URL}/solutions/${solutionId}/attachments/${attachmentId}/download`;
    const upstreamRes = await fetch(upstreamUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!upstreamRes.ok) {
      return new NextResponse(upstreamRes.body, {
        status: upstreamRes.status,
        statusText: upstreamRes.statusText,
      });
    }

    const headers = new Headers();
    const contentType = upstreamRes.headers.get("content-type");
    const contentDisposition = upstreamRes.headers.get("content-disposition");
    const contentLength = upstreamRes.headers.get("content-length");
    const cacheControl = upstreamRes.headers.get("cache-control");

    if (contentType) headers.set("content-type", contentType);
    if (contentDisposition) headers.set("content-disposition", contentDisposition);
    if (contentLength) headers.set("content-length", contentLength);
    if (cacheControl) headers.set("cache-control", cacheControl);

    return new NextResponse(upstreamRes.body, {
      status: 200,
      headers,
    });
  } catch {
    return unreachable("solution attachment download");
  }
}
