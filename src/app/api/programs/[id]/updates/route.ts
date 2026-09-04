import { type NextRequest } from "next/server";
import {
  asUuid,
  badRequest,
  bearerTokenFor,
  forwardQuery,
  relay,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

type Context = { params: Promise<{ id: string }> };

const ALLOWED_QUERY = ["page", "size", "sort"] as const;

export async function GET(request: NextRequest, context: Context) {
  const { id } = await context.params;
  const programId = asUuid(id);
  if (!programId) return badRequest("id must be a UUID");

  const token = await bearerTokenFor(request);
  const query = forwardQuery(request.nextUrl.searchParams, ALLOWED_QUERY);

  try {
    const upstream = await upstreamFetch(
      `/programs/${programId}/updates${query}`,
      token,
    );
    return relay(upstream, "Unable to load program update changelog.");
  } catch {
    return unreachable("program updates");
  }
}
