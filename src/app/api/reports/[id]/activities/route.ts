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

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: rawId } = await context.params;
  const id = asUuid(rawId);
  if (!id) return badRequest("Report id must be a UUID");

  try {
    const upstream = await upstreamFetch(`/reports/${id}/activities`, token);
    return relay(upstream, "That report's activity could not be loaded.");
  } catch {
    return unreachable("report activity");
  }
}
