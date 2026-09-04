"use client";

export const dynamic = "force-dynamic";

import React, { Suspense } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ShieldAlert, Building2 } from "lucide-react";
import { RequireOrgPermission } from "@/components/auth/RequireOrgPermission";
import { SecurityIncidentsTable } from "@/components/security-incidents/SecurityIncidentsTable";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";

function OrganizationSecurityContent() {
  const { membership } = useCompanyAccess();
  const orgId = membership?.organizationId || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Link
              href="/dashboard"
              className="hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <span>/</span>
            <Link
              href="/dashboard/report-management"
              className="hover:text-foreground transition-colors"
            >
              Organization
            </Link>
            <span>/</span>
            <span className="text-foreground">Security Incidents</span>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              <ShieldAlert className="size-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Organization Malware Incidents
            </h1>
          </div>
          <p className="text-sm text-muted-foreground pt-0.5">
            Malicious and suspicious attachments blocked by the VirusTotal security guard against your company’s bug bounty programs.
          </p>
        </div>
      </header>

      {orgId ? (
        <SecurityIncidentsTable scope="org" orgId={orgId} />
      ) : (
        <div className="p-8 text-center text-sm text-muted-foreground bg-card border border-border rounded-2xl">
          No active organization selected.
        </div>
      )}
    </motion.div>
  );
}

export default function OrganizationSecurityPage() {
  return (
    <RequireOrgPermission
      permission="TRIAGE_REPORTS"
      title="Security Incidents Restricted"
      description="You need report triage permissions to view malware and security incidents for this organization."
      action={{ href: "/dashboard/report-management", label: "View Reports" }}
    >
      <Suspense
        fallback={
          <div className="w-full animate-pulse space-y-6 pb-12">
            <div className="h-14 w-1/3 rounded-xl bg-muted" />
            <div className="h-96 w-full rounded-2xl bg-muted/60" />
          </div>
        }
      >
        <OrganizationSecurityContent />
      </Suspense>
    </RequireOrgPermission>
  );
}
