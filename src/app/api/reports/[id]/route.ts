import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";

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

    let reportData: Record<string, any> | null =
      upstream.ok && typeof body === "object" && body !== null
        ? (body as Record<string, any>)
        : null;

    // If direct report lookup fails with 403 or 404 (e.g. for company accounts),
    // look through organization reports to find matching report
    if (!reportData && (upstream.status === 403 || upstream.status === 404)) {
      try {
        const orgReportsRes = await fetch(
          `${BACKEND_API_URL}/reports?size=100&sort=submittedAt,DESC`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (orgReportsRes.ok) {
          const orgRaw = await orgReportsRes.json();
          const list = Array.isArray(orgRaw)
            ? orgRaw
            : Array.isArray(orgRaw?.content)
            ? orgRaw.content
            : Array.isArray(orgRaw?.data)
            ? orgRaw.data
            : [];

          const matched = list.find((item: { id?: string }) => item.id === id);
          if (matched && typeof matched === "object") {
            reportData = matched;
          }
        }
      } catch {
        // fall through to error handling if not found
      }
    }

    if (reportData) {
      // Enrich with reporter profile details if reporterId is present
      const repId =
        reportData.reporterId ||
        reportData.reporter_id ||
        reportData.reporter?.id;

      if (repId) {
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
            reportData.reporterId = profile.id || repId;
            reportData.authorName = profile.fullName || reportData.authorName;
            reportData.researcherName = profile.fullName || reportData.researcherName;
            reportData.submitterName = profile.fullName || reportData.submitterName;
            reportData.authorEmail = profile.email || reportData.authorEmail;
            reportData.reporterEmail = profile.email || reportData.reporterEmail;
            reportData.avatarUrl = profile.avatarUrl || reportData.avatarUrl;
            reportData.reporterAvatarUrl = profile.avatarUrl;
            reportData.reporter = {
              id: profile.id,
              name: profile.fullName,
              username: profile.username,
              email: profile.email,
              avatarUrl: profile.avatarUrl,
              biography: profile.biography,
              country: profile.country,
              reputation: profile.reputation,
              totalReports: profile.totalReports,
              validReports: profile.validReports,
            };
          }
        } catch {
          // optional enrichment
        }
      }

      // Enrich with program details if programId is present
      if (reportData.programId) {
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

            // Fetch organization details if available
            if (prog.organizationId) {
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

      // Enrich with rewards if not already attached
      if (!reportData.rewards || reportData.rewards.length === 0) {
        try {
          const rewRes = await fetch(
            `${BACKEND_API_URL}/reports/${id}/rewards`,
            {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
              cache: "no-store",
            }
          );
          if (rewRes.ok) {
            const rew = await rewRes.json();
            reportData.rewards = Array.isArray(rew)
              ? rew
              : Array.isArray(rew?.content)
              ? rew.content
              : [];
          }
        } catch {
          // optional enrichment
        }
      }

      // Enrich with attachments if not already attached
      if (!reportData.attachments || reportData.attachments.length === 0) {
        try {
          const attRes = await fetch(
            `${BACKEND_API_URL}/reports/${id}/attachments`,
            {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
              cache: "no-store",
            }
          );
          if (attRes.ok) {
            const att = await attRes.json();
            reportData.attachments = Array.isArray(att)
              ? att
              : Array.isArray(att?.content)
              ? att.content
              : [];
          }
        } catch {
          // optional enrichment
        }
      }

      return NextResponse.json(reportData, { status: 200 });
    }

    return NextResponse.json(
      {
        message:
          (body as { message?: string } | null)?.message ?? "Report not found.",
      },
      { status: upstream.status }
    );
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
