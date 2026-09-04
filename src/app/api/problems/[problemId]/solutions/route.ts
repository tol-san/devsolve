import { type NextRequest } from "next/server";
import {
  asUuid,
  badJson,
  badRequest,
  bearerTokenFor,
  forbidden,
  forwardQuery,
  relay,
  subjectOf,
  unauthorized,
  unreachable,
  upstreamFetch,
  validationFailed,
} from "@/lib/api/proxy";
import { solutionCreateSchema } from "@/lib/validations/solution";

type Context = { params: Promise<{ problemId: string }> };

export async function GET(request: NextRequest, context: Context) {
  const { problemId: raw } = await context.params;
  const problemId = asUuid(raw);
  if (!problemId) return badRequest("Problem id must be a UUID");

  const token = await bearerTokenFor(request);
  const query = forwardQuery(request.nextUrl.searchParams, [
    "pageNumber",
    "pageSize",
  ]);

  try {
    const upstream = await upstreamFetch(
      `/problems/${problemId}/solutions${query}`,
      token,
    );
    return relay(upstream, "Unable to load the answers.");
  } catch {
    return unreachable("problem");
  }
}

export async function POST(request: NextRequest, context: Context) {
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

  const parsed = solutionCreateSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const problemResponse = await upstreamFetch(
      `/problems/${problemId}`,
      token,
    );
    if (!problemResponse.ok) {
      return relay(problemResponse, "That problem could not be found.");
    }

    const problem = (await problemResponse.json()) as {
      author?: { id?: string };
    };
    const caller = subjectOf(token);

    if (caller && problem.author?.id && problem.author.id === caller) {
      return forbidden("You cannot answer your own problem.");
    }

    const upstream = await upstreamFetch(
      `/problems/${problemId}/solutions`,
      token,
      { method: "POST", body: JSON.stringify(parsed.data) },
    );
    return relay(upstream, "Your solution could not be posted.");
  } catch {
    return unreachable("problem");
  }
}
