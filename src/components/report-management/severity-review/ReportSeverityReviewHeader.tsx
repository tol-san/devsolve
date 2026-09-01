import Link from "next/link";
import { ArrowLeft, Globe, ShieldAlert } from "lucide-react";

import type { ReportManagementDetail } from "@/components/report-management/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ReportSeverityReviewHeaderProps = {
  detail: ReportManagementDetail;
};

export function ReportSeverityReviewHeader({
  detail,
}: ReportSeverityReviewHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-muted-foreground">
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
          <Link
            href={`/dashboard/report-management/${detail.id}`}
            className="transition-colors hover:text-foreground"
          >
            Report {detail.reportId.startsWith("#") ? detail.reportId : `#${detail.reportId}`}
          </Link>
          <span className="text-muted-foreground/60">&gt;</span>
          <span className="font-semibold text-foreground">Severity Adjustment</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
              >
                Company decision
              </Badge>
              <Badge
                variant="outline"
                className="border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
              >
                Submitted {detail.severity} ({detail.cvssScore})
              </Badge>
            </div>

            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Modify Submitted Severity
              </h1>
              <p className="max-w-3xl text-sm sm:text-base text-muted-foreground leading-relaxed">
                Company review can adjust the researcher-submitted severity before
                the final approval or rejection is shared back to the hacker.
              </p>
            </div>
          </div>

          <Link
            href={`/dashboard/report-management/${detail.id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-10 items-center justify-center gap-2.5 rounded-xl border-border bg-card px-4 font-semibold text-foreground shadow-none hover:bg-muted cursor-pointer"
            )}
          >
            <ArrowLeft className="size-4" />
            Back to report detail
          </Link>
        </div>
      </div>

      <Card className="rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 border-none shadow-xs">
        <CardContent className="grid gap-4 p-6 md:grid-cols-3">
          {/* Tile 1: Target Asset & Scope */}
          <div className="rounded-2xl border border-border bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-card text-foreground ring-1 ring-border shrink-0">
                <Globe className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Target Scope
                </span>
                <span className="text-base font-semibold text-foreground truncate" title={detail.affectedUrl || detail.internalAssetLink || "Target Asset"}>
                  {detail.affectedUrl || detail.internalAssetLink || "Target Asset"}
                </span>
              </div>
            </div>
          </div>

          {/* Tile 2: Current Submitted Severity */}
          <div className="rounded-2xl border border-border bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-card text-foreground ring-1 ring-border shrink-0">
                <ShieldAlert className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Submitted Severity
                </span>
                <span className="text-base font-semibold text-foreground">
                  {detail.severity} ({detail.cvssScore})
                </span>
              </div>
            </div>
          </div>

          {/* Tile 3: Bounty Reward Range */}
          <div className="rounded-2xl border border-border bg-muted/50 p-4">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Reward estimate
            </span>
            <p className="mt-3 text-base font-semibold text-emerald-600 dark:text-emerald-400">
              {detail.bountyRange}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
