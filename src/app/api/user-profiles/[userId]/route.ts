import { type NextRequest } from "next/server";
import {
  asUuid,
  badRequest,
  bearerTokenFor,
  relay,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

type Context = { params: Promise<{ userId: string }> };

export async function GET(request: NextRequest, context: Context) {
  const { userId: raw } = await context.params;
  const identifier = raw?.trim();
  if (!identifier) return badRequest("User identifier is required");

  const userId = asUuid(identifier);
  if (!userId) return badRequest("User identifier must be a valid user id");

  const token = await bearerTokenFor(request);

  try {
    const upstream = await upstreamFetch(`/user-profiles/${userId}`, token);
    return relay(upstream, "Unable to load that profile.");
  } catch {
    return unreachable("profile");
  }
}
