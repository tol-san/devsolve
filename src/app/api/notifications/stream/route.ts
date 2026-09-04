import { type NextRequest } from "next/server";
import { BACKEND_API_URL, bearerTokenFor, unauthorized } from "@/lib/api/proxy";

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  try {
    const upstream = await fetch(`${BACKEND_API_URL}/notifications/stream`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
      },
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      return new Response("Failed to connect to notification stream", {
        status: upstream.status,
      });
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch {
    return new Response("Notification stream service unreachable", {
      status: 502,
    });
  }
}
