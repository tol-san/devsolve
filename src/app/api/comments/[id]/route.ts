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
import { commentUpdateSchema } from "@/lib/validations/engagement";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);

  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badRequest("Comment id must be a UUID");

  try {
    const upstream = await upstreamFetch(`/comments/${id}`, token);
    return relay(upstream, "Unable to load that comment.");
  } catch {
    return unreachable("comment");
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badRequest("Comment id must be a UUID");

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = commentUpdateSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const upstream = await upstreamFetch(`/comments/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "Your comment could not be saved.");
  } catch {
    return unreachable("comment");
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badRequest("Comment id must be a UUID");

  try {
    const upstream = await upstreamFetch(`/comments/${id}`, token, {
      method: "DELETE",
    });
    return relay(upstream, "Your comment could not be deleted.");
  } catch {
    return unreachable("comment");
  }
}
