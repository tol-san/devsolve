import { type NextRequest } from "next/server";
import {
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  try {
    const upstream = await upstreamFetch("/admin/auto-approval", token);
    return relay(upstream, "Unable to load auto-approval settings.");
  } catch {
    return unreachable("admin");
  }
}
