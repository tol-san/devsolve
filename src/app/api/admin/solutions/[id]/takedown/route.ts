import { type NextRequest } from "next/server";

import {
  asUuid,
  badJson,
  badRequest,
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
  validationFailed,
} from "@/lib/api/proxy";
import { takedownSchema } from "@/lib/validations/moderation";

/** Permanently removes a published solution. Returns the audit record. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  const solutionId = asUuid(id);
  if (!solutionId) return badRequest("A valid solution id is required");

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = takedownSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const upstream = await upstreamFetch(
      `/admin/solutions/${solutionId}/takedown`,
      token,
      { method: "POST", body: JSON.stringify(parsed.data) },
    );
    return relay(upstream, "The solution could not be taken down.");
  } catch {
    return unreachable("moderation");
  }
}
