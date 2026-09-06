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
import { PROBLEM_STATUSES } from "@/lib/validations/problem";

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const status = request.nextUrl.searchParams.get("status");
  if (
    status &&
    status !== "ALL" &&
    !PROBLEM_STATUSES.includes(status as (typeof PROBLEM_STATUSES)[number])
  ) {
    return badRequest(`status must be one of ${PROBLEM_STATUSES.join(", ")}`);
  }

  // When a specific status is requested, forward directly upstream
  if (status && status !== "ALL") {
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

  // When status is omitted or "ALL", query PENDING_APPROVAL, PUBLISHED, and REJECTED in parallel:
  const page = Math.max(
    0,
    Number(request.nextUrl.searchParams.get("page")) || 0,
  );
  const size = Math.min(
    100,
    Math.max(1, Number(request.nextUrl.searchParams.get("size")) || 10),
  );
  const sort = request.nextUrl.searchParams.get("sort") || "createdAt,DESC";

  try {
    const [pendingRes, publishedRes, rejectedRes] = await Promise.all([
      upstreamFetch(
        `/admin/problems?status=PENDING_APPROVAL&page=0&size=100&sort=${encodeURIComponent(sort)}`,
        token,
      ),
      upstreamFetch(
        `/admin/problems?status=PUBLISHED&page=0&size=100&sort=${encodeURIComponent(sort)}`,
        token,
      ),
      upstreamFetch(
        `/admin/problems?status=REJECTED&page=0&size=100&sort=${encodeURIComponent(sort)}`,
        token,
      ),
    ]);

    if (!pendingRes.ok && !publishedRes.ok && !rejectedRes.ok) {
      return relay(pendingRes, "Unable to load the problem review queue.");
    }

    const [pendingJson, publishedJson, rejectedJson] = await Promise.all([
      pendingRes.ok ? pendingRes.json() : { content: [], totalElements: 0 },
      publishedRes.ok ? publishedRes.json() : { content: [], totalElements: 0 },
      rejectedRes.ok ? rejectedRes.json() : { content: [], totalElements: 0 },
    ]);

    const pendingItems: Array<Record<string, unknown>> = Array.isArray(pendingJson)
      ? pendingJson
      : (pendingJson.content ?? []);
    const publishedItems: Array<Record<string, unknown>> = Array.isArray(publishedJson)
      ? publishedJson
      : (publishedJson.content ?? []);
    const rejectedItems: Array<Record<string, unknown>> = Array.isArray(rejectedJson)
      ? rejectedJson
      : (rejectedJson.content ?? []);

    const allItems = [...pendingItems, ...publishedItems, ...rejectedItems];

    const isAsc = sort.toLowerCase().includes("asc");
    allItems.sort((a, b) => {
      const timeA = typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : 0;
      const timeB = typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : 0;
      return isAsc ? timeA - timeB : timeB - timeA;
    });

    const totalElements =
      (typeof pendingJson.totalElements === "number" ? pendingJson.totalElements : pendingItems.length) +
      (typeof publishedJson.totalElements === "number" ? publishedJson.totalElements : publishedItems.length) +
      (typeof rejectedJson.totalElements === "number" ? rejectedJson.totalElements : rejectedItems.length);

    const startIndex = page * size;
    const pagedContent = allItems.slice(startIndex, startIndex + size);
    const totalPages = Math.max(1, Math.ceil(totalElements / size));

    return NextResponse.json({
      content: pagedContent,
      totalElements,
      totalPages,
      number: page,
      size,
      numberOfElements: pagedContent.length,
      first: page === 0,
      last: startIndex + size >= totalElements,
      empty: totalElements === 0,
    });
  } catch {
    return unreachable("problem");
  }
}
