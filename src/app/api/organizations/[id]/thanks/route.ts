import { NextResponse, type NextRequest } from "next/server";
import {
  asUuid,
  badRequest,
  forwardQuery,
  relay,
  unreachable,
} from "@/lib/api/proxy";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

type Context = { params: Promise<{ id: string }> };

const ALLOWED_QUERY = ["page", "size"] as const;

export async function GET(request: NextRequest, context: Context) {
  const { id } = await context.params;
  const organizationId = asUuid(id);
  if (!organizationId) {
    return badRequest("id must be a UUID");
  }

  const query = forwardQuery(request.nextUrl.searchParams, ALLOWED_QUERY);

  try {
    const upstream = await fetch(
      `${BACKEND_API_URL}/organizations/${encodeURIComponent(organizationId)}/thanks${query}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    return relay(upstream, "Unable to load organization Hall of Thanks.");
  } catch {
    return unreachable("organization Hall of Thanks");
  }
}
