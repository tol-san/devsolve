import { type NextRequest } from "next/server";
import {
  badJson,
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  try {
    const upstream = await upstreamFetch("/notifications/preferences", token);
    return relay(upstream, "Unable to load notification preferences.");
  } catch {
    return unreachable("notification preferences");
  }
}

export async function PUT(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  try {
    const upstream = await upstreamFetch("/notifications/preferences", token, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return relay(upstream, "Unable to update notification preferences.");
  } catch {
    return unreachable("notification preferences");
  }
}
