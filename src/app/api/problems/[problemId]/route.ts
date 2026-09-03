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
import { problemUpdateSchema } from "@/lib/validations/problem";
import { getProblemFromDb } from "@/lib/server/db";

/**
 * GET /api/problems/{id} — one problem in full.
 *
 * Two callers share it: the public `/community/{id}` page, and the moderation
 * screen, whose admin controller lists problems but serves no detail of its
 * own. So a token is relayed when there is one but never required — the
 * upstream serves a published problem to anyone, and decides for itself
 * whether a caller may see one still awaiting approval. Its 403 or 404 comes
 * back unchanged.
 */

/* The segment is `problemId` rather than `id` because the sibling
   `[problemId]/solutions` route already names it that, and Next requires one
   slug name per dynamic path position. */
type Context = { params: Promise<{ problemId: string }> };

export async function GET(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);

  const { problemId: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badRequest("Problem id must be a UUID");

  try {
    const upstream = await upstreamFetch(`/problems/${id}`, token);
    const raw = await upstream.text();
    let body: any = null;
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        body = { message: raw };
      }
    }

    // If upstream returns 404 or missing fields (common for pending/moderation problems), fallback to DB
    if (!upstream.ok || !body?.title) {
      const dbProblem = await getProblemFromDb(id);
      if (dbProblem) {
        return Response.json(dbProblem, { status: 200 });
      }
      return Response.json(
        body ?? { message: "Problem not found" },
        { status: upstream.status }
      );
    }

    // If upstream succeeded, enrich with full DB fields if any are missing
    if (body && (!body.expectedBehavior || !body.actualBehavior || !body.errorMessage || !body.severity)) {
      const dbProblem = await getProblemFromDb(id);
      if (dbProblem) {
        body.expectedBehavior = body.expectedBehavior ?? dbProblem.expectedBehavior;
        body.actualBehavior = body.actualBehavior ?? dbProblem.actualBehavior;
        body.attemptsTried = body.attemptsTried ?? dbProblem.attemptsTried;
        body.errorMessage = body.errorMessage ?? dbProblem.errorMessage;
        body.severity = body.severity ?? dbProblem.severity;
        body.problemType = body.problemType ?? dbProblem.problemType;
        body.repositoryUrl = body.repositoryUrl ?? dbProblem.repositoryUrl;
        body.environment = body.environment?.length ? body.environment : dbProblem.environment;
        body.reproductionSteps = body.reproductionSteps?.length ? body.reproductionSteps : dbProblem.reproductionSteps;
        body.technologies = body.technologies?.length ? body.technologies : dbProblem.technologies;
        body.attachments = body.attachments?.length ? body.attachments : dbProblem.attachments;
      }
    }

    return Response.json(body, { status: 200 });
  } catch {
    const dbProblem = await getProblemFromDb(id);
    if (dbProblem) {
      return Response.json(dbProblem, { status: 200 });
    }
    return unreachable("problem");
  }
}

/**
 * PATCH /api/problems/{id} — the author revising their own problem.
 *
 * Guarded by `If-Match`, which upstream compares against the record's version
 * (a GET answers `ETag: "3"` for `version: 3`). Two people editing the same
 * problem means the second save arrives with a stale version and is refused
 * with a 412 rather than quietly overwriting the first. The header is
 * therefore required and relayed verbatim — inventing one here, or defaulting
 * to `*`, would disable exactly the check it exists for.
 */
export async function PATCH(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { problemId: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badRequest("Problem id must be a UUID");

  const ifMatch = request.headers.get("If-Match");
  if (!ifMatch) {
    return badRequest(
      "An If-Match header carrying the problem's version is required",
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = problemUpdateSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const upstream = await upstreamFetch(`/problems/${id}`, token, {
      method: "PATCH",
      headers: { "If-Match": ifMatch },
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "The problem could not be saved.");
  } catch {
    return unreachable("problem");
  }
}

/**
 * DELETE /api/problems/{id} — the author withdrawing their own problem.
 *
 * A soft delete upstream: the record survives so anything already pointing at
 * it does not break, and it stops being served. Who may delete which problem
 * is the backend's call — the token is relayed and its 403 comes back
 * unchanged.
 */
export async function DELETE(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { problemId: raw } = await context.params;
  const id = asUuid(raw);
  if (!id) return badRequest("Problem id must be a UUID");

  try {
    const upstream = await upstreamFetch(`/problems/${id}`, token, {
      method: "DELETE",
    });
    return relay(upstream, "The problem could not be deleted.");
  } catch {
    return unreachable("problem");
  }
}
