import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { withOrganizationScope } from "@/lib/api/organization-scope";
import { getUserProfilesByIds } from "@/lib/server/db";

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

const softEmpty = (upstreamStatus: number | "unreachable") =>
  NextResponse.json([], {
    status: 200,
    headers: { "x-upstream-status": String(upstreamStatus) },
  });

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  try {
    const upstream = await fetch(
      withOrganizationScope(
        request,
        `${BACKEND_API_URL}/organizations/me/members`,
      ),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (upstream.status === 404 || upstream.status === 403) {
      return softEmpty(upstream.status);
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
      return softEmpty(upstream.status);
    }

    let membersList: any[] = [];
    let isArray = false;
    if (Array.isArray(body)) {
      membersList = body;
      isArray = true;
    } else if (body && typeof body === "object") {
      const b = body as Record<string, any>;
      if (Array.isArray(b.members)) membersList = b.members;
      else if (Array.isArray(b.data)) membersList = b.data;
      else if (Array.isArray(b.items)) membersList = b.items;
    }

    if (membersList.length > 0) {
      const userIds = membersList
        .map((m) => m?.userId)
        .filter((id): id is string => typeof id === "string" && id.length > 0);

      const profileMap = await getUserProfilesByIds(userIds);

      const enrichedMembers = membersList.map((m) => {
        const profile = m?.userId ? profileMap.get(m.userId) : undefined;
        if (!profile) return m;

        return {
          ...m,
          avatarUrl: profile.avatarUrl ?? m.avatarUrl ?? null,
          avatar: profile.avatarUrl ?? m.avatar ?? null,
          name: profile.fullName || m.name,
          username: profile.username || m.username,
          reputation: profile.reputation ?? m.reputation ?? 0,
          biography: profile.biography ?? m.biography ?? null,
          country: profile.country ?? m.country ?? null,
          coverImageUrl: profile.coverImageUrl ?? m.coverImageUrl ?? null,
          profile: {
            id: profile.id,
            fullName: profile.fullName,
            username: profile.username,
            avatarUrl: profile.avatarUrl,
            email: profile.email,
            reputation: profile.reputation,
            biography: profile.biography,
            country: profile.country,
            coverImageUrl: profile.coverImageUrl,
          },
        };
      });

      if (isArray) {
        return NextResponse.json(enrichedMembers, { status: upstream.status });
      } else if (body && typeof body === "object") {
        const b = { ...(body as Record<string, any>) };
        if (Array.isArray(b.members)) b.members = enrichedMembers;
        else if (Array.isArray(b.data)) b.data = enrichedMembers;
        else if (Array.isArray(b.items)) b.items = enrichedMembers;
        return NextResponse.json(b, { status: upstream.status });
      }
    }

    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return softEmpty("unreachable");
  }
}

