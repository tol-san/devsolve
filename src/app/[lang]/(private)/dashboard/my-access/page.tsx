"use client";

export const dynamic = "force-dynamic";

import { RequireRole } from "@/components/auth/RequireRole";
import { MyAccessView } from "@/components/researchers/MyAccessView";

export default function MyAccessPage() {
  return (
    <RequireRole
      roles={["USER"]}
      title="This screen is for researchers"
      description="Your account signs in as a company, so there is no access of your own to show. What you are probably after is the queue of researchers asking to report to your programs."
      action={{ href: "/dashboard/researcher-access", label: "Researcher access" }}
    >
      <MyAccessView />
    </RequireRole>
  );
}
