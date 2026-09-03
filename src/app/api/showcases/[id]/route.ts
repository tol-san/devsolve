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
import { showcaseUpdateSchema } from "@/lib/validations/showcase";

/**
 * GET/PATCH/DELETE /api/showcases/{id} — proxy for the backend's
 * /api/v1/showcases/{id}.
 *
 * Reading one is public, the way the index is. `DELETE` here is the upstream's
 * hard delete and is unrecoverable; the reversible one is
 * `/api/showcases/{id}/soft-delete`.
 *
 * A `PATCH` on an approved showcase opens a revision upstream rather than
 * editing what is live — see `/api/showcases/{id}/revision`.
 */

type Context = { params: Promise<{ id: string }> };

const badId = () => badRequest("Showcase id must be a UUID");

import { getShowcaseFromDb } from "@/lib/server/db";

export async function GET(request: NextRequest, context: Context) {
  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badId();

  const token = await bearerTokenFor(request);

  try {
    const upstream = await upstreamFetch(`/showcases/${id}`, token);
    const raw = await upstream.text();
    let body: any = null;
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        body = { message: raw };
      }
    }

    if (!upstream.ok || !body?.title) {
      const dbShowcase = await getShowcaseFromDb(id);
      if (dbShowcase) {
        return Response.json(dbShowcase, { status: 200 });
      }
      return Response.json(
        body ?? { message: "Showcase not found" },
        { status: upstream.status }
      );
    }

    return Response.json(body, { status: 200 });
  } catch {
    const dbShowcase = await getShowcaseFromDb(id);
    if (dbShowcase) {
      return Response.json(dbShowcase, { status: 200 });
    }
    return unreachable("showcase");
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badId();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = showcaseUpdateSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  if (Object.keys(parsed.data).length === 0) {
    return badRequest("No updatable fields were provided");
  }

  try {
    const upstream = await upstreamFetch(`/showcases/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "The showcase could not be updated.");
  } catch {
    return unreachable("showcase");
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badId();

  try {
    const upstream = await upstreamFetch(`/showcases/${id}`, token, {
      method: "DELETE",
    });
    return relay(upstream, "The showcase could not be deleted.");
  } catch {
    return unreachable("showcase");
  }
}
