import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { withOrganizationScope } from "@/lib/api/organization-scope";

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
    { message: "Unable to reach the export service. Please try again." },
    { status: 502 },
  );

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const searchParams = request.nextUrl.searchParams;
  const timeRange = searchParams.get("timeRange");
  const programId = searchParams.get("programId");
  const format = searchParams.get("format") || "csv";

  const queryParams = new URLSearchParams();
  queryParams.set("format", format);
  if (timeRange) queryParams.set("timeRange", timeRange);
  if (programId) queryParams.set("programId", programId);

  const queryString = queryParams.toString();
  const urlPath = `${BACKEND_API_URL}/organizations/me/analytics/export?${queryString}`;
  const targetUrl = withOrganizationScope(request, urlPath);

  try {
    const upstream = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "text/csv, application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!upstream.ok) {
      const raw = await upstream.text();
      let body: unknown = null;
      try {
        body = JSON.parse(raw);
      } catch {
        body = { message: raw };
      }
      const message =
        (body as { message?: string } | null)?.message ??
        "Failed to export analytics CSV.";
      return NextResponse.json(
        { message, details: body },
        { status: upstream.status },
      );
    }

    const contentDisposition =
      upstream.headers.get("Content-Disposition") ||
      'attachment; filename="analytics-export.csv"';
    const contentType =
      upstream.headers.get("Content-Type") || "text/csv; charset=utf-8";

    const csvData = await upstream.arrayBuffer();

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
      },
    });
  } catch {
    return unreachable();
  }
}
