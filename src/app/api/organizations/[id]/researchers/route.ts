import { NextResponse, type NextRequest } from "next/server";

import {
  asUuid,
  badJson,
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  upstreamFetch,
  validationFailed,
} from "@/lib/api/proxy";
import { requestResearcherAccessSchema } from "@/lib/validations/researcher-access";

const unreachable = () =>
  NextResponse.json(
    { message: "Unable to reach the organization service. Please try again." },
    { status: 502 },
  );

const invalidOrg = () =>
  NextResponse.json({ message: "Invalid organization id" }, { status: 400 });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  const orgId = asUuid(id);
  if (!orgId) return invalidOrg();

  const query = forwardQuery(request.nextUrl.searchParams, [
    "status",
    "page",
    "size",
    "sort",
  ]);

  try {
    const upstream = await upstreamFetch(
      `/organizations/${orgId}/researchers${query}`,
      token,
    );
    return relay(upstream, "Unable to load researcher access requests.");
  } catch {
    return unreachable();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  const orgId = asUuid(id);
  if (!orgId) return invalidOrg();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = requestResearcherAccessSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const upstream = await upstreamFetch(`/organizations/${orgId}/researchers`, token, {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "Your access request could not be sent.");
  } catch {
    return unreachable();
  }
}
