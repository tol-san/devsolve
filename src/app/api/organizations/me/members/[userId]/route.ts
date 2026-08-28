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
    { message: "Unable to reach the organization service. Please try again." },
    { status: 502 }
  );

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { userId } = await params;
  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(
      withOrganizationScope(
        request,
        `${BACKEND_API_URL}/organizations/me/members/${userId}`,
      ),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!upstream.ok) {
      const raw = await upstream.text();
      let body: unknown = null;
      if (raw) {
        try {
          body = JSON.parse(raw);
        } catch {
          body = { message: raw };
        }
      }
      const message =
        (body as { message?: string } | null)?.message ??
        "Failed to remove member.";
      return NextResponse.json(
        { message, details: body },
        { status: upstream.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return unreachable();
  }
}
