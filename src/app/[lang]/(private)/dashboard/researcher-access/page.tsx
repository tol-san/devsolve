"use client";

export const dynamic = "force-dynamic";

import { RequireOrgPermission } from "@/components/auth/RequireOrgPermission";
import { ResearcherAccessView } from "@/components/researchers/ResearcherAccessView";

/**
 * `MANAGE_RESEARCHERS`-only — one gate, because there is only one question.
 *
 * It used to also demand the `COMPANY` realm role, which reads as "is this a
 * company account" but actually means "did this account register a company".
 * An owner holds the permission through their membership like everyone else,
 * so the permission alone covers both, and an account with no company access
 * holds nothing and is refused.
 */
export default function ResearcherAccessPage() {
  return (
    <RequireOrgPermission
      permission="MANAGE_RESEARCHERS"
      title="This screen is for companies"
      description="Deciding who may report to an organization needs the “Manage researchers” permission. If you are a researcher, what you are probably after is where you stand with the companies you have approached."
      action={{ href: "/dashboard/my-access", label: "My access" }}
    >
      <ResearcherAccessView />
    </RequireOrgPermission>
  );
}
