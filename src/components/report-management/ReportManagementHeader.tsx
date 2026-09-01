import Link from "next/link";
import { Download, ListChecks, ShieldAlert } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReportManagementHeader() {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Report Management
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Review, triage, track, and manage all security reports submitted to your organization.
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:justify-end">
        <Link
          href="/dashboard/organization-security"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-11 items-center justify-center gap-2 rounded-xl border-red-500/20 bg-red-500/5 px-4 font-semibold text-red-600 dark:text-red-400 shadow-none hover:bg-red-500/10 cursor-pointer"
          )}
        >
          <ShieldAlert className="size-4" />
          Malware Incidents
        </Link>

        <Link
          href="/dashboard/report-management/review-queue"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-11 items-center justify-center gap-2.5 rounded-xl border-border bg-card px-5 font-semibold text-foreground shadow-none hover:bg-muted cursor-pointer"
          )}
        >
          <ListChecks className="size-4" />
          Review Queue
        </Link>

        <Link
          href="/dashboard/report-management/export"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-11 items-center justify-center gap-2.5 rounded-xl border-border bg-card px-5 font-semibold text-foreground shadow-none hover:bg-muted cursor-pointer"
          )}
        >
          <Download className="size-4" />
          Export
        </Link>
      </div>
    </header>
  );
}
