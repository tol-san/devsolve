import { type NextRequest } from "next/server";
import * as z from "zod";
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

type Context = { params: Promise<{ problemId: string }> };

const acceptedSolutionSchema = z.object({
  solutionId: z.uuid("Solution id must be a UUID"),
});

export async function PUT(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { problemId: raw } = await context.params;
  const problemId = asUuid(raw);
  if (!problemId) return badRequest("Problem id must be a UUID");

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = acceptedSolutionSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const upstream = await upstreamFetch(
      `/problems/${problemId}/accepted-solutions`,
      token,
      { method: "PUT", body: JSON.stringify(parsed.data) },
    );
    return relay(upstream, "That answer could not be accepted.");
  } catch {
    return unreachable("problem");
  }
}
