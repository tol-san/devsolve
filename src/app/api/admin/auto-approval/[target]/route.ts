import { type NextRequest } from "next/server";
import { z } from "zod";
import {
  badJson,
  badRequest,
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
  validationFailed,
} from "@/lib/api/proxy";

type Context = { params: Promise<{ target: string }> };

const patchAutoApprovalSchema = z.object({
  enabled: z.boolean(),
});

/**
 * PATCH /api/admin/auto-approval/{target} — update the auto-approval switch for a kind.
 *
 * `{target}` must be strictly "PROBLEM" or "SHOWCASE" (uppercase, case-sensitive).
 * Lowercase returns 400 upstream, so we do not normalize it.
 */
export async function PATCH(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { target } = await context.params;
  if (target !== "PROBLEM" && target !== "SHOWCASE") {
    return badRequest("Target must be 'PROBLEM' or 'SHOWCASE' (uppercase, case-sensitive)");
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = patchAutoApprovalSchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  try {
    const upstream = await upstreamFetch(
      `/admin/auto-approval/${target}`,
      token,
      {
        method: "PATCH",
        body: JSON.stringify(parsed.data),
      },
    );
    return relay(upstream, "Unable to update auto-approval setting.");
  } catch {
    return unreachable("admin");
  }
}
