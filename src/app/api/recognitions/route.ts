import { NextResponse, type NextRequest } from "next/server";
import {
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

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

  const query = request.nextUrl.search || "";
  try {
    const upstream = await upstreamFetch(`/recognitions${query}`, token, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return relay(upstream, "Unable to award recognition.");
  } catch {
    return unreachable("recognition");
  }
}
