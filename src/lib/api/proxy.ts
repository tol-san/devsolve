import { NextResponse, type NextRequest } from "next/server";
import * as z from "zod";
import { auth } from "@/lib/auth/auth";

export const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const PROVIDER_ID = "keycloak";

export async function bearerTokenFor(
  request: NextRequest,
): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }

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

export const unauthorized = () =>
  NextResponse.json({ message: "Not authenticated" }, { status: 401 });

export const forbidden = (message: string) =>
  NextResponse.json({ message }, { status: 403 });

export function subjectOf(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = Buffer.from(payload, "base64url").toString("utf8");
    const sub = (JSON.parse(json) as { sub?: unknown }).sub;
    return typeof sub === "string" && sub ? sub : null;
  } catch {
    return null;
  }
}

export const unreachable = (what: string) =>
  NextResponse.json(
    { message: `Unable to reach the ${what} service. Please try again.` },
    { status: 502 },
  );

export const badJson = () =>
  NextResponse.json(
    { message: "Request body must be valid JSON" },
    { status: 400 },
  );

export const badRequest = (message: string) =>
  NextResponse.json({ message }, { status: 400 });

export const validationFailed = (error: z.ZodError) => {
  const { formErrors, fieldErrors } = z.flattenError(error);
  return NextResponse.json(
    { message: "Validation failed", formErrors, fieldErrors },
    { status: 400 },
  );
};

const uuidSchema = z.uuid();

export function asUuid(value: string | undefined): string | null {
  return value && uuidSchema.safeParse(value).success ? value : null;
}

export function forwardQuery(
  params: URLSearchParams,
  allowed: readonly string[],
  repeatable: readonly string[] = [],
): string {
  const forwarded = new URLSearchParams();
  for (const key of allowed) {
    if (repeatable.includes(key)) {
      for (const value of params.getAll(key)) {
        if (value !== "") forwarded.append(key, value);
      }
      continue;
    }
    const value = params.get(key);
    if (value !== null && value !== "") forwarded.set(key, value);
  }
  const query = forwarded.toString();
  return query ? `?${query}` : "";
}

export async function fileFrom(
  request: NextRequest,
  validate: (file: File) => string | null,
): Promise<{ body: FormData } | { error: NextResponse }> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return { error: badRequest("Request must be multipart/form-data") };
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return { error: badRequest("A `file` part is required") };
  }

  const reason = validate(file);
  if (reason) return { error: badRequest(reason) };

  const body = new FormData();
  body.append("file", file, file.name);
  return { body };
}

export async function relay(upstream: Response, fallbackMessage: string) {
  const raw = await upstream.text();

  let body: unknown = null;
  if (raw) {
    try {
      body = JSON.parse(raw);
    } catch {
      body = { message: raw };
    }
  }

  const headers = new Headers();
  const etag = upstream.headers.get("etag");
  if (etag) {
    headers.set("etag", etag);
    headers.set("Access-Control-Expose-Headers", "ETag");
  }

  if (!upstream.ok) {
    const errorBody =
      body ?? { message: fallbackMessage, status: upstream.status };
    return NextResponse.json(errorBody, {
      status: upstream.status,
      headers,
    });
  }

  if (body === null) return new NextResponse(null, { status: upstream.status, headers });

  return NextResponse.json(body, { status: upstream.status, headers });
}

export function upstreamFetch(
  path: string,
  token: string | null,
  init: RequestInit = {},
) {
  return fetch(`${BACKEND_API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(typeof init.body === "string"
        ? { "Content-Type": "application/json" }
        : {}),
      ...init.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
}
