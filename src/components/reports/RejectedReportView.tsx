"use client";

import React, { useMemo } from "react";
import {
  FileText,
  Copy,
  Check,
  Compass,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/reports/StatusBadge";
import SeverityBadge from "@/components/reports/SeverityBadge";
import DisputedSeverityPair from "@/components/reports/DisputedSeverityPair";
import { MarkdownView } from "@/components/ui/markdown-view";
import { ReportSidebarPanels } from "@/components/reports/ReportSidebarPanels";
import { ReportTimeline } from "@/components/reports/ReportTimeline";
import type { ReportDetail } from "@/lib/types/reports/types";
import type { ReportActivity } from "@/lib/types/reports/activity";
import { formatDateTime } from "@/lib/format/datetime";

interface RejectedReportViewProps {
  report: ReportDetail;
  activities?: ReportActivity[];
  activitiesLoading?: boolean;
  activitiesError?: boolean;
  copiedPayload: boolean;
  onCopyPayload: () => void;
}

/**
 * Extracts the rejection activity from the timeline — the STATE_CHANGED entry
 * whose `toState` is `REJECTED`. There is at most one per report; if none is
 * found (old reports filed before the activity log shipped) the component
 * degrades gracefully.
 */
function findRejectionActivity(
  activities: ReportActivity[],
): ReportActivity | undefined {
  return activities.find(
    (a) => a.activityType === "STATE_CHANGED" && a.toState === "REJECTED",
  );
}

export function RejectedReportView({
  report,
  activities = [],
  activitiesLoading = false,
  activitiesError = false,
  copiedPayload,
  onCopyPayload,
}: RejectedReportViewProps) {
  const rejectionActivity = useMemo(
    () => findRejectionActivity(activities),
    [activities],
  );

  const rejectionActorName =
    rejectionActivity?.actor?.name ?? report.program ?? "Security Team";
  const rejectionTimestamp = rejectionActivity?.createdAt
    ? formatDateTime(rejectionActivity.createdAt)
    : null;
  const rejectionDetail = rejectionActivity?.detail ?? null;

  /* The settled severity — what the program or triage assessed, falling back to
     whatever the reporter claimed. On a rejected report the triage severity is
     normally the last word, but `settledSeverity` covers a dispute ruling. */
  const displaySeverity =
    report.settledSeverity ??
    report.agreedSeverity ??
    report.triageSeverity ??
    report.reportedSeverity ??
    report.severity;

  const hasDescription =
    report.description &&
    report.description !== "No detailed description provided.";
  const hasImpact =
    report.impact &&
    report.impact.trim() !== "" &&
    report.impact !==
      "Impact information has not been explicitly provided for this report.";

  return (
    <div className="space-y-6">
      {/* Report Title & Status Card */}
      <div className="bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border p-4 sm:p-6 space-y-4 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
          {report.title}
        </h2>

        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
          <StatusBadge status="REJECTED" />
          {report.severity ? (
            <SeverityBadge severity={report.severity} />
          ) : (
            <DisputedSeverityPair
              reportedSeverity={report.reportedSeverity || report.claimedSeverity}
              triageSeverity={report.triageSeverity || report.confirmedSeverity}
              cvssScore={report.cvssScore}
              size="md"
            />
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Main Content */}
        <main className="lg:col-span-2 space-y-6">
          {/* Rejection Alert Card */}
          <div className="flex items-start gap-4 p-5 sm:p-6 bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 border-l-4 border-l-rose-500 rounded-2xl text-foreground shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 mt-0.5 text-sm shadow-xs">
              !
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                This report has been rejected
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-normal">
                {rejectionDetail
                  ? rejectionDetail
                  : "After review, the security team has determined that the reported vulnerability does not meet the criteria for acceptance under this program."}
              </p>
            </div>
          </div>

          {/* Rejection Activity Detail — who rejected and when */}
          {rejectionActivity && (
            <div className="bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-rose-600 to-rose-800 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                    {rejectionActorName.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {rejectionActorName}
                  </span>
                </div>
                {rejectionTimestamp && (
                  <span className="text-xs text-muted-foreground font-medium">
                    {rejectionTimestamp}
                  </span>
                )}
              </div>

              {rejectionDetail && (
                <p className="text-sm sm:text-base text-foreground/90 italic leading-relaxed font-normal">
                  &quot;{rejectionDetail}&quot;
                </p>
              )}
            </div>
          )}

          {/* Description */}
          {hasDescription && (
            <div className="bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border p-5 sm:p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 stroke-[2]" />
                <h2 className="text-2xl font-bold text-foreground">
                  Description
                </h2>
              </div>
              <div className="prose dark:prose-invert max-w-none text-foreground">
                <MarkdownView
                  source={report.description}
                  className="text-base text-foreground/90 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Impact */}
          {hasImpact && (
            <div className="bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border p-5 sm:p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 stroke-[2]" />
                <h2 className="text-2xl font-bold text-foreground">Impact</h2>
              </div>
              <div className="prose dark:prose-invert max-w-none text-foreground">
                <MarkdownView
                  source={report.impact}
                  className="text-base text-foreground/90 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Steps to Reproduce */}
          {report.reproduceSteps.length > 0 && (
            <div className="bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border p-5 sm:p-6 space-y-5 shadow-xs">
              <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">
                Steps to Reproduce
              </h3>
              <div className="space-y-2.5 text-base text-foreground/90 leading-relaxed">
                {report.reproduceSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold text-xs mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <MarkdownView
                        source={step}
                        className="text-sm sm:text-base leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proof of Concept / Payload */}
          {report.proofOfConcept && (
            <div className="bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border p-5 sm:p-6 space-y-5 shadow-xs">
              <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">
                Proof of Concept
              </h3>
              <div className="bg-muted/50 border border-border rounded-2xl p-4 font-mono text-sm sm:text-base text-foreground flex items-center justify-between gap-3">
                <pre className="overflow-x-auto flex-1 min-w-0">
                  <code className="break-all whitespace-pre-wrap">
                    {report.proofOfConcept}
                  </code>
                </pre>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onCopyPayload}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg w-8 h-8 shrink-0 cursor-pointer"
                  title="Copy payload"
                >
                  {copiedPayload ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Suggested Remediation */}
          {report.remediation && (
            <div className="bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border p-5 sm:p-6 space-y-5 shadow-xs">
              <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">
                Suggested Remediation
              </h3>
              <div className="prose dark:prose-invert max-w-none text-foreground">
                <MarkdownView
                  source={report.remediation}
                  className="text-base text-foreground/90 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Timeline */}
          <ReportTimeline
            activities={activities}
            isLoading={activitiesLoading}
            isError={activitiesError}
          />

          {/* What's Next Card — links built from the report's own program */}
          <div className="bg-blue-600 text-white rounded-2xl p-6 space-y-4 shadow-md relative overflow-hidden">
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

            <h3 className="text-xl font-bold tracking-tight text-white">
              What&apos;s Next?
            </h3>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
              Don&apos;t let this slow you down. Review the program policy or
              explore other programs to keep your momentum going.
            </p>

            <div className="space-y-2.5 pt-1">
              {report.policyUrl && (
                <Link
                  href={report.policyUrl}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/15 hover:bg-white/20 text-sm sm:text-base font-semibold transition-all border border-white/10 text-white"
                >
                  <span className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-white" />
                    <span>
                      Review {report.program || "Program"} Policy
                    </span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/80" />
                </Link>
              )}

              <Link
                href="/dashboard/programs"
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/15 hover:bg-white/20 text-sm sm:text-base font-semibold transition-all border border-white/10 text-white"
              >
                <span className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-white" />
                  <span>Find Other Programs</span>
                </span>
                <ChevronRight className="w-4 h-4 text-white/80" />
              </Link>
            </div>
          </div>
        </main>

        {/* Right Column: Reuse the standard sidebar panels */}
        <ReportSidebarPanels report={report} />
      </div>
    </div>
  );
}
