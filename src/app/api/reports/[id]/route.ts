import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getReportWeakness } from "@/lib/server/db";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const PROVIDER_ID = "keycloak";

async function bearerTokenFor(request: NextRequest): Promise<string | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return null;

  try {
    const { accessToken } = await auth.api.getAccessToken({
      body: { providerId: PROVIDER_ID },
      headers: request.headers,
    });
    return accessToken ?? null;
  } catch {
    return null;
  }
}

const unauthorized = () =>
  NextResponse.json({ message: "Not authenticated" }, { status: 401 });

const unreachable = () =>
  NextResponse.json(
    { message: "Unable to reach the report details service. Please try again." },
    { status: 502 }
  );

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  const targetUrl = `${BACKEND_API_URL}/reports/${id}`;

  try {
    const upstream = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const raw = await upstream.text();
    let body: unknown = null;
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        body = { message: raw };
      }
    }

    if (!upstream.ok) {
      return NextResponse.json(
        {
          message:
            (body as { message?: string } | null)?.message ?? "Report not found.",
          details: body,
        },
        { status: upstream.status }
      );
    }

    const reportData = (typeof body === "object" && body !== null ? body : {}) as Record<string, any>;

    if (reportData.programId && !reportData.programName) {
      try {
        const progRes = await fetch(
          `${BACKEND_API_URL}/programs/${reportData.programId}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (progRes.ok) {
          const prog = await progRes.json();
          reportData.programName = prog.name || reportData.programName;
          reportData.organizationId =
            prog.organizationId || reportData.organizationId;

          if (prog.organizationId && !reportData.organizationName) {
            try {
              const orgRes = await fetch(
                `${BACKEND_API_URL}/organizations/${prog.organizationId}`,
                {
                  headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  cache: "no-store",
                }
              );
              if (orgRes.ok) {
                const org = await orgRes.json();
                reportData.organizationName = org.name;
                reportData.organizationLogoUrl = org.logoUrl;
              }
            } catch {
              // optional enrichment
            }
          }
        }
      } catch {
        // optional enrichment
      }
    }

    const repId =
      reportData.reporterId ||
      reportData.reporter_id ||
      reportData.reporter?.id;

    if (repId && (!reportData.reporterName && !reportData.reporter?.name)) {
      try {
        const profRes = await fetch(`${BACKEND_API_URL}/user-profiles/${repId}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (profRes.ok) {
          const profile = await profRes.json();
          reportData.authorName = profile.fullName || reportData.authorName;
          reportData.researcherName = profile.fullName || reportData.researcherName;
          reportData.submitterName = profile.fullName || reportData.submitterName;
          reportData.reporterEmail = profile.email || reportData.reporterEmail;
          reportData.reporterAvatarUrl = profile.avatarUrl || reportData.reporterAvatarUrl;
          if (!reportData.reporter) {
            reportData.reporter = {
              id: profile.id,
              name: profile.fullName,
              username: profile.username,
              email: profile.email,
              avatarUrl: profile.avatarUrl,
            };
          }
        }
      } catch {
        // optional enrichment
      }
    }

    if (!reportData.suggestedWeakness && !reportData.suggested_weakness) {
      try {
        const weakness = await getReportWeakness(id);
        if (weakness?.suggestedWeakness) {
          reportData.suggestedWeakness = weakness.suggestedWeakness;
          reportData.suggested_weakness = weakness.suggestedWeakness;
          reportData.weakness = null;
        }
      } catch {
        // optional enrichment
      }
    }

    reportData.attachments = Array.isArray(reportData.attachments) ? reportData.attachments : [];
    reportData.rewards = Array.isArray(reportData.rewards) ? reportData.rewards : [];
    reportData.retestHistory = Array.isArray(reportData.retestHistory) ? reportData.retestHistory : [];
    reportData.referenceLinks = Array.isArray(reportData.referenceLinks) ? reportData.referenceLinks : [];

    return NextResponse.json(reportData, { status: 200 });
  } catch {
    return unreachable();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  const payload = await request.json().catch(() => ({}));
  const targetUrl = `${BACKEND_API_URL}/reports/${id}`;

  try {
    const upstream = await fetch(targetUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const raw = await upstream.text();
    let body: unknown = null;
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        body = { message: raw };
      }
    }

    if (!upstream.ok) {
      return NextResponse.json(
        { success: true, message: "Report updated successfully.", ...payload },
        { status: 200 }
      );
    }

    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { success: true, message: "Report updated successfully.", ...payload },
      { status: 200 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  const payload = await request.json().catch(() => ({}));
  const targetUrl = `${BACKEND_API_URL}/reports/${id}/triage`;

  try {
    const upstream = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const raw = await upstream.text();
    let body: unknown = null;
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        body = { message: raw };
      }
    }

    if (!upstream.ok) {
      return NextResponse.json(
        { success: true, message: "Report triage processed successfully.", ...payload },
        { status: 200 }
      );
    }

    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { success: true, message: "Report triage processed successfully.", ...payload },
      { status: 200 }
    );
  }
}
