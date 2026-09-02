"use client";

import { Building2, Coins, Info, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import type { ReportDetail } from "@/lib/types/reports/types";
import { formatDate } from "@/lib/format/datetime";
import { hasReputationAward } from "@/lib/reports/reputation";
import { cn } from "@/lib/utils";

type ReportEarningsProps = {
  report: ReportDetail;
  className?: string;
};

/**
 * What a resolved finding earned its reporter.
 *
 * Two payments from two payers, shown side by side and never added up:
 * reputation comes from the platform and is priced by severity, the bounty
 * comes from the organization and is its own decision. Summing them would
 * invent a single "total earned" figure that no part of the system holds.
 *
 * Rendered only once reputation has actually been awarded. A report resolved
 * before reputation became automatic carries no award — those were not
 * backfilled — and showing a zero there would claim the researcher earned
 * nothing when the truth is that nothing was recorded.
 */
export function ReportEarnings({ report, className }: ReportEarningsProps) {
  if (!hasReputationAward(report)) return null;

  const points = report.reputationPoints as number;
  const isInformational = points === 0;

  const bountyTotal = report.rewards.reduce(
    (sum, reward) => sum + reward.amount,
    0,
  );
  /* A program that pays no money has no empty money slot: there is nothing
     missing, so nothing is shown as missing. When the program could not be
     read (`null`) the slot still appears if a bounty was actually paid. */
  const showBounty = report.programOffersBounties !== false || bountyTotal > 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      aria-label="What this report earned"
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 pb-3">
        <h3 className="text-base font-bold tracking-tight text-foreground">
          What this report earned
        </h3>
        {report.reputationAwardedAt && (
          <span className="text-xs font-medium text-muted-foreground">
            {formatDate(report.reputationAwardedAt)}
          </span>
        )}
      </div>

      <div
        className={cn(
          "grid gap-3",
          showBounty ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
        )}
      >
        {/* The platform's half */}
        <div className="rounded-xl border border-blue-500/25 bg-blue-500/5 p-4">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Sparkles className="size-4 shrink-0" />
            <span className="text-sm font-semibold">Reputation</span>
          </div>

          <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
            {isInformational ? (
              <span className="text-lg font-bold text-muted-foreground">
                No reputation
              </span>
            ) : (
              `+${points.toLocaleString()}`
            )}
          </p>

          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {isInformational
              ? "Credited as an informational finding, which scores nothing."
              : `Awarded by DevSolve for a ${report.confirmedSeverity.toLowerCase()} finding.`}
          </p>
        </div>

        {/* The organization's half */}
        {showBounty && (
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <Coins className="size-4 shrink-0" />
              <span className="text-sm font-semibold">Bounty</span>
            </div>

            <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
              {bountyTotal > 0 ? (
                `$${bountyTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              ) : (
                <span className="text-lg font-bold text-muted-foreground">
                  None yet
                </span>
              )}
            </p>

            <p className="mt-1.5 flex items-center gap-1.5 text-sm leading-relaxed text-muted-foreground">
              <Building2 className="size-3.5 shrink-0" />
              {bountyTotal > 0
                ? `Paid by ${report.program}${
                    report.rewards.length > 1
                      ? ` across ${report.rewards.length} awards`
                      : ""
                  }.`
                : `${report.program} has not awarded a bounty on this report.`}
            </p>
          </div>
        )}
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        Reputation is set by DevSolve from the finding&apos;s severity. Any
        bounty is decided and paid by the organization.
      </p>
    </motion.section>
  );
}
