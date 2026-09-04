import { type NextRequest } from "next/server";
import {
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

export async function POST(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  try {
    const upstream = await upstreamFetch("/auth/social/sync", token, {
      method: "POST",
    });
    return relay(upstream, "Unable to finish setting up your account.");
  } catch {
    return unreachable("account setup");
  }
}
