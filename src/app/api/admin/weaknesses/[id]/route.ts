import { NextResponse, type NextRequest } from "next/server";

import {
  bearerTokenFor,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";
import { weaknessPatchSchema } from "@/lib/validations/weakness";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const unreachable = () =>
  NextResponse.json(
    { message: "Unable to reach the weakness service. Please try again." },
    { status: 502 },
  );

const badId = () =>
  NextResponse.json({ message: "Invalid weakness id" }, { status: 400 });

/** `PATCH /api/admin/weaknesses/{id}` — every field optional upstream. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  if (!UUID.test(id)) return badId();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const parsed = weaknessPatchSchema.safeParse(payload);
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
    const upstream = await upstreamFetch(`/admin/weaknesses/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "The weakness could not be updated.");
  } catch {
    return unreachable();
  }
}

/**
 * `DELETE /api/admin/weaknesses/{id}`.
 *
 * Reports reference a weakness by id, so removing one that is already cited
 * is the upstream's call to allow or refuse — whatever it answers is relayed
 * rather than second-guessed here.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  if (!UUID.test(id)) return badId();

  try {
    const upstream = await upstreamFetch(`/admin/weaknesses/${id}`, token, {
      method: "DELETE",
    });
    return relay(upstream, "The weakness could not be deleted.");
  } catch {
    return unreachable();
  }
}
