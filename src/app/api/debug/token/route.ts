import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";

const PROVIDER_ID = "keycloak";

function decode(jwt: string | null | undefined): unknown {
  if (!jwt) return null;
  try {
    const part = jwt.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  let accessToken: string | null = null;
  try {
    const res = await auth.api.getAccessToken({
      body: { providerId: PROVIDER_ID },
      headers: request.headers,
    });
    accessToken = res.accessToken ?? null;
  } catch (error) {
    return NextResponse.json(
      { message: "Could not get a Keycloak access token", error: String(error) },
      { status: 500 },
    );
  }

  const claims = decode(accessToken) as Record<string, unknown> | null;

  return NextResponse.json({
    identity: {
      sub: claims?.sub ?? null,
      email: claims?.email ?? null,
      email_verified: claims?.email_verified ?? null,
      preferred_username: claims?.preferred_username ?? null,
      realm_roles:
        (claims?.realm_access as { roles?: string[] } | undefined)?.roles ??
        null,
      identity_provider: claims?.identity_provider ?? null,
    },
    session: {
      id: session.user?.id ?? null,
      email: session.user?.email ?? null,
      name: session.user?.name ?? null,
    },
    allAccessTokenClaims: claims,
  });
}
