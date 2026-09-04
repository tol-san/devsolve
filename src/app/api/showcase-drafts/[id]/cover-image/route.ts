import { type NextRequest } from "next/server";
import {
  asUuid,
  badRequest,
  bearerTokenFor,
  fileFrom,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";
import { validateImageFile } from "@/lib/validations/showcase";

type Context = { params: Promise<{ id: string }> };

const badId = () => badRequest("Showcase draft id must be a UUID");

export async function PUT(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badId();

  const part = await fileFrom(request, validateImageFile);
  if ("error" in part) return part.error;

  try {
    const upstream = await upstreamFetch(`/showcase-drafts/${id}/cover-image`, token, {
      method: "PUT",
      body: part.body,
    });
    return relay(upstream, "The cover image could not be uploaded.");
  } catch {
    return unreachable("showcase draft");
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badId();

  try {
    const upstream = await upstreamFetch(`/showcase-drafts/${id}/cover-image`, token, {
      method: "DELETE",
    });
    return relay(upstream, "The cover image could not be removed.");
  } catch {
    return unreachable("showcase draft");
  }
}
