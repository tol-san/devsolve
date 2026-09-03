import { type NextRequest } from "next/server";
import {
  asUuid,
  badRequest,
  bearerTokenFor,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";
import { getShowcaseFromDb } from "@/lib/server/db";

/**
 * GET /api/admin/showcases/{id} — the full submission under review, steps
 * included. For a revision this is the pending copy rather than what is
 * currently live on the index.
 */

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badRequest("Showcase id must be a UUID");

  try {
    const upstream = await upstreamFetch(`/admin/showcases/${id}`, token);
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
        body ?? { message: "Showcase submission not found" },
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
