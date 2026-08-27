"use client";

export const dynamic = "force-dynamic";

import { use } from "react";

import { RequireRole } from "@/components/auth/RequireRole";
import { CompanyAccessDetail } from "@/components/researchers/CompanyAccessDetail";

/**
 * One company on the researcher access list: who they are, where the
 * researcher stands with them, and what has already been filed.
 */
export default function CompanyAccessPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = use(params);

  return (
    <RequireRole
      roles={["USER"]}
      title="This screen is for researchers"
      description="Your account signs in as a company, so there is no access of your own to show. What you are probably after is the queue of researchers asking to report to your programs."
      action={{ href: "/dashboard/researcher-access", label: "Researcher access" }}
    >
      <CompanyAccessDetail organizationId={organizationId} />
    </RequireRole>
  );
}
