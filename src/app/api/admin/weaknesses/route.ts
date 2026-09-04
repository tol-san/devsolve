import { NextResponse, type NextRequest } from "next/server";

import {
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";
import { weaknessCreateSchema } from "@/lib/validations/weakness";

const unreachable = () =>
  NextResponse.json(
    { message: "Unable to reach the weakness service. Please try again." },
    { status: 502 },
  );

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const query = forwardQuery(request.nextUrl.searchParams, [
    "search",
    "activeOnly",
    "page",
    "size",
    "sort",
  ]);

  try {
    const upstream = await upstreamFetch(`/admin/weaknesses${query}`, token);
    return relay(upstream, "Unable to load the weakness catalogue.");
  } catch {
    return unreachable();
  }
}

export async function POST(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const parsed = weaknessCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "The weakness could not be saved.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const upstream = await upstreamFetch("/admin/weaknesses", token, {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "The weakness could not be created.");
  } catch {
    return unreachable();
  }
}
