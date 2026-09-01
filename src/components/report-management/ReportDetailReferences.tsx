import React from "react";
import { BookOpen, ExternalLink, FileSearch, Link2, ShieldAlert } from "lucide-react";

import { ReportDetailSectionCard } from "@/components/report-management/ReportDetailSectionCard";
import type { ReportManagementDetail } from "@/components/report-management/types";

type ReportDetailReferencesProps = {
  detail: ReportManagementDetail;
};

export function ReportDetailReferences({
  detail,
}: ReportDetailReferencesProps) {
  return (
    <ReportDetailSectionCard
      title="External References & Related Reports"
      icon={<Link2 className="size-4.5" />}
      contentClassName="space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <ReferenceCard
          icon={<BookOpen className="size-4 text-blue-600 dark:text-blue-400" />}
          label="External Documentation"
          value={detail.externalDocumentation || "OWASP API Security Top 10 - Broken Object Level Auth"}
          href="https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/"
        />

        <ReferenceCard
          icon={<Link2 className="size-4 text-emerald-600 dark:text-emerald-400" />}
          label="Internal Endpoint Reference"
          value={detail.internalAssetLink || "/api/v1/invoices/{id}"}
          href="#"
        />

        <ReferenceCard
          icon={<FileSearch className="size-4 text-purple-600 dark:text-purple-400" />}
          label="Related Vulnerability Reports"
          value={detail.relatedReport || "#RPT-2025-00982 - Similar IDOR in /v1/users"}
          href="#"
        />
      </div>
    </ReportDetailSectionCard>
  );
}

function ReferenceCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-border bg-muted/20 p-4 transition-all hover:border-blue-500/40 hover:bg-muted/50"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
        </div>
        <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
      </div>

      <p className="mt-2.5 text-xs sm:text-sm font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
        {value}
      </p>
    </a>
  );
}
