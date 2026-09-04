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

type Context = { params: Promise<{ showcaseId: string; stepId: string }> };

async function resolveIds(context: Context) {
  const { showcaseId, stepId } = await context.params;
  const showcase = asUuid(showcaseId);
  const step = asUuid(stepId);
  return showcase && step ? { showcase, step } : null;
}

const badIds = () => badRequest("Showcase id and step id must both be UUIDs");

export async function PUT(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const ids = await resolveIds(context);
  if (!ids) return badIds();

  const part = await fileFrom(request, validateImageFile);
  if ("error" in part) return part.error;

  try {
    const upstream = await upstreamFetch(
      `/showcase-steps/${ids.showcase}/${ids.step}/diagram`,
      token,
      { method: "PUT", body: part.body },
    );
    return relay(upstream, "The diagram could not be uploaded.");
  } catch {
    return unreachable("showcase");
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const ids = await resolveIds(context);
  if (!ids) return badIds();

  try {
    const upstream = await upstreamFetch(
      `/showcase-steps/${ids.showcase}/${ids.step}/diagram`,
      token,
      { method: "DELETE" },
    );
    return relay(upstream, "The diagram could not be removed.");
  } catch {
    return unreachable("showcase");
  }
}
