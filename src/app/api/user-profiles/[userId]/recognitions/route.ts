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
  const validUserId = asUuid(userId);
  if (!validUserId) {
    return badRequest("userId must be a UUID");
  }

  const query = forwardQuery(request.nextUrl.searchParams, ALLOWED_QUERY);

  try {
    const upstream = await fetch(
      `${BACKEND_API_URL}/user-profiles/${encodeURIComponent(validUserId)}/recognitions${query}`,
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
