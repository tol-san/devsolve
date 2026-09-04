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

const unreachable = () =>
  NextResponse.json(
    { message: "Unable to reach the program service. Please try again." },
    { status: 502 }
  );

const unauthorized = () =>
  NextResponse.json({ message: "Not authenticated" }, { status: 401 });

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const programItemsFrom = (value: unknown): Record<string, unknown>[] => {
  const items =
    isRecord(value) && Array.isArray(value.content)
      ? value.content
      : Array.isArray(value)
        ? value
        : [];

  return items.filter(isRecord);
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await bearerTokenFor(request);
  const { id } = await params;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const idIsUuid = isUuid(id);
  const primaryUrl = idIsUuid
    ? `${BACKEND_API_URL}/programs/${id}`
    : `${BACKEND_API_URL}/programs/handle/${id}`;

  const secondaryUrl = idIsUuid
    ? `${BACKEND_API_URL}/programs/handle/${id}`
    : `${BACKEND_API_URL}/programs/${id}`;

  try {
    let upstream = await fetch(primaryUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!upstream.ok) {
      const fallbackUpstream = await fetch(secondaryUrl, {
        method: "GET",
        headers,
        cache: "no-store",
      });
      if (fallbackUpstream.ok) {
        upstream = fallbackUpstream;
      } else {
        if (idIsUuid && token) {
          const orgMeUpstream = await fetch(
            `${BACKEND_API_URL}/organizations/me/programs/${id}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
              cache: "no-store",
            }
          );

          if (orgMeUpstream.ok) {
            upstream = orgMeUpstream;
          } else {
            const adminUpstream = await fetch(
              `${BACKEND_API_URL}/admin/programs/${id}`,
              {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
              }
            );
            if (adminUpstream.ok) {
              upstream = adminUpstream;
            }
          }
        }

        if (!upstream.ok) {
          const publicSearchRes = await fetch(
            `${BACKEND_API_URL}/programs?size=100`,
            {
              method: "GET",
              headers: { Accept: "application/json" },
              cache: "no-store",
            }
          );
          if (publicSearchRes.ok) {
            const rawPublic = await publicSearchRes.text();
            if (rawPublic) {
              try {
                const parsed: unknown = JSON.parse(rawPublic);
                const found = programItemsFrom(parsed).find(
                  (item) => item.id === id || item.handle === id
                );
                if (found) {
                  return NextResponse.json(found, { status: 200 });
                }
              } catch {
                // Ignore parse error
              }
            }
          }

          if (token) {
            const orgProgramsUpstream = await fetch(
              `${BACKEND_API_URL}/organizations/me/programs?size=100`,
              {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
              }
            );
            if (orgProgramsUpstream.ok) {
              const rawOrg = await orgProgramsUpstream.text();
              if (rawOrg) {
                try {
                  const parsed: unknown = JSON.parse(rawOrg);
                  const found = programItemsFrom(parsed).find(
                    (item) => item.id === id || item.handle === id
                  );
                  if (found) {
                    return NextResponse.json(found, { status: 200 });
                  }
                } catch {
                  // Ignore JSON parse error
                }
              }
            }
          }
        }
      }
    }

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
      const message =
        (body as { message?: string } | null)?.message ??
        "Failed to fetch program details.";
      return NextResponse.json(
        { message, details: body },
        { status: upstream.status }
      );
    }

    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return unreachable();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json(
      { message: "Program id must be a valid UUID" },
      { status: 400 }
    );
  }

  const targetUrls = [
    `${BACKEND_API_URL}/programs/${encodeURIComponent(id)}`,
    `${BACKEND_API_URL}/organizations/me/programs/${encodeURIComponent(id)}`,
    `${BACKEND_API_URL}/admin/programs/${encodeURIComponent(id)}`,
  ];

  try {
    let upstream: Response | null = null;
    for (const url of targetUrls) {
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
      upstream = res;
      if (res.ok) {
        break;
      }
    }

    if (!upstream) {
      return unreachable();
    }

    if (!upstream.ok) {
      const raw = await upstream.text();
      let body: unknown = null;
      if (raw) {
        try {
          body = JSON.parse(raw);
        } catch {
          body = { message: raw };
        }
      }

      const message =
        (body as { message?: string } | null)?.message ??
        "Failed to delete program.";
      return NextResponse.json(
        { message, details: body },
        { status: upstream.status }
      );
    }

    return new NextResponse(null, { status: 204 });
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
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  const encodedId = encodeURIComponent(id);
  const targetUrl = `${BACKEND_API_URL}/programs/${encodedId}`;

  try {
    const upstream = await fetch(targetUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
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
      const message =
        (body as { message?: string } | null)?.message ??
        "Failed to update program.";
      return NextResponse.json(
        { message, details: body },
        { status: upstream.status }
      );
    }

    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return unreachable();
  }
}
