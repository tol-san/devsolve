import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const PROVIDER_ID = "keycloak";

async function bearerTokenFor(request: NextRequest): Promise<string | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return null;

  try {
    const { accessToken } = await auth.api.getAccessToken({
      body: { providerId: PROVIDER_ID },
      headers: request.headers,
    });
    return accessToken ?? null;
  } catch {
    return null;
  }
}

const unauthorized = () =>
  NextResponse.json({ message: "Not authenticated" }, { status: 401 });

const unreachable = () =>
  NextResponse.json(
    { message: "Unable to reach the solution service. Please try again." },
    { status: 502 }
  );

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("reviewStatus");

  // When a specific review status is requested (PENDING, APPROVED, REJECTED), query directly
  if (status && status !== "ALL") {
    const queryString = searchParams.toString();
    const targetUrl = `${BACKEND_API_URL}/admin/solutions${
      queryString ? `?${queryString}` : ""
    }`;

    try {
      const upstream = await fetch(targetUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const raw = await upstream.text();
      let body: unknown = null;
      if (raw) {
        try {
          body = JSON.parse(raw);
        } catch {
          body = { message: raw };
        }
      }

      if (!upstream.ok) {
        const message =
          (body as { message?: string } | null)?.message ??
          "Failed to fetch solutions review queue.";
        return NextResponse.json(
          { message, details: body },
          { status: upstream.status }
        );
      }

      return NextResponse.json(body, { status: upstream.status });
    } catch {
      return unreachable();
    }
  }

  // When reviewStatus is omitted or "ALL", query PENDING, APPROVED, and REJECTED in parallel:
  const pageNumber = Math.max(0, Number(searchParams.get("pageNumber")) || 0);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 10));

  try {
    const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
      fetch(`${BACKEND_API_URL}/admin/solutions?reviewStatus=PENDING&pageNumber=0&pageSize=100`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch(`${BACKEND_API_URL}/admin/solutions?reviewStatus=APPROVED&pageNumber=0&pageSize=100`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch(`${BACKEND_API_URL}/admin/solutions?reviewStatus=REJECTED&pageNumber=0&pageSize=100`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
    ]);

    if (!pendingRes.ok && !approvedRes.ok && !rejectedRes.ok) {
      return unreachable();
    }

    const [pendingJson, approvedJson, rejectedJson] = await Promise.all([
      pendingRes.ok ? pendingRes.json() : { content: [], totalElements: 0 },
      approvedRes.ok ? approvedRes.json() : { content: [], totalElements: 0 },
      rejectedRes.ok ? rejectedRes.json() : { content: [], totalElements: 0 },
    ]);

    const pendingItems: Array<Record<string, unknown>> = Array.isArray(pendingJson) ? pendingJson : (pendingJson.content ?? []);
    const approvedItems: Array<Record<string, unknown>> = Array.isArray(approvedJson) ? approvedJson : (approvedJson.content ?? []);
    const rejectedItems: Array<Record<string, unknown>> = Array.isArray(rejectedJson) ? rejectedJson : (rejectedJson.content ?? []);

    const allItems = [...pendingItems, ...approvedItems, ...rejectedItems];

    // Sort by submittedAt / createdAt descending (newest first)
    allItems.sort((a, b) => {
      const dateA = a.submittedAt || a.createdAt;
      const dateB = b.submittedAt || b.createdAt;
      const timeA = typeof dateA === "string" ? new Date(dateA).getTime() : 0;
      const timeB = typeof dateB === "string" ? new Date(dateB).getTime() : 0;
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
    return unreachable();
  }
}
