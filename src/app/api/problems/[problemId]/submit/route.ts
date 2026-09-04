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

type Context = { params: Promise<{ problemId: string }> };

export async function POST(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { problemId: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badRequest("Problem id must be a UUID");

  try {
    const upstream = await upstreamFetch(`/problems/${id}/submit`, token, {
      method: "POST",
    });
    return relay(upstream, "The problem could not be submitted for review.");
  } catch {
    return unreachable("problem");
  }
}
