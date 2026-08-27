"use client";

export const dynamic = "force-dynamic";

import { RequireRole } from "@/components/auth/RequireRole";
import { ResearcherAccessView } from "@/components/researchers/ResearcherAccessView";

/**
 * Company-only. Deciding who may report is a decision an organization takes;
 * a researcher account has nothing to approve.
 */
export default function ResearcherAccessPage() {
  return (
    <RequireRole
      roles={["COMPANY"]}
      title="This screen is for companies"
      description="Approving researchers is something an organization does. To see where you stand with the companies you have approached, open your own access instead."
      action={{ href: "/dashboard/my-access", label: "My access" }}
    >
      <ResearcherAccessView />
    </RequireRole>
  );
}
