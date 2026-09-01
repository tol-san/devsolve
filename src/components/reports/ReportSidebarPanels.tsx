import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import SeverityBadge from "@/components/reports/SeverityBadge";
import type { ReportDetail } from "@/lib/types/reports/types";

import { formatDateTime } from "@/lib/format/datetime";

interface ReportSidebarPanelsProps {
  report: ReportDetail;
}

/** One label-and-value line. Absent values say so rather than guessing. */
function Fact({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-semibold text-foreground text-right break-words min-w-0">
        {value ?? "Not provided"}
      </span>
    </div>
  );
}

/**
 * The facts panel beside a report.
 *
 * Every figure here was previously a constant: "High (8.1)" confirmed,
 * "Critical (9.0)" claimed, a $1,500.00 reward, "Global Enterprise VDP",
 * "REST API", "Production" — shown identically on every report in the system.
 * They now come from the report, and anything it does not carry reads as not
 * provided instead of being invented.
 */
export function ReportSidebarPanels({ report }: ReportSidebarPanelsProps) {
  const scoreSuffix = report.cvssScore ? ` (${report.cvssScore})` : "";

  return (
    <aside className="space-y-6">
      {/* Severity Panel */}
      <div className="bg-card p-5 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Severity
        </h4>
        <div>
          <SeverityBadge severity={report.severity} />
        </div>
        <div className="space-y-2.5 pt-2 border-t border-border text-sm">
          <Fact label="Claimed" value={`${report.claimedSeverity}${scoreSuffix}`} />
          <Fact label="Confirmed by triage" value={report.confirmedSeverity} />
          {report.cvssVector && (
            <div className="space-y-1 pt-1">
              <span className="text-muted-foreground">CVSS vector</span>
              <p className="font-mono text-xs text-foreground break-all">
                {report.cvssVector}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reward Panel */}
      <div className="bg-card p-5 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border shadow-xs space-y-3">
        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Reward
        </h4>
        <div className="text-2xl font-black bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-500/20 inline-block">
          {report.bountyOrRep}
        </div>
        <div className="text-sm font-semibold text-muted-foreground">
          Status:{" "}
          <span className="text-foreground">{report.status}</span>
        </div>
      </div>

      {/* Finding Panel */}
      <div className="bg-card p-5 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Finding
        </h4>
        <div className="space-y-2.5 text-sm">
          <Fact label="Asset" value={report.assetType} />
          <Fact label="Environment" value={report.environment} />
          <Fact label="Weakness" value={report.weakness} />
          <Fact label="Discovered" value={report.discoveredAt} />
          {report.targetEndpoint && (
            <div className="space-y-1 pt-1">
              <span className="text-muted-foreground">Target endpoint</span>
              <p className="font-mono text-xs text-foreground break-all">
                {report.targetEndpoint}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Program Panel */}
      <div className="bg-card p-5 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Program
        </h4>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
            {report.avatarLetter}
          </div>
          <div className="flex flex-col min-w-0">
            <strong className="text-base font-bold text-foreground truncate">
              {report.program}
            </strong>
            <Link
              href={report.policyUrl}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View policy</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
        <div className="space-y-2 pt-3 border-t border-border text-sm">
          <Fact label="Report ID" value={report.reportId} />
          <Fact
            label="Submitted"
            value={report.submittedAt ? formatDateTime(report.submittedAt) : (report.submittedAgo || null)}
          />
          <Fact label="Last activity" value={report.lastActivityDate} />
        </div>
      </div>
    </aside>
  );
}
