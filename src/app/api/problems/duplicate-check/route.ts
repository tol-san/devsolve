import { type NextRequest } from "next/server";
import * as z from "zod";
import {
  badJson,
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
  validationFailed,
} from "@/lib/api/proxy";

const duplicateCheckSchema = z.object({
  title: z.string().min(1).max(180),
  description: z.string().max(20000).optional(),
  errorMessage: z.string().max(10000).optional(),
  excludeId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = duplicateCheckSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const upstream = await upstreamFetch("/problems/duplicate-check", token, {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "Unable to perform duplicate check.");
  } catch {
    return unreachable("duplicate check");
  }
}
