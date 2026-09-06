import { NextResponse, type NextRequest } from "next/server";
import {
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

const VALID_TARGETS = new Set(["PROBLEM", "SHOWCASE"]);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ target: string; contentId: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { target, contentId } = await context.params;
  const upperTarget = (target || "").toUpperCase();

  if (!VALID_TARGETS.has(upperTarget)) {
    return NextResponse.json(
      { message: "Invalid target. Must be PROBLEM or SHOWCASE." },
      { status: 400 },
    );
  }

  try {
    const upstream = await upstreamFetch(
      `/me/auto-reviews/${upperTarget}/${contentId}`,
      token,
    );
    return relay(upstream, "Unable to load the auto-review verdict.");
  } catch {
    return unreachable("auto-review");
  }
}
