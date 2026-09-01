import { NextResponse, type NextRequest } from "next/server";
import {
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

/**
 * `POST /api/recognitions` — awards a recognition to a researcher.
 *
 * Requirements:
 * - The report must be RESOLVED first.
 * - Platform assigns reputation: LOW 5 · MEDIUM 15 · HIGH 40 · CRITICAL 100.
 */
export async function POST(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { message: "Recognition payload is required." },
      { status: 400 }
    );
  }

  try {
    const upstream = await upstreamFetch("/recognitions", token, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return relay(upstream, "Unable to award recognition.");
  } catch {
    return unreachable("recognition");
  }
}
