import { type NextRequest } from "next/server";
import {
  asUuid,
  badRequest,
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

/**
 * POST /api/reports/{id}/severity/accept — the reporter agrees with triage.
 *
 * Reporter-only, and the upstream answers **404** to anyone else rather than
 * 403: a report's existence is not public, so the refusal must not confirm it.
 * That status is relayed as itself, and the screens read it as not-found.
 *
 * Irreversible upstream. The whole updated `ReportResponse` comes back, which
 * is what the caller writes into its cache instead of re-reading the report.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: rawId } = await context.params;
  const id = asUuid(rawId);
  if (!id) return badRequest("Report id must be a UUID");

  try {
    const upstream = await upstreamFetch(`/reports/${id}/severity/accept`, token, {
      method: "POST",
    });
    return relay(upstream, "That severity could not be accepted.");
  } catch {
    return unreachable("severity decision");
  }
}
