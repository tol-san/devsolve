import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type { ReportManagementDetail } from "@/components/report-management/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ReportDetailHeaderProps = {
  detail: ReportManagementDetail;
};

function getStatusBadgeClass(status: ReportManagementDetail["status"]) {
  return status === "Open"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
    : "border-border bg-muted text-muted-foreground";
}

function getSeverityTone(severity: ReportManagementDetail["severity"]) {
  switch (severity) {
    case "Critical":
      return {
        card: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
        text: "text-red-600 dark:text-red-400",
        badge: "border-red-200 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
      };
    case "High":
      return {
        card: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
        text: "text-amber-600 dark:text-amber-400",
        badge: "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
      };
    case "Medium":
      return {
        card: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400",
        text: "text-sky-600 dark:text-sky-400",
        badge: "border-sky-200 bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
      };
    default:
      return {
        card: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
        text: "text-blue-600 dark:text-blue-400",
        badge: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
      };
  }
}

export function ReportDetailHeader({ detail }: ReportDetailHeaderProps) {
  const severityTone = getSeverityTone(detail.severity);

  return (
    <div className="space-y-4 font-sans">
      {/* Navigation Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <span className="text-muted-foreground/60">&gt;</span>
          <Link
            href="/dashboard/report-management"
            className="transition-colors hover:text-foreground"
          >
            Report Management
          </Link>
          <span className="text-muted-foreground/60">&gt;</span>
          <span className="font-semibold text-foreground">Report #{detail.reportId}</span>
        </nav>

        <Link
          href="/dashboard/report-management"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-10 items-center justify-center gap-2.5 rounded-xl border-border bg-card px-4 font-semibold text-foreground shadow-none hover:bg-muted cursor-pointer"
          )}
        >
          <ArrowLeft className="size-4" />
          Back to reports
        </Link>
      </div>

      {/* Top Key Metrics Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={<UserRound className="size-5" />}
          label="Submitter"
          value={detail.submitter}
          tone="blue"
        />
        <MetricCard
          icon={<CircleAlert className="size-5" />}
          label="Severity"
          value={`${detail.severity} (${detail.cvssScore})`}
          tone={severityTone}
        />
        <MetricCard
          icon={<CalendarDays className="size-5" />}
          label="Date submitted"
          value={detail.submittedDate}
          tone="slate"
        />
      </div>

      {/* Main Overview Card - Clean & Space-Efficient */}
      <Card className="rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 border-border p-5 sm:p-6 shadow-xs space-y-5">
        {/* Header Metadata Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-sm font-bold text-foreground">
              {detail.programLogo ? (
                <Image
                  src={detail.programLogo}
                  alt={`${detail.title} logo`}
                  width={44}
                  height={44}
                  className="size-10 object-contain"
                />
              ) : (
                <span>{detail.submitterInitials}</span>
              )}
            </div>

            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-foreground">
                <span className="truncate max-w-[200px] sm:max-w-none">{detail.submitter}</span>
                <span className="text-xs font-normal text-muted-foreground">submitted finding</span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                Report ID: #{detail.reportId}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row-reverse sm:items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="h-6.5 rounded-full bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-600 dark:bg-blue-600 dark:text-white">
                {detail.type}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "h-6.5 rounded-full px-3 text-xs font-semibold",
                  getStatusBadgeClass(detail.status)
                )}
              >
                <ShieldCheck className="size-3.5 mr-1" />
                {detail.status}
              </Badge>
            </div>

            {detail.bountyRange && (
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {detail.bountyRange}
              </span>
            )}
          </div>
        </div>

        {/* Full-Width Title & Summary Section */}
        <div className="space-y-2.5">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground break-words leading-snug">
            {detail.title}
          </h2>
          {detail.summary && (
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground break-words">
              {detail.summary}
            </p>
          )}
        </div>

        {/* In-Scope Assets Chips */}
        {detail.assets && detail.assets.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/70">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              In-scope assets
            </p>
            <div className="flex flex-wrap gap-2">
              {detail.assets.map((asset) => (
                <span
                  key={asset}
                  className="inline-flex items-center rounded-lg border border-border bg-muted/50 px-3 py-1 text-xs font-mono font-medium text-foreground transition hover:bg-muted"
                >
                  {asset}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone:
    | "blue"
    | "slate"
    | {
        card: string;
        text: string;
      };
}) {
  const toneClass =
    typeof tone === "string"
      ? {
          card:
            tone === "blue"
              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
              : "bg-muted text-foreground",
          text: "text-foreground",
        }
      : tone;

  return (
    <Card className="rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 border-border py-0 shadow-xs">
      <CardContent className="flex items-center gap-4 px-5 py-4">
        <div className={cn("flex size-11 items-center justify-center rounded-2xl shrink-0", toneClass.card)}>
          {icon}
        </div>

        <div className="space-y-0.5 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className={cn("text-base sm:text-lg font-bold tracking-tight truncate", toneClass.text)}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
