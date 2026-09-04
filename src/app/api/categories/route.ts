import { NextResponse, type NextRequest } from "next/server";
import * as z from "zod";
import {
  badJson,
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";
import {
  CATEGORY_SCOPES,
  categoryCreateSchema,
} from "@/lib/validations/category";

const scopeParam = z.enum(CATEGORY_SCOPES).optional();

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const raw = request.nextUrl.searchParams.get("scope") ?? undefined;
  const scope = scopeParam.safeParse(raw);
  if (!scope.success) {
    return NextResponse.json(
      { message: `scope must be one of ${CATEGORY_SCOPES.join(", ")}` },
      { status: 400 },
    );
  }

  const query = scope.data ? `?scope=${scope.data}` : "";

  try {
    const upstream = await upstreamFetch(`/categories${query}`, token);
    return relay(upstream, "Unable to load categories.");
  } catch {
    return unreachable("category");
  }
}

export async function POST(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = categoryCreateSchema.safeParse(payload);
  if (!parsed.success) {
    const { formErrors, fieldErrors } = z.flattenError(parsed.error);
    return NextResponse.json(
      { message: "Validation failed", formErrors, fieldErrors },
      { status: 400 },
    );
  }

  try {
    const upstream = await upstreamFetch("/categories", token, {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "The category could not be created.");
  } catch {
    return unreachable("category");
  }
}
