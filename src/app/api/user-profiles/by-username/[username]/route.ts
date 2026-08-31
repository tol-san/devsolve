import { type NextRequest } from "next/server";
import {
  badRequest,
  bearerTokenFor,
  relay,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

/**
 * GET /api/user-profiles/by-username/{username} — one public profile, by handle.
 *
 * Profiles used to be reachable only by UUID, so a readable URL had to be
 * resolved by fetching the signed-in user and checking whether the segment
 * matched a name derived from their email. That only ever worked for the
 * viewer's own profile: anybody else's handle fell through to `/me` and
 * returned the wrong person, which is why the fallback had to be answered with
 * a synthetic 404 instead.
 *
 * The backend publishes handles now, so the lookup is a real one.
 *
 * Anonymous is fine — this is public — and the token is forwarded only so the
 * upstream can decide what a signed-in viewer may additionally see (an email
 * is returned when the two share an organization).
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> },
) {
  const { username: raw } = await context.params;
  const username = raw?.trim();
  if (!username) return badRequest("A username is required");

  const token = await bearerTokenFor(request);

  try {
    const upstream = await upstreamFetch(
      `/user-profiles/by-username/${encodeURIComponent(username)}`,
      token,
    );
    return relay(upstream, "Unable to load that profile.");
  } catch {
    return unreachable("profile");
  }
}
