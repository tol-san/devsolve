import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  DEFAULT_PERMISSIONS_BY_ROLE,
  MAX_PERMISSIONS_BY_ROLE,
} from "@/components/teams/invite-member/mock-data";

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

const FALLBACK_ROLES = [
  {
    role: "MANAGER",
    defaultPermissions: DEFAULT_PERMISSIONS_BY_ROLE.MANAGER,
    allowedPermissions: MAX_PERMISSIONS_BY_ROLE.MANAGER,
  },
  {
    role: "MEMBER",
    defaultPermissions: DEFAULT_PERMISSIONS_BY_ROLE.MEMBER,
    allowedPermissions: MAX_PERMISSIONS_BY_ROLE.MEMBER,
  },
  {
    role: "VIEWER",
    defaultPermissions: DEFAULT_PERMISSIONS_BY_ROLE.VIEWER,
    allowedPermissions: MAX_PERMISSIONS_BY_ROLE.VIEWER,
  },
];

export async function GET(request: NextRequest) {
  try {
    const token = await bearerTokenFor(request);
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const upstream = await fetch(`${BACKEND_API_URL}/organizations/roles`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json(FALLBACK_ROLES, { status: 200 });
    }

    const raw = await upstream.text();
    if (!raw) {
      return NextResponse.json(FALLBACK_ROLES, { status: 200 });
    }

    let body: unknown = null;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json(FALLBACK_ROLES, { status: 200 });
    }

    return NextResponse.json(body, { status: 200 });
  } catch {
    return NextResponse.json(FALLBACK_ROLES, { status: 200 });
  }
}
