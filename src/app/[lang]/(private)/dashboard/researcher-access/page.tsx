"use client";

export const dynamic = "force-dynamic";

import { RequireOrgPermission } from "@/components/auth/RequireOrgPermission";
import { RequireRole } from "@/components/auth/RequireRole";
import { ResearcherAccessView } from "@/components/researchers/ResearcherAccessView";

/**
 * Company-only, and within a company, `MANAGE_RESEARCHERS`-only.
 *
 * Two gates because they answer different questions. The role says a
 * researcher account has nothing to approve here. The permission says which
 * members of an organization were given the say — a `MANAGER` holds it by
 * default, a `MEMBER` or `VIEWER` does not, and it is the same permission the
 * backend checks on every decision this screen sends.
 */
export default function ResearcherAccessPage() {
  return (
    <RequireRole
      roles={["COMPANY"]}
      title="This screen is for companies"
      description="Approving researchers is something an organization does. To see where you stand with the companies you have approached, open your own access instead."
      action={{ href: "/dashboard/my-access", label: "My access" }}
    >
      <RequireOrgPermission
        permission="MANAGE_RESEARCHERS"
        title="You do not manage researcher access"
        description="Deciding who may report to this organization needs the “Manage researchers” permission, which your team did not include when they invited you. An owner or manager can add it from team management."
        action={{ href: "/dashboard/team-management", label: "Team management" }}
      >
        <ResearcherAccessView />
      </RequireOrgPermission>
    </RequireRole>
  );
}
