import { NextResponse, type NextRequest } from "next/server";
import * as z from "zod";
import {
  bearerTokenFor,
  relay,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";
import { CATEGORY_SCOPES } from "@/lib/validations/category";

const scopeParam = z.enum(CATEGORY_SCOPES).optional();

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);

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
    const upstream = await upstreamFetch(`/categories/active${query}`, token);
    return relay(upstream, "Unable to load categories.");
  } catch {
    return unreachable("category");
  }
}
