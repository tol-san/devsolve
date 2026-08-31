import type { NextRequest } from "next/server";
import {
  bearerTokenFor,
  fileFrom,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";
import { validateCoverImageFile } from "@/lib/validations/cover-image";

/**
 * PUT/DELETE /api/user-profiles/me/cover — proxy for the backend's
 * /api/v1/user-profiles/me/cover.
 */

export async function PUT(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const file = await fileFrom(request, validateCoverImageFile);
  if ("error" in file) return file.error;

  try {
    const upstream = await upstreamFetch("/user-profiles/me/cover", token, {
      method: "PUT",
      body: file.body,
    });
    return relay(upstream, "Your cover photo could not be uploaded.");
  } catch {
    return unreachable("profile");
  }
}

export async function DELETE(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  try {
    const upstream = await upstreamFetch("/user-profiles/me/cover", token, {
      method: "DELETE",
    });
    return relay(upstream, "Your cover photo could not be removed.");
  } catch {
    return unreachable("profile");
  }
}
