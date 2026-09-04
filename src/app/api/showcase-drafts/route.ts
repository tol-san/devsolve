import { type NextRequest, NextResponse } from "next/server";

import {
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";
import { saveShowcaseDraftSchema } from "@/lib/validations/showcase-draft";

const unreachable = () =>
  NextResponse.json(
    { message: "Unable to reach the showcase service. Please try again." },
    { status: 502 },
  );

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const query = forwardQuery(request.nextUrl.searchParams, [
    "page",
    "size",
    "sort",
  ]);

  try {
    const upstream = await upstreamFetch(`/showcase-drafts${query}`, token);
    return relay(upstream, "Unable to load showcase drafts.");
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

  const parsed = saveShowcaseDraftSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "The showcase draft could not be saved.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const upstream = await upstreamFetch("/showcase-drafts", token, {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "The showcase draft could not be saved.");
  } catch {
    return unreachable();
  }
}
