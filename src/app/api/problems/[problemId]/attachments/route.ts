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

type Context = { params: Promise<{ problemId: string }> };

export async function POST(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { problemId: raw } = await context.params;
  const problemId = asUuid(raw);
  if (!problemId) return badRequest("Problem id must be a UUID");

  const multipart = await fileFrom(request, validateAttachment);
  if ("error" in multipart) return multipart.error;

  try {
    const upstream = await upstreamFetch(
      `/problems/${problemId}/attachments`,
      token,
      { method: "POST", body: multipart.body },
    );
    return relay(upstream, "The attachment could not be uploaded.");
  } catch {
    return unreachable("problem attachment");
  }
}
