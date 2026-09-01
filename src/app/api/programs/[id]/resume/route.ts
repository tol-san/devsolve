import { type NextRequest } from "next/server";
import {
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;

  try {
    const upstream = await upstreamFetch(`/programs/${id}/resume`, token, {
      method: "PATCH",
    });
    return relay(upstream, "Failed to resume program.");
  } catch {
    return unreachable("program resume");
  }
}
