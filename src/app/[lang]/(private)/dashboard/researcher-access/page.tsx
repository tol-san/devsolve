"use client";

export const dynamic = "force-dynamic";

import { RequireOrgPermission } from "@/components/auth/RequireOrgPermission";
import { ResearcherAccessView } from "@/components/researchers/ResearcherAccessView";

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
