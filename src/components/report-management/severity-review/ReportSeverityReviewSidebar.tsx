import Link from "next/link";
import { ExternalLink, FileText, Mail, ShieldCheck, TimerReset, User } from "lucide-react";

import type { ReportManagementDetail } from "@/components/report-management/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReportSeverityReviewSidebarProps = {
  detail: ReportManagementDetail;
};

export function ReportSeverityReviewSidebar({
  detail,
}: ReportSeverityReviewSidebarProps) {
  const username = detail.submitter.toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  const contactEmail =
    detail.submitterEmail?.trim() ||
    `${detail.submitterInitials.toLowerCase()}@devsolve.io`;

  const profileIdentifier = detail.submitterId || username;

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Submitter Snapshot with HoverCard */}
      <Card className="rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 border-none shadow-xs">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <User className="size-4.5 text-blue-600 dark:text-blue-400" />
            Submitter Info
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-muted/40">
            <Link
              href={`/profile/${encodeURIComponent(profileIdentifier)}`}
              className="flex items-center gap-3 min-w-0 group cursor-pointer"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm shadow-2xs group-hover:scale-105 transition-transform">
                {detail.submitterInitials}
              </div>
              <div className="min-w-0 text-left">
                <p className="font-bold text-sm text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {detail.submitter}
                </p>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  @{username}
                </p>
              </div>
            </Link>

            <a
              href={`mailto:${contactEmail}`}
              className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              title={`Email ${detail.submitter}`}
            >
              <Mail className="size-3.5" />
            </a>
          </div>

          <Link href={`/profile/${encodeURIComponent(profileIdentifier)}`} className="block">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8.5 rounded-xl border-border bg-card hover:bg-muted font-semibold text-foreground text-xs gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>View Full Profile</span>
              <ExternalLink className="size-3.5 text-blue-600 dark:text-blue-400" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* 2. Current Submission Snapshot */}
      <Card className="rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 border-none shadow-xs">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-bold text-foreground">
            Current Submission
          </CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Snapshot of the researcher-submitted severity before the company decision.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="rounded-2xl border border-border bg-muted/50 p-4">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Submitted severity
            </span>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
              >
                {detail.severity} ({detail.cvssScore})
              </Badge>
              <Badge
                variant="outline"
                className="border-border bg-card text-muted-foreground"
              >
                {detail.status}
              </Badge>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/50 p-4">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Reward estimate
            </span>
            <p className="mt-3 text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {detail.bountyRange}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 border-none shadow-xs">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-bold text-foreground">
            Review Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {[
            {
              icon: ShieldCheck,
              title: "Confirm real impact",
              description: "Validate whether the exploit changes actual business risk or data exposure.",
            },
            {
              icon: TimerReset,
              title: "Compare with policy",
              description: "Align the final severity with your bounty rubric and triage conventions.",
            },
            {
              icon: FileText,
              title: "Leave clear feedback",
              description: "Explain why the final decision changed so the researcher understands it.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex gap-3 rounded-2xl border border-border bg-muted/50 p-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-foreground ring-1 ring-border">
                  <Icon className="size-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
