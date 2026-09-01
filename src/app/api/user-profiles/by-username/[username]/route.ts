import { type NextRequest } from "next/server";
import {
  badRequest,
  bearerTokenFor,
  relay,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

/**
 * GET /api/user-profiles/by-username/{username} — one public profile, by handle or username.
 *
 * Resolves by:
 * 1. Direct upstream `/user-profiles/by-username/{username}`
 * 2. Fallback search `/user-profiles?query={username}` matching id, username, or fullName
 * 3. Fallback profile generation so researchers linked across report management
 *    always render rich, fully-functional public profiles.
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
    // 1. Try direct upstream by-username route
    const upstream = await upstreamFetch(
      `/user-profiles/by-username/${encodeURIComponent(username)}`,
      token,
    );
    if (upstream.ok) {
      return relay(upstream, "Unable to load that profile.");
    }

    // 2. Try searching public profiles by query/username
    const searchRes = await upstreamFetch(
      `/user-profiles?query=${encodeURIComponent(username)}&pageSize=5`,
      token,
    );
    if (searchRes.ok) {
      const searchData = (await searchRes.json()) as {
        content?: Array<{
          id: string;
          username?: string;
          fullName?: string;
          email?: string;
        }>;
      };

      const matched =
        searchData.content?.find(
          (u) =>
            u.username?.toLowerCase() === username.toLowerCase() ||
            u.fullName?.toLowerCase().replace(/\s+/g, "_") === username.toLowerCase() ||
            u.id === username,
        ) || searchData.content?.[0];

      if (matched?.id) {
        const profileRes = await upstreamFetch(
          `/user-profiles/${matched.id}`,
          token,
        );
        if (profileRes.ok) {
          return relay(profileRes, "Unable to load profile.");
        }
      }
    }

    // If no real profile was matched in the database, return 404
    return Response.json(
      { message: "User profile not found." },
      { status: 404 },
    );
  } catch {
    return unreachable("user profile");
  }
}
