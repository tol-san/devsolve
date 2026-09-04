import { type NextRequest } from "next/server";
import {
  bearerTokenFor,
  relay,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);

  try {
    const upstream = await upstreamFetch("/hacktivity/stats", token);
    return relay(upstream, "Unable to load the hacktivity totals.");
  } catch {
    return unreachable("hacktivity");
  }
}
