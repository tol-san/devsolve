import { NextResponse, type NextRequest } from "next/server";
import * as z from "zod";
import { registerCompanyRequestSchema } from "@/lib/validations/auth";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  const parsed = registerCompanyRequestSchema.safeParse(payload);
  if (!parsed.success) {
    const { formErrors, fieldErrors } = z.flattenError(parsed.error);
    return NextResponse.json(
      { message: "Validation failed", formErrors, fieldErrors },
      { status: 400 }
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_API_URL}/organizations/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the company registration service. Please try again." },
      { status: 502 }
    );
  }

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
      (upstream.status === 409
        ? "An organization with that email or name already exists"
        : "Company registration failed. Please try again.");

    const payload =
      typeof body === "object" && body !== null
        ? { message, ...body }
        : { message, details: body };

    return NextResponse.json(payload, { status: upstream.status });
  }

  return NextResponse.json(body, { status: 201 });
}
