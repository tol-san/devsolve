import { NextResponse, type NextRequest } from "next/server";
import {
  badRequest,
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";
import { SHOWCASE_REVIEW_STATUSES } from "@/lib/validations/showcase";

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const status = request.nextUrl.searchParams.get("reviewStatus");
  if (
    status &&
    status !== "ALL" &&
    !SHOWCASE_REVIEW_STATUSES.includes(
      status as (typeof SHOWCASE_REVIEW_STATUSES)[number],
    )
  ) {
    return badRequest(
      `reviewStatus must be one of ${SHOWCASE_REVIEW_STATUSES.join(", ")}`,
    );
  }

  // When a specific review status is requested (PENDING, APPROVED, or REJECTED), proxy directly upstream
  if (status && status !== "ALL") {
    const query = forwardQuery(request.nextUrl.searchParams, [
      "reviewStatus",
      "pageNumber",
      "pageSize",
    ]);

    try {
      const upstream = await upstreamFetch(`/admin/showcases${query}`, token);
      return relay(upstream, "Unable to load the showcase review queue.");
    } catch {
      return unreachable("showcase");
    }
  }

  // When reviewStatus is omitted or "ALL", the upstream backend defaults to PENDING.
  // Query all three review statuses in parallel and combine:
  const pageNumber = Math.max(
    0,
    Number(request.nextUrl.searchParams.get("pageNumber")) || 0,
  );
  const pageSize = Math.min(
    100,
    Math.max(1, Number(request.nextUrl.searchParams.get("pageSize")) || 10),
  );

  try {
    const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
      upstreamFetch(
        `/admin/showcases?reviewStatus=PENDING&pageNumber=0&pageSize=100`,
        token,
      ),
      upstreamFetch(
        `/admin/showcases?reviewStatus=APPROVED&pageNumber=0&pageSize=100`,
        token,
      ),
      upstreamFetch(
        `/admin/showcases?reviewStatus=REJECTED&pageNumber=0&pageSize=100`,
        token,
      ),
    ]);

    if (!pendingRes.ok && !approvedRes.ok && !rejectedRes.ok) {
      return relay(pendingRes, "Unable to load the showcase review queue.");
    }

    const [pendingJson, approvedJson, rejectedJson] = await Promise.all([
      pendingRes.ok ? pendingRes.json() : { content: [], totalElements: 0 },
      approvedRes.ok ? approvedRes.json() : { content: [], totalElements: 0 },
      rejectedRes.ok ? rejectedRes.json() : { content: [], totalElements: 0 },
    ]);

    const pendingItems: Array<Record<string, unknown>> = Array.isArray(pendingJson)
      ? pendingJson
      : (pendingJson.content ?? []);
    const approvedItems: Array<Record<string, unknown>> = Array.isArray(approvedJson)
      ? approvedJson
      : (approvedJson.content ?? []);
    const rejectedItems: Array<Record<string, unknown>> = Array.isArray(rejectedJson)
      ? rejectedJson
      : (rejectedJson.content ?? []);

    const allItems = [...pendingItems, ...approvedItems, ...rejectedItems];

    // Sort by submittedAt descending (newest first)
    allItems.sort((a, b) => {
      const timeA = typeof a.submittedAt === "string" ? new Date(a.submittedAt).getTime() : 0;
      const timeB = typeof b.submittedAt === "string" ? new Date(b.submittedAt).getTime() : 0;
      return timeB - timeA;
    });

    const totalElements =
      (typeof pendingJson.totalElements === "number" ? pendingJson.totalElements : pendingItems.length) +
      (typeof approvedJson.totalElements === "number" ? approvedJson.totalElements : approvedItems.length) +
      (typeof rejectedJson.totalElements === "number" ? rejectedJson.totalElements : rejectedItems.length);

    const startIndex = pageNumber * pageSize;
    const pagedContent = allItems.slice(startIndex, startIndex + pageSize);
    const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

    return NextResponse.json({
      content: pagedContent,
      totalElements,
      totalPages,
      number: pageNumber,
      size: pageSize,
      numberOfElements: pagedContent.length,
      first: pageNumber === 0,
      last: startIndex + pageSize >= totalElements,
      empty: totalElements === 0,
    });
  } catch {
    return unreachable("showcase");
  }
}
