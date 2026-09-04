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

const ALLOWED_QUERY = [
  "q",
  "severity",
  "eventType",
  "programId",
  "page",
  "size",
  "sort",
] as const;

const REPEATABLE = ["severity", "eventType"] as const;

type Context = { params: Promise<{ userId: string }> };

export async function GET(request: NextRequest, context: Context) {
  const { userId: raw } = await context.params;
  const userId = asUuid(raw);
  if (!userId) return badRequest("User id must be a UUID");

  const token = await bearerTokenFor(request);
  const query = forwardQuery(
    request.nextUrl.searchParams,
    ALLOWED_QUERY,
    REPEATABLE,
  );

  try {
    const upstream = await upstreamFetch(
      `/user-profiles/${userId}/hacktivity${query}`,
      token,
    );
    return relay(upstream, "Unable to load that activity.");
  } catch {
    return unreachable("hacktivity");
  }
}
