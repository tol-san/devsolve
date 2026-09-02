import { NextResponse, type NextRequest } from "next/server";
import {
  asUuid,
  badRequest,
  forwardQuery,
  relay,
  unreachable,
} from "@/lib/api/proxy";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

type Context = { params: Promise<{ userId: string }> };

const ALLOWED_QUERY = ["page", "size", "sort"] as const;

/**
 * GET /api/user-profiles/{userId}/recognitions
 * Public recognitions awarded to a researcher.
 * Proxies to GET {BACKEND_API_URL}/user-profiles/{userId}/recognitions?page=...&size=...&sort=...
 */
export async function GET(request: NextRequest, context: Context) {
  const { userId } = await context.params;
  let targetId = asUuid(userId);

  if (!targetId && userId) {
    // If not a direct UUID, resolve handle via /user-profiles/by-username/{userId}
    try {
      const isMe = userId.toLowerCase() === "me";
      const lookupUrl = isMe
        ? `${BACKEND_API_URL}/user-profiles/me`
        : `${BACKEND_API_URL}/user-profiles/by-username/${encodeURIComponent(userId)}`;

      const res = await fetch(lookupUrl, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.id && asUuid(json.id)) {
          targetId = json.id;
        }
      }
    } catch {
      // Fall through to validation check below
    }
  }

  if (!targetId) {
    return badRequest("userId must be a valid user UUID or known username");
  }

  const query = forwardQuery(request.nextUrl.searchParams, ALLOWED_QUERY);

  try {
    const upstream = await fetch(
      `${BACKEND_API_URL}/user-profiles/${encodeURIComponent(targetId)}/recognitions${query}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    return relay(upstream, "Unable to load researcher recognitions.");
  } catch {
    return unreachable("researcher recognitions");
  }
}
