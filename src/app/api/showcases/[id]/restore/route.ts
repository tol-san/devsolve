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

export async function PATCH(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badRequest("Showcase id must be a UUID");

  try {
    const upstream = await upstreamFetch(`/showcases/${id}/restore`, token, {
      method: "PATCH",
    });
    return relay(upstream, "The showcase could not be restored.");
  } catch {
    return unreachable("showcase");
  }
}
