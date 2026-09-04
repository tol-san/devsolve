import { type NextRequest } from "next/server";
import {
  asUuid,
  badRequest,
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badRequest("Showcase id must be a UUID");

  const query = forwardQuery(request.nextUrl.searchParams, [
    "pageNumber",
    "pageSize",
  ]);

  try {
    const upstream = await upstreamFetch(
      `/admin/showcases/${id}/review-history${query}`,
      token,
    );
    return relay(upstream, "Unable to load the review history.");
  } catch {
    return unreachable("showcase");
  }
}
