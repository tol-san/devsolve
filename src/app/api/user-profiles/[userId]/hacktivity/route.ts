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

/**
 * GET /api/user-profiles/{userId}/hacktivity — one researcher's public
 * activity, the feed behind the Hacktivity tab on a profile.
 *
 * Public, like the profile it hangs off. A signed-in caller still sends their
 * token: the upstream decides what each viewer may see, and an undisclosed
 * report's title is withheld there rather than here.
 */

const ALLOWED_QUERY = [
  "q",
  "severity",
  "eventType",
  "programId",
  "page",
  "size",
  "sort",
] as const;

/** The upstream reads both as repeatable lists, not comma-joined values. */
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
