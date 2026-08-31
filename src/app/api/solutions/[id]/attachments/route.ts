import { type NextRequest } from "next/server";
import {
  asUuid,
  badRequest,
  bearerTokenFor,
  fileFrom,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";
import { validateAttachment } from "@/lib/validations/attachment";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badRequest("Solution id must be a UUID");

  const ifMatch = request.headers.get("If-Match");
  if (!ifMatch) return badRequest("An If-Match solution version is required");

  const multipart = await fileFrom(request, validateAttachment);
  if ("error" in multipart) return multipart.error;

  try {
    const upstream = await upstreamFetch(`/solutions/${id}/attachments`, token, {
      method: "POST",
      headers: { "If-Match": ifMatch },
      body: multipart.body,
    });
    return relay(upstream, "The attachment could not be uploaded.");
  } catch {
    return unreachable("solution attachment");
  }
}
