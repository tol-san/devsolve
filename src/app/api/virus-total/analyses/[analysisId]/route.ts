import { type NextRequest } from "next/server";
import {
  badRequest,
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

type Context = { params: Promise<{ analysisId: string }> };

/**
 * GET /api/virus-total/analyses/{analysisId} — poll the status and verdict of a VirusTotal analysis.
 *
 * Backend: GET /api/v1/virus-total/analyses/{analysisId}
 */
export async function GET(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { analysisId } = await context.params;
  if (!analysisId || !analysisId.trim()) {
    return badRequest("Analysis id is required");
  }

  try {
    const upstream = await upstreamFetch(
      `/virus-total/analyses/${encodeURIComponent(analysisId.trim())}`,
      token,
    );
    return relay(upstream, "Unable to retrieve analysis status.");
  } catch {
    return unreachable("security scanning");
  }
}
