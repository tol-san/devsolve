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
import { showcaseStepCreateSchema } from "@/lib/validations/showcase";

type Context = { params: Promise<{ showcaseId: string }> };

const badId = () => badRequest("Showcase id must be a UUID");

export async function GET(request: NextRequest, context: Context) {
  const { showcaseId: raw } = await context.params;
  const showcaseId = asUuid(raw);
  if (!showcaseId) return badId();

  const token = await bearerTokenFor(request);

  try {
    const upstream = await upstreamFetch(`/showcase-steps/${showcaseId}`, token);
    return relay(upstream, "Unable to load the build guide.");
  } catch {
    return unreachable("showcase");
  }
}

export async function POST(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { showcaseId: raw } = await context.params;
  const showcaseId = asUuid(raw);
  if (!showcaseId) return badId();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = showcaseStepCreateSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const upstream = await upstreamFetch(`/showcase-steps/${showcaseId}`, token, {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "The step could not be saved.");
  } catch {
    return unreachable("showcase");
  }
}
