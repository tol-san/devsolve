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

/**
 * POST /api/reports/{id}/severity/reject — the reporter refuses triage's
 * rating, which escalates the dispute to an administrator.
 *
 * The reason is required and is the whole point: an administrator is about to
 * rule between two ratings, and a blank refusal gives them nothing. Checked
 * here so the reporter sees it while their words are still on screen, rather
 * than as a 400 after the fact.
 *
 * Reporter-only; anyone else gets the upstream's deliberate 404.
 */
const rejectSchema = z.object({
  reason: z.string().trim().min(1).max(5000),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: rawId } = await context.params;
  const id = asUuid(rawId);
  if (!id) return badRequest("Report id must be a UUID");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badJson();
  }

  const parsed = rejectSchema.safeParse(body);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const upstream = await upstreamFetch(`/reports/${id}/severity/reject`, token, {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "That severity could not be refused.");
  } catch {
    return unreachable("severity decision");
  }
}
