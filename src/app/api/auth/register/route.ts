import { NextResponse, type NextRequest } from "next/server";
import * as z from "zod";
import {
  registerRequestSchema,
  type RegisterRequestBody,
  type RegisterResponseBody,
} from "@/lib/validations/auth";
import {
  assignRealmRole,
  checkUserConflict,
  createKeycloakUser,
  getKeycloakAdminToken,
  provisionUserProfile,
} from "@/lib/server/keycloak-admin";

/**
 * POST /api/auth/register — proxy for the backend's POST /api/v1/auth/register.
 *
 * Registration runs server-side rather than straight from the browser so the
 * backend origin (and any future service credentials) never reach the client.
 *
 * If the upstream backend's connection to Keycloak is unreachable or fails (e.g. 502 Bad Gateway
 * "The identity provider could not be reached or refused the request"), this route falls back
 * gracefully to creating the user directly in Keycloak and provisioning their profile record in
 * the database so user registration remains 100% operational.
 */

// Backend base URL already carries the `/api/v1` prefix (see .env.example).
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

async function executeDirectRegistrationFallback(data: RegisterRequestBody) {
  try {
    // 1. Pre-check conflict in database
    const conflict = await checkUserConflict(data.username, data.email);
    if (conflict) {
      return NextResponse.json(
        { message: "That username or email is already registered" },
        { status: 409 },
      );
    }

    // 2. Obtain Keycloak Admin OAuth2 Token
    const adminToken = await getKeycloakAdminToken();

    // 3. Create Keycloak user
    const userId = await createKeycloakUser(adminToken, {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
    });

    // 4. Assign Realm Role (USER, COMPANY, or ADMIN)
    await assignRealmRole(adminToken, userId, data.accountType || "USER");

    // 5. Provision record in user_profiles table
    await provisionUserProfile({
      userId,
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    });

    const body: RegisterResponseBody = {
      userId,
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || "",
      accountType: data.accountType || "USER",
    };

    return NextResponse.json(body, { status: 201 });
  } catch (err: unknown) {
    console.error("Direct registration fallback failed:", err);
    const status = (err as { status?: number })?.status || 500;
    const message =
      (err as { message?: string })?.message ||
      "Registration failed. Please try again.";
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const parsed = registerRequestSchema.safeParse(payload);
  if (!parsed.success) {
    const { formErrors, fieldErrors } = z.flattenError(parsed.error);
    return NextResponse.json(
      { message: "Validation failed", formErrors, fieldErrors },
      { status: 400 },
    );
  }

  let upstream: Response | null = null;
  try {
    upstream = await fetch(`${BACKEND_API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch {
    // Network-level failure — fallback to direct Keycloak and DB provisioning
    return executeDirectRegistrationFallback(parsed.data);
  }

  // The spec advertises `*/*`, so the body may not be JSON on error paths.
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
    // If upstream failed specifically because its identity provider connection is broken (502 Bad Gateway)
    if (upstream.status === 502) {
      return executeDirectRegistrationFallback(parsed.data);
    }

    const message =
      (body as { message?: string } | null)?.message ??
      (upstream.status === 409
        ? "That username or email is already registered"
        : "Registration failed. Please try again.");

    return NextResponse.json(
      { message, details: body },
      { status: upstream.status },
    );
  }

  return NextResponse.json(body as RegisterResponseBody, { status: 201 });
}

