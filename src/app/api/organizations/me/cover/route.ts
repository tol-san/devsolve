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
 * PUT/DELETE /api/organizations/me/cover — proxy for the backend's
 * /api/v1/organizations/me/cover.
 */

export async function PUT(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const file = await fileFrom(request, validateCoverImageFile);
  if ("error" in file) return file.error;

  try {
    const upstream = await upstreamFetch("/organizations/me/cover", token, {
      method: "PUT",
      body: file.body,
    });
    return relay(upstream, "The organization cover photo could not be uploaded.");
  } catch {
    return unreachable("organization");
  }
}

export async function DELETE(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  try {
    const upstream = await upstreamFetch("/organizations/me/cover", token, {
      method: "DELETE",
    });
    return relay(upstream, "The organization cover photo could not be removed.");
  } catch {
    return unreachable("organization");
  }
}
