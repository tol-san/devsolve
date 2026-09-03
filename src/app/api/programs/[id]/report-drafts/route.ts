import { NextResponse, type NextRequest } from "next/server";

import {
  bearerTokenFor,
  relay,
  unauthorized,
  upstreamFetch,
} from "@/lib/api/proxy";
import { saveReportDraftSchema } from "@/lib/validations/report-draft";
import { saveDraftSuggestedWeakness } from "@/lib/server/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * `POST /api/programs/{id}/report-drafts` — start a draft against a program.
 *
 * Called once, the first time autosave fires; every save after that is a PUT
 * to the id this returns. The program is in the path because a draft belongs
 * to one, which is also what scopes the resume lookup on return.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ message: "Invalid program id" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const parsed = saveReportDraftSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "The draft could not be saved.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const upstream = await upstreamFetch(`/programs/${id}/report-drafts`, token, {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });

    if (upstream.ok) {
      try {
        const raw = await upstream.clone().text();
        const data = raw ? JSON.parse(raw) : null;
        if (data?.id) {
          const customWeakness = parsed.data.suggestedWeakness ?? null;
          const weaknessId = parsed.data.weaknessId ?? null;
          await saveDraftSuggestedWeakness(data.id, customWeakness, weaknessId);
        }
      } catch {}
    }

    return relay(upstream, "The draft could not be created.");
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the report service. Please try again." },
      { status: 502 },
    );
  }
}
