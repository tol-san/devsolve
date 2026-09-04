import { type NextRequest } from "next/server";
import {
  asUuid,
  badJson,
  badRequest,
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
  validationFailed,
} from "@/lib/api/proxy";
import { solutionUpdateSchema } from "@/lib/validations/solution";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);

  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badRequest("Solution id must be a UUID");

  try {
    const upstream = await upstreamFetch(`/solutions/${id}`, token);
    return relay(upstream, "Unable to load that solution.");
  } catch {
    return unreachable("solution");
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badRequest("Solution id must be a UUID");

  const ifMatch =
    request.headers.get("x-if-match") || request.headers.get("if-match");
  if (!ifMatch) {
    return badRequest(
      "An If-Match header carrying the solution's version is required",
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = solutionUpdateSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const upstream = await upstreamFetch(`/solutions/${id}`, token, {
      method: "PATCH",
      headers: { "If-Match": ifMatch },
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "The solution could not be saved.");
  } catch {
    return unreachable("solution");
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badRequest("Solution id must be a UUID");

  try {
    const upstream = await upstreamFetch(`/solutions/${id}`, token, {
      method: "DELETE",
    });
    return relay(upstream, "The solution could not be deleted.");
  } catch {
    return unreachable("solution");
  }
}
