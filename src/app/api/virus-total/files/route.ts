import { type NextRequest } from "next/server";
import {
  bearerTokenFor,
  fileFrom,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";
import { validateAttachment } from "@/lib/validations/attachment";

/**
 * POST /api/virus-total/files — submit a file for VirusTotal analysis.
 *
 * Backend: POST /api/v1/virus-total/files
 * Multipart form data containing a single 'file' part.
 */
export async function POST(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const multipart = await fileFrom(request, validateAttachment);
  if ("error" in multipart) return multipart.error;

  try {
    const upstream = await upstreamFetch("/virus-total/files", token, {
      method: "POST",
      body: multipart.body,
    });
    return relay(upstream, "The file could not be submitted for scanning.");
  } catch {
    return unreachable("security scanning");
  }
}
