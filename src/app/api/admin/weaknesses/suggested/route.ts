import { type NextRequest } from "next/server";
import {
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  // Strictly forward page and size. Never forward `sort` as it causes 400.
  const query = forwardQuery(request.nextUrl.searchParams, ["page", "size"]);

  try {
    const upstream = await upstreamFetch(
      `/admin/weaknesses/suggested${query}`,
      token,
    );
    return relay(upstream, "Unable to load suggested weaknesses.");
  } catch {
    return unreachable("suggested weaknesses");
  }
}
