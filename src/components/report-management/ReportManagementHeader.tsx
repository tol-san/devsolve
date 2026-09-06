import Link from "next/link";
import { Download, ListChecks, ShieldAlert } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReportManagementHeader() {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border min-w-0">
      <div className="flex flex-col gap-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
          Report Management
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Review, triage, track, and manage all security reports submitted to your organization.
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-2.5 sm:justify-end">
        <Link
          href="/dashboard/organization-security"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-9 sm:h-10 items-center justify-center gap-1.5 rounded-xl border-red-500/20 bg-red-500/5 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 shadow-none hover:bg-red-500/10 cursor-pointer"
          )}
        >
          <ShieldAlert className="size-3.5 sm:size-4" />
          <span>Malware Incidents</span>
        </Link>

        <Link
          href="/dashboard/report-management/review-queue"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-9 sm:h-10 items-center justify-center gap-1.5 rounded-xl border-border bg-card px-3 sm:px-4 text-xs sm:text-sm font-semibold text-foreground shadow-none hover:bg-muted cursor-pointer"
          )}
        >
          <ListChecks className="size-3.5 sm:size-4" />
          <span>Review Queue</span>
        </Link>

        <Link
          href="/dashboard/report-management/export"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-9 sm:h-10 items-center justify-center gap-1.5 rounded-xl border-border bg-card px-3 sm:px-4 text-xs sm:text-sm font-semibold text-foreground shadow-none hover:bg-muted cursor-pointer"
          )}
        >
          <Download className="size-3.5 sm:size-4" />
          <span>Export</span>
        </Link>
      </div>
    </header>
  );
}
