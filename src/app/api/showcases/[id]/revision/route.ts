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

const badId = () => badRequest("Showcase id must be a UUID");

export async function GET(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badId();

  try {
    const upstream = await upstreamFetch(`/showcases/${id}/revision`, token);
    return relay(upstream, "Unable to load your pending revision.");
  } catch {
    return unreachable("showcase");
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badId();

  try {
    const upstream = await upstreamFetch(`/showcases/${id}/revision`, token, {
      method: "DELETE",
    });
    return relay(upstream, "The revision could not be withdrawn.");
  } catch {
    return unreachable("showcase");
  }
}
