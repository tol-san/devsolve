"use client";

import React, { useMemo } from "react";
import {
  FileText,
  Copy,
  Check,
  Compass,
  ChevronRight,
  AlertTriangle,
  Calendar,
  Globe,
  Shield,
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

  const [copiedTitle, setCopiedTitle] = React.useState(false);
  const handleCopyTitle = async () => {
    try {
      await navigator.clipboard.writeText(report.title);
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } catch {
      // ignore
    }
  };

  const isUrlTitle = /^https?:\/\//i.test((report.title || "").trim());

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border bg-card p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent opacity-60 blur-2xl" />

        <div className="relative z-10 space-y-4 sm:space-y-5">
          {/* Top Row: Status badge on left, Severity / Disputed pill on right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status="REJECTED" />
            </div>

            <div className="shrink-0 flex items-center justify-start sm:justify-end">
              {report.severity ? (
                <SeverityBadge severity={report.severity} />
              ) : (
                <DisputedSeverityPair
                  reportedSeverity={report.reportedSeverity || report.claimedSeverity}
                  triageSeverity={report.triageSeverity || report.confirmedSeverity}
                  cvssScore={report.cvssScore}
                  size="sm"
                />
              )}
            </div>
          </div>

          {/* Finding Title or Target Endpoint */}
          {isUrlTitle ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                  <Globe className="size-3.5 shrink-0" />
                  Target Vulnerability Endpoint
                </span>
                <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                  Reported target URI
                </span>
              </div>
              <div className="group relative flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-muted/40 hover:bg-muted/60 border border-border/80 transition-colors shadow-2xs">
                <div className="font-mono text-sm sm:text-base font-semibold text-foreground break-all select-all leading-relaxed">
                  {report.title}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyTitle}
                    className="h-8 px-2.5 gap-1.5 text-xs rounded-lg cursor-pointer bg-card hover:bg-muted shadow-2xs"
                  >
                    {copiedTitle ? (
                      <>
                        <Check className="size-3.5 text-emerald-500 animate-in fade-in zoom-in-75 duration-200" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Copied
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-muted-foreground" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight break-words leading-tight">
              {report.title}
            </h2>
          )}

          {/* Tactile Metadata Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {report.program && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-xs sm:text-sm shadow-2xs">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Shield className="size-3" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground text-xs font-semibold">Program:</span>
                  <span className="font-bold text-foreground">{report.program}</span>
                </div>
              </div>
            )}

            {report.submittedAt && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-xs sm:text-sm shadow-2xs">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-card border border-border text-muted-foreground">
                  <Calendar className="size-3" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground text-xs font-semibold">Submitted:</span>
                  <span className="font-medium text-foreground">{formatDateTime(report.submittedAt)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <main className="lg:col-span-2 space-y-6">
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

          <ReportTimeline
            activities={activities}
            isLoading={activitiesLoading}
            isError={activitiesError}
          />

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

        <ReportSidebarPanels report={report} />
      </div>
    </div>
  );
}
