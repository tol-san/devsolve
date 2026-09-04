import { type NextRequest } from "next/server";
import {
  asUuid,
  badRequest,
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

type Context = { params: Promise<{ problemId: string; solutionId: string }> };

export async function DELETE(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { problemId: rawProblem, solutionId: rawSolution } =
    await context.params;

  const problemId = asUuid(rawProblem);
  if (!problemId) return badRequest("Problem id must be a UUID");

  const solutionId = asUuid(rawSolution);
  if (!solutionId) return badRequest("Solution id must be a UUID");

  try {
    const upstream = await upstreamFetch(
      `/problems/${problemId}/accepted-solutions/${solutionId}`,
      token,
      { method: "DELETE" },
    );
    return relay(upstream, "That answer could not be unaccepted.");
  } catch {
    return unreachable("problem");
  }
}
