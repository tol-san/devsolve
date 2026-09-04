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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await context.params;
  const validUuid = asUuid(id);
  if (!validUuid) return badRequest("Invalid notification ID");

  try {
    const upstream = await upstreamFetch(
      `/notifications/${validUuid}/read`,
      token,
      { method: "PATCH" },
    );
    return relay(upstream, "Unable to mark notification as read.");
  } catch {
    return unreachable("notification");
  }
}
