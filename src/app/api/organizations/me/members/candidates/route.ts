import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  searchPlatformUsersForInvitation,
  dbPool,
} from "@/lib/server/db";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query") || searchParams.get("q") || "";
  let organizationId = searchParams.get("organizationId");

  if (!organizationId && session.user) {
    try {
      const activeOrgRes = await dbPool.query(
        `SELECT organization_id FROM organization_members 
         WHERE (user_id = $1 OR invitation_email = $2) 
           AND status = 'active' 
         ORDER BY updated_at DESC LIMIT 1`,
        [session.user.id, session.user.email ?? ""]
      );
      if (activeOrgRes.rows.length > 0) {
        organizationId = activeOrgRes.rows[0].organization_id;
      }
    } catch {
      // ignore
    }
  }

  const candidates = await searchPlatformUsersForInvitation(
    query,
    organizationId
  );

  return NextResponse.json(candidates);
}
