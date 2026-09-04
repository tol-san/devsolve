import { type NextRequest } from "next/server";
import { z } from "zod";
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

const resolveSchema = z.object({
  status: z.enum(["RESOLVED", "DISMISSED", "UNDER_REVIEW", "OPEN", "AWAITING_REPORTER"]),
  finalSeverity: z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  resolutionNotes: z.string().max(2000).optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: rawId } = await context.params;
  const id = asUuid(rawId);
  if (!id) return badRequest("Dispute ID must be a valid UUID");

  try {
    const upstream = await upstreamFetch(`/admin/disputes/${id}`, token, {
      method: "GET",
    });
    return relay(upstream, "Unable to load dispute details.");
  } catch {
    return unreachable("dispute");
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: rawId } = await context.params;
  const id = asUuid(rawId);
  if (!id) return badRequest("Dispute ID must be a valid UUID");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badJson();
  }

  const parsed = resolveSchema.safeParse(body);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const upstream = await upstreamFetch(`/admin/disputes/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "Unable to resolve dispute.");
  } catch {
    return unreachable("dispute resolution");
  }
}
