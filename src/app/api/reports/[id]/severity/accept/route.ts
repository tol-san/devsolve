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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: rawId } = await context.params;
  const id = asUuid(rawId);
  if (!id) return badRequest("Report id must be a UUID");

  try {
    const upstream = await upstreamFetch(`/reports/${id}/severity/accept`, token, {
      method: "POST",
    });
    return relay(upstream, "That severity could not be accepted.");
  } catch {
    return unreachable("severity decision");
  }
}
