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

/**
 * `GET /api/admin/weaknesses` — the whole catalogue, retired entries included.
 *
 * The public `/api/weaknesses` hides anything inactive because the report form
 * must not offer it. An admin needs to see exactly what an admin can edit, so
 * this one passes `activeOnly` straight through and defaults it off.
 */
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

/** `POST /api/admin/weaknesses` — add an entry to the catalogue. */
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

  /* Validated here as well as in the dialog: the route is reachable without
     the form, and the upstream's limits are worth enforcing before the hop. */
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
