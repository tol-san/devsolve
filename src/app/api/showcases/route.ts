import { type NextRequest } from "next/server";
import {
  badJson,
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
  validationFailed,
} from "@/lib/api/proxy";
import { showcaseCreateSchema } from "@/lib/validations/showcase";

const LIST_PARAMS = [
  "query",
  "categoryId",
  "tag",
  "sort",
  "pageNumber",
  "pageSize",
] as const;

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  const query = forwardQuery(request.nextUrl.searchParams, LIST_PARAMS);

  try {
    const upstream = await upstreamFetch(`/showcases${query}`, token);
    return relay(upstream, "Unable to load showcases.");
  } catch {
    return unreachable("showcase");
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

  const parsed = showcaseCreateSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const upstream = await upstreamFetch("/showcases", token, {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "The showcase could not be created.");
  } catch {
    return unreachable("showcase");
  }
}
