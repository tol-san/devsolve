import { NextResponse, type NextRequest } from "next/server";
import * as z from "zod";
import { auth } from "@/lib/auth/auth";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const PROVIDER_ID = "keycloak";
const socialLinkSchema = z.object({
  platform: z.enum([
    "GITHUB",
    "LINKEDIN",
    "WEBSITE",
    "X",
    "FACEBOOK",
    "TELEGRAM",
    "OTHER",
  ]),
  url: z.string(),
});

const updateProfileSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    biography: z.string(),
    phone: z.string(),
    avatarUrl: z.string(),
    dateOfBirth: z.string(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    country: z.string(),
    socialLinks: z.array(socialLinkSchema).max(7),
  })
  .partial();

export type UpdateUserProfileBody = z.infer<typeof updateProfileSchema>;
export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  biography: string;
  phone: string;
  avatarUrl: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  country: string;
  socialLinks: { platform: string; url: string }[];
  status: "ACTIVE" | "SUSPENDED" | "REMOVED";
  reputation: number;
  totalReports: number;
  validReports: number;
  criticalReports: number;
  recognitionCount: number;
  totalBountyEarned?: number;
  bountyCurrency?: string;
  rewardedReports?: number;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}
async function getSessionAndToken(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { session: null, token: null };

  try {
    const { accessToken } = await auth.api.getAccessToken({
      body: { providerId: PROVIDER_ID },
      headers: request.headers,
    });
    return { session, token: accessToken ?? null };
  } catch {
    return { session, token: null };
  }
}

function createFallbackProfile(user: { id?: string; email?: string; name?: string; image?: string | null }): UserProfileResponse {
  const name = user.name || user.email?.split("@")[0] || "User";
  const nameParts = name.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || "User";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    id: user.id || "fallback-id",
    email: user.email || "",
    firstName,
    lastName,
    fullName: name,
    biography: "",
    phone: "",
    avatarUrl: user.image || "",
    dateOfBirth: "",
    gender: "OTHER",
    country: "",
    socialLinks: [],
    status: "ACTIVE",
    reputation: 0,
    totalReports: 0,
    validReports: 0,
    criticalReports: 0,
    recognitionCount: 0,
    totalBountyEarned: 0,
    bountyCurrency: "USD",
    rewardedReports: 0,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function relay(upstream: Response) {
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
      "Unable to load your profile. Please try again.";
    return NextResponse.json({ message, details: body }, { status: upstream.status });
  }

  return NextResponse.json(body as UserProfileResponse, { status: upstream.status });
}

const unauthorized = () =>
  NextResponse.json({ message: "Not authenticated" }, { status: 401 });

const unreachable = () =>
  NextResponse.json(
    { message: "Unable to reach the profile service. Please try again." },
    { status: 502 },
  );

export async function GET(request: NextRequest) {
  const { session, token } = await getSessionAndToken(request);
  if (!session || !token) return unauthorized();

  const strict = request.nextUrl.searchParams.get("strict") === "1";

  try {
    const upstream = await fetch(`${BACKEND_API_URL}/user-profiles/me`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (upstream.status === 404 && session.user && !strict) {
      return NextResponse.json(createFallbackProfile(session.user), { status: 200 });
    }

    return relay(upstream);
  } catch {
    if (session.user && !strict) {
      return NextResponse.json(createFallbackProfile(session.user), { status: 200 });
    }
    return unreachable();
  }
}

export async function PATCH(request: NextRequest) {
  const { session, token } = await getSessionAndToken(request);
  if (!session || !token) return unauthorized();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const parsed = updateProfileSchema.safeParse(payload);
  if (!parsed.success) {
    const { formErrors, fieldErrors } = z.flattenError(parsed.error);
    return NextResponse.json(
      { message: "Validation failed", formErrors, fieldErrors },
      { status: 400 },
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json(
      { message: "No updatable fields were provided" },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(`${BACKEND_API_URL}/user-profiles/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });

    if (upstream.status === 404 && session.user) {
      const base = createFallbackProfile(session.user);
      const updated: UserProfileResponse = {
        ...base,
        ...(parsed.data.firstName && { firstName: parsed.data.firstName }),
        ...(parsed.data.lastName && { lastName: parsed.data.lastName }),
        ...((parsed.data.firstName || parsed.data.lastName) && {
          fullName: [parsed.data.firstName || base.firstName, parsed.data.lastName || base.lastName].filter(Boolean).join(" "),
        }),
        ...(parsed.data.biography !== undefined && { biography: parsed.data.biography }),
        ...(parsed.data.phone !== undefined && { phone: parsed.data.phone }),
        ...(parsed.data.avatarUrl !== undefined && { avatarUrl: parsed.data.avatarUrl }),
        ...(parsed.data.dateOfBirth !== undefined && { dateOfBirth: parsed.data.dateOfBirth }),
        ...(parsed.data.gender !== undefined && { gender: parsed.data.gender }),
        ...(parsed.data.country !== undefined && { country: parsed.data.country }),
        ...(parsed.data.socialLinks !== undefined && { socialLinks: parsed.data.socialLinks }),
      };
      return NextResponse.json(updated, { status: 200 });
    }

    return relay(upstream);
  } catch {
    return unreachable();
  }
}
