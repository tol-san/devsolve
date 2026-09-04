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

type Context = { params: Promise<{ userId: string }> };

export async function GET(request: NextRequest, context: Context) {
  const { userId: raw } = await context.params;
  const userId = asUuid(raw);
  if (!userId) return badRequest("User id must be a UUID");

  const token = await bearerTokenFor(request);
  const query = forwardQuery(request.nextUrl.searchParams, [
    "pageNumber",
    "pageSize",
  ]);

  try {
    const upstream = await upstreamFetch(
      `/user-profiles/${userId}/solutions${query}`,
      token,
    );
    return relay(upstream, "Unable to load those solutions.");
  } catch {
    return unreachable("profile");
  }
}
