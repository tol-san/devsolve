import { type NextRequest } from "next/server";
import { z } from "zod";
import {
  badJson,
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
  validationFailed,
} from "@/lib/api/proxy";
import { URL_MAX_CHARS } from "@/lib/validations/attachment";

const virusTotalUrlSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .max(URL_MAX_CHARS, `URL must be at most ${URL_MAX_CHARS} characters`)
    .refine((val) => {
      try {
        const u = new URL(val);
        return ["http:", "https:"].includes(u.protocol);
      } catch {
        return false;
      }
    }, "URL must be a valid HTTP or HTTPS address"),
});

/**
 * POST /api/virus-total/urls — submit a URL for VirusTotal analysis.
 *
 * Backend: POST /api/v1/virus-total/urls
 * JSON body: { "url": "https://example.com/download" }
 */
export async function POST(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = virusTotalUrlSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const upstream = await upstreamFetch("/virus-total/urls", token, {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "The URL could not be submitted for scanning.");
  } catch {
    return unreachable("security scanning");
  }
}
