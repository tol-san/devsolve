import { type NextRequest } from "next/server";
import {
  badRequest,
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";
import { PROBLEM_STATUSES } from "@/lib/validations/problem";

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const status = request.nextUrl.searchParams.get("status");
  if (
    status &&
    !PROBLEM_STATUSES.includes(status as (typeof PROBLEM_STATUSES)[number])
  ) {
    return badRequest(`status must be one of ${PROBLEM_STATUSES.join(", ")}`);
  }

  const query = forwardQuery(request.nextUrl.searchParams, [
    "status",
    "page",
    "size",
    "sort",
  ]);

  try {
    const upstream = await upstreamFetch(`/admin/problems${query}`, token);
    return relay(upstream, "Unable to load the problem review queue.");
  } catch {
    return unreachable("problem");
  }
}
