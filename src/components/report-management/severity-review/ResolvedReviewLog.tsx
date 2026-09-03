"use client";

import Link from "next/link";
import { ArrowLeft, Coins, Lock, ShieldCheck, Sparkles } from "lucide-react";

import type { ReportManagementDetail } from "@/components/report-management/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format/datetime";
import { hasReputationAward } from "@/lib/reports/reputation";

type ResolvedReviewLogProps = {
  detail: ReportManagementDetail;
};

/**
 * What was decided and what it paid, on a report that is already resolved.
 *
 * Read-only on purpose. The severity form is a triage tool, and neither of the
 * things it does still applies here: the report cannot be approved again, and
 * editing the severity would change a label without changing the payment —
 * reputation is awarded once at resolution and never recomputed, so a
 * correction made now would leave the screen disagreeing with what the
 * researcher was actually given.
 *
 * Correcting a resolved report means reopening it first, which is an action
 * with its own button and its own consequences.
 */
export function ResolvedReviewLog({ detail }: ResolvedReviewLogProps) {
  const awarded = hasReputationAward({
    reputationPoints: detail.reputationPoints,
    reputationAwardedAt: detail.reputationAwardedAt,
  });
  const points = detail.reputationPoints ?? 0;
  const rewards = detail.rewards ?? [];
  const bountyTotal = rewards.reduce((sum, reward) => sum + reward.amount, 0);

  return (
    <Card className="rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 border-none shadow-xs min-w-0 overflow-hidden">
      <CardHeader className="gap-2 p-4 sm:p-6 pb-2 sm:pb-2 min-w-0">
        <CardTitle className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl font-bold tracking-tight text-foreground break-words">
          <ShieldCheck className="size-6 shrink-0 text-purple-500" />
          Review log
        </CardTitle>
        <p className="text-sm sm:text-base text-muted-foreground">
          What was decided on this report, and what it paid. Resolved reports
          are a record rather than a form.
        </p>
      </CardHeader>

      <CardContent className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <p className="text-sm font-medium text-muted-foreground">
              Final severity
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {detail.severity}
            </p>
          </div>

          <div className="rounded-xl border border-blue-500/25 bg-blue-500/5 p-4">
            <p className="flex items-center gap-1.5 text-sm font-medium text-blue-700 dark:text-blue-300">
              <Sparkles className="size-3.5" />
              Reputation
            </p>
            <p className="mt-1 text-lg font-bold text-foreground tabular-nums">
              {/* Absent on reports resolved before reputation became
                  automatic — those were deliberately not backfilled, so a
                  zero here would be a claim rather than a fact. */}
              {!awarded
                ? "—"
                : points === 0
                  ? "None (informational)"
                  : `+${points.toLocaleString()}`}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
            <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              <Coins className="size-3.5" />
              Bounty paid
            </p>
            <p className="mt-1 text-lg font-bold text-foreground tabular-nums">
              {bountyTotal > 0
                ? `$${bountyTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "None"}
            </p>
          </div>
        </div>

        {rewards.length > 0 && (
          <ul className="space-y-1.5">
            {rewards.map((reward, index) => (
              <li
                key={`${reward.awardedAt ?? index}`}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <span className="font-semibold text-foreground tabular-nums">
                  ${reward.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                {reward.note && (
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">
                    {reward.note}
                  </span>
                )}
                {reward.awardedAt && (
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(reward.awardedAt, "")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 p-3.5">
          <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            The severity can no longer be changed here. Reputation is awarded
            once when a report is resolved and is never recalculated, so
            editing it now would change the label without changing what the
            researcher was paid. Reopen the report first if it needs
            re-triaging.
          </p>
        </div>

        <Link
          href={`/dashboard/report-management/${detail.id}`}
          className="block"
        >
          <Button
            variant="outline"
            className="w-full rounded-xl font-semibold sm:w-auto"
          >
            <ArrowLeft data-icon="inline-start" />
            Back to the report
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
