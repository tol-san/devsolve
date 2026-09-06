import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  asUuid,
  badJson,
  badRequest,
  bearerTokenFor,
  forwardQuery,
  relay,
  unauthorized,
  upstreamFetch,
  validationFailed,
} from "@/lib/api/proxy";

const ALLOWED_QUERY = ["status", "page", "size", "sort"] as const;

const inviteSchema = z.object({
  userId: z.string().uuid("A valid researcher user ID is required"),
  note: z
    .string()
    .max(2000, "Invitation note cannot exceed 2000 characters")
    .optional()
    .nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  const programId = asUuid(id);
  if (!programId) {
    return badRequest("Invalid program ID");
  }

  const queryParams = new URLSearchParams(request.nextUrl.searchParams);
  const status = queryParams.get("status");
  if (status === "ALL") {
    queryParams.delete("status");
  }

  const query = forwardQuery(queryParams, ALLOWED_QUERY);

  try {
    const upstream = await upstreamFetch(
      `/programs/${programId}/invitations${query}`,
      token,
    );
    return relay(upstream, "Unable to load program invitations.");
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the program service. Please try again." },
      { status: 502 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  const programId = asUuid(id);
  if (!programId) {
    return badRequest("Invalid program ID");
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return badJson();
  }

  const parsed = inviteSchema.safeParse(json);
  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  const payload = {
    userId: parsed.data.userId,
    note: parsed.data.note?.trim() ? parsed.data.note.trim() : null,
  };

  try {
    const upstream = await upstreamFetch(
      `/programs/${programId}/invitations`,
      token,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    return relay(upstream, "Unable to send invitation.");
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the program service. Please try again." },
      { status: 502 },
    );
  }
}
