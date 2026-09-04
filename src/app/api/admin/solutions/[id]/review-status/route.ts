import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const PROVIDER_ID = "keycloak";

const reviewStatusSchema = z.object({
  reviewStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  rejectionReason: z
    .string()
    .max(2000, "A rejection reason must not exceed 2000 characters")
    .optional(),
});

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;

  let payload: unknown = null;
  try {
    const text = await request.text();
    if (text) {
      payload = JSON.parse(text);
    }
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  const parsed = reviewStatusSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation error", errors: parsed.error.format() },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(
      `${BACKEND_API_URL}/admin/solutions/${id}/review-status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(parsed.data),
        cache: "no-store",
      }
    );

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
        "Failed to update solution review status.";
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
