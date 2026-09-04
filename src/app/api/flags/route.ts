import { type NextRequest } from "next/server";
import {
  badJson,
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
  validationFailed,
} from "@/lib/api/proxy";
import { flagCreateSchema } from "@/lib/validations/engagement";

export async function POST(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = flagCreateSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const upstream = await upstreamFetch("/flags", token, {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "Your report could not be submitted.");
  } catch {
    return unreachable("flag");
  }
}
