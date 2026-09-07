import React from "react";
import Link from "next/link";
import { AlertCircle, Building2, CircleAlert, ExternalLink, Globe, Scale, ShieldAlert, ShieldCheck } from "lucide-react";
import SeverityBadge from "@/components/reports/SeverityBadge";
import DisputedSeverityPair from "@/components/reports/DisputedSeverityPair";
import { Badge } from "@/components/ui/badge";
import type { ReportDetail } from "@/lib/types/reports/types";
import { useGetOrganizationByIdQuery } from "@/lib/redux/services/organizationsApi";
import { formatDateTime } from "@/lib/format/datetime";
import { WeaknessDisplay } from "@/components/reports/WeaknessDisplay";
import { cn } from "@/lib/utils";

function getDotStyle(tier?: string | null) {
  const norm = tier ? tier.toUpperCase() : "";
  switch (norm) {
    case "CRITICAL":
      return "bg-rose-500 animate-pulse";
    case "HIGH":
      return "bg-orange-500";
    case "MEDIUM":
      return "bg-amber-500";
    case "LOW":
      return "bg-blue-500";
    default:
      return "bg-muted-foreground";
  }
}

interface ReportSidebarPanelsProps {
  report: ReportDetail;
}

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

export function ReportSidebarPanels({ report }: ReportSidebarPanelsProps) {
  const scoreSuffix = report.cvssScore ? ` (${report.cvssScore})` : "";

  const { data: orgData } = useGetOrganizationByIdQuery(
    report.organizationId || "",
    { skip: !report.organizationId }
  );

  const orgName =
    orgData?.name ||
    report.organizationName ||
    (report.program.toLowerCase().includes("cybershield")
      ? "CyberShield Inc."
      : "Organization");
  const orgLogo =
    orgData?.logoUrl ||
    report.organizationLogoUrl ||
    undefined;
  const orgSlug =
    orgData?.slug ||
    report.organizationSlug ||
    report.organizationId;
  const orgVerified = Boolean(
    orgData?.verifiedAt ||
      orgData?.status === "ACTIVE" ||
      report.organizationName?.toLowerCase().includes("cybershield")
  );
  const orgIndustry = orgData?.industry;
  const orgWebsite =
    orgData?.websiteUrl || report.organizationWebsiteUrl;

  const companyHref = orgSlug
    ? `/company/${encodeURIComponent(orgSlug)}`
    : report.organizationId
    ? `/company/${encodeURIComponent(report.organizationId)}`
    : null;

  return (
    <aside className="space-y-6">
      <div className="bg-card p-5 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Severity
          </h4>
          {report.dispute && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold uppercase px-2 py-0.5 rounded-md",
                report.dispute.status === "OPEN"
                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                  : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
              )}
            >
              Dispute {report.dispute.status}
            </Badge>
          )}
        </div>

        <div>
          {report.severity ? (
            <SeverityBadge severity={report.severity} />
          ) : (Boolean(report.isDisputed) ||
              Boolean(report.dispute) ||
              (Boolean(report.triageSeverity) &&
                Boolean(report.reportedSeverity) &&
                report.triageSeverity !== report.reportedSeverity)) ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  <Scale className="size-3.5 text-amber-500" />
                  Disputed Severity
                </span>
                {report.cvssScore && (
                  <span className="font-mono text-xs font-bold text-muted-foreground">
                    CVSS {report.cvssScore}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-card border border-border/80 space-y-0.5 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Researcher
                  </span>
                  <span className="font-extrabold text-foreground flex items-center gap-1.5">
                    <span className={cn("size-2 rounded-full", getDotStyle(report.reportedSeverity || report.claimedSeverity))} />
                    {report.reportedSeverity || report.claimedSeverity || "MEDIUM"}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-card border border-border/80 space-y-0.5 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Organization
                  </span>
                  <span className="font-extrabold text-foreground flex items-center gap-1.5">
                    <span className={cn("size-2 rounded-full", getDotStyle(report.triageSeverity || report.confirmedSeverity))} />
                    {report.triageSeverity || report.confirmedSeverity || "NONE"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <SeverityBadge severity={report.reportedSeverity || report.claimedSeverity || "LOW"} />
          )}
        </div>

        {report.dispute && report.dispute.status === "OPEN" && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-800 dark:text-rose-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="size-3.5 text-rose-500 shrink-0" />
              <span>Under Dispute Review</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              The assigned severity is contested. An admin review is in progress.
            </p>
          </div>
        )}

        <div className="space-y-2.5 pt-2 border-t border-border text-sm">
          <Fact
            label="Claimed"
            value={`${report.reportedSeverity || report.claimedSeverity}${scoreSuffix}`}
          />
          <Fact
            label="Confirmed by triage"
            value={report.triageSeverity || report.confirmedSeverity || "Pending triage"}
          />
          {report.severity && (
            <Fact label="Agreed severity" value={report.severity} />
          )}
          {report.dispute?.resolvedSeverity && (
            <Fact label="Admin ruling" value={report.dispute.resolvedSeverity} />
          )}
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

      <div className="bg-card p-5 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Finding
        </h4>
        <div className="space-y-2.5 text-sm">
          <Fact label="Asset" value={report.assetType} />
          <Fact label="Environment" value={report.environment} />
          <div className="flex items-start justify-between gap-3">
            <span className="text-muted-foreground shrink-0">Weakness</span>
            <div className="text-right min-w-0 max-w-[65%]">
              <WeaknessDisplay
                weakness={report.weaknessObj || report.weakness}
                suggestedWeakness={report.suggestedWeakness}
              />
            </div>
          </div>
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

      <div className="bg-card p-5 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="size-3.5 text-blue-600 dark:text-blue-400" />
            Program & Organization
          </h4>
          {companyHref && (
            <Link
              href={companyHref}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Company Profile</span>
              <ExternalLink className="size-3" />
            </Link>
          )}
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-muted/40 space-y-3">
          <div className="flex items-center gap-3">
            {orgLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={orgLogo}
                alt={orgName}
                className="size-11 rounded-xl object-cover ring-1 ring-border shadow-2xs shrink-0"
              />
            ) : (
              <div className="size-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-base flex items-center justify-center shrink-0 shadow-2xs">
                {orgName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-sm text-foreground truncate">
                  {orgName}
                </p>
                {orgVerified && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0"
                  >
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-medium truncate">
                {orgIndustry ? `${orgIndustry} • ` : ""}
                {report.program}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/70 text-xs">
            <Link
              href={report.policyUrl || `/dashboard/programs/${report.programId}`}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Program Policy</span>
              <ExternalLink className="size-3" />
            </Link>
            {orgWebsite && (
              <a
                href={
                  orgWebsite.startsWith("http")
                    ? orgWebsite
                    : `https://${orgWebsite}`
                }
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 truncate max-w-[150px]"
              >
                <Globe className="size-3 shrink-0" />
                <span className="truncate">
                  {orgWebsite.replace(/^https?:\/\//, "")}
                </span>
              </a>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-1 border-t border-border text-sm">
          <Fact label="Report ID" value={report.reportId} />
          <Fact
            label="Submitted"
            value={
              report.submittedAt
                ? formatDateTime(report.submittedAt)
                : report.submittedAgo || null
            }
          />
          <Fact label="Last activity" value={report.lastActivityDate} />
        </div>
      </div>
    </aside>
  );
}
