"use client";

import React, { useState } from "react";
import {
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  Globe,
  History,
  Info,
  Paperclip,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { motion } from "motion/react";

import type { RetestSummary } from "@/lib/redux/services/reportsApi";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format/datetime";
import {
  awaitingVerdictLabel,
  formatBountyAmount,
  hasBountyReward,
  retestAttemptStatus,
  retestDeadline,
  verdictDueLabel,
} from "@/lib/reports/retest";
import { cn } from "@/lib/utils";

type RetestHistoryTimelineProps = {
  history: RetestSummary[];
  audience?: "reporter" | "organization";
  className?: string;
};

export function RetestHistoryTimeline({
  history,
  audience = "organization",
  className,
}: RetestHistoryTimelineProps) {
  const [copiedEndpointId, setCopiedEndpointId] = useState<string | null>(null);

  if (!history || history.length === 0) {
    return null;
  }

  const handleCopyEndpoint = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEndpointId(id);
      setTimeout(() => setCopiedEndpointId(null), 2000);
    } catch {
      // ignore
    }
  };

  const attemptsWithBonus = history.filter((attempt) =>
    hasBountyReward(attempt.bountyReward),
  );

  return (
    <Card
      className={cn(
        "rounded-2xl border border-border bg-card shadow-xs overflow-hidden",
        className,
      )}
    >
      <CardHeader className="bg-muted/40 border-b border-border/70 px-4 py-3.5 sm:px-6 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
              <History className="size-4.5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold tracking-tight text-foreground">
                Retest history
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Each time the fix was sent back to the researcher to re-run
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs font-semibold rounded-full border-border bg-background px-3 py-1"
            >
              {history.length} {history.length === 1 ? "attempt" : "attempts"}
            </Badge>
            {attemptsWithBonus.length > 0 && (
              <Badge
                variant="outline"
                className="text-xs font-bold rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3 py-1 flex items-center gap-1"
              >
                <Coins className="size-3 text-emerald-500" />
                <span>
                  {attemptsWithBonus.length === 1
                    ? `${formatBountyAmount(attemptsWithBonus[0].bountyReward)} bonus`
                    : `${attemptsWithBonus.length} bonuses offered`}
                </span>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-5">
        <div className="space-y-4">
          {history.map((attempt, index) => {
            const status = retestAttemptStatus(attempt);
            const isOpen = status === "AWAITING_VERDICT";
            const isPassed = attempt.verdict === "VERIFIED_FIXED";
            const isFailed = attempt.verdict === "STILL_VULNERABLE";
            const isClosedWithoutVerdict = status === "CLOSED_WITHOUT_VERDICT";
            const attemptId = attempt.id || `attempt-${index}`;

            const deadline = retestDeadline(attempt.dueAt);
            const deadlineLabel =
              audience === "reporter"
                ? verdictDueLabel(attempt.dueAt)
                : awaitingVerdictLabel(attempt.dueAt);
            const bonus = hasBountyReward(attempt.bountyReward)
              ? formatBountyAmount(attempt.bountyReward)
              : null;
            const evidenceCount = attempt.attachmentIds?.length ?? 0;

            return (
              <motion.div
                key={attemptId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className="relative pl-7 pb-4 border-l-2 border-border last:pb-0"
              >
                <div
                  className={cn(
                    "absolute -left-3.25 top-1 flex size-6 items-center justify-center rounded-full border-2 bg-background shadow-xs",
                    isPassed && "border-emerald-500 text-emerald-500 bg-emerald-500/10",
                    isFailed && "border-red-500 text-red-500 bg-red-500/10",
                    isClosedWithoutVerdict &&
                      "border-muted-foreground/40 text-muted-foreground bg-muted",
                    isOpen && "border-blue-500 text-blue-500 bg-blue-500/10",
                  )}
                >
                  {isPassed ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : isFailed ? (
                    <ShieldAlert className="size-3.5" />
                  ) : isClosedWithoutVerdict ? (
                    <Info className="size-3.5" />
                  ) : (
                    <RotateCcw className="size-3 animate-spin-slow" />
                  )}
                </div>

                <div className="rounded-2xl border border-border/80 bg-muted/30 hover:bg-muted/40 transition-colors p-4 space-y-3.5 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-foreground tracking-tight">
                        Attempt #{attempt.attemptNumber || index + 1}
                      </span>

                      {attempt.environment && (
                        <Badge
                          variant="outline"
                          className="text-xs font-bold px-2 py-0.5 rounded-md border-border bg-background uppercase tracking-wider"
                        >
                          {attempt.environment}
                        </Badge>
                      )}

                      {bonus && (
                        <Badge
                          variant="outline"
                          className="text-xs font-bold px-2 py-0.5 rounded-md border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center gap-1"
                        >
                          <Coins className="size-3 text-emerald-500" />
                          <span>{bonus} bonus</span>
                        </Badge>
                      )}
                    </div>

                    {isPassed ? (
                      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                        <ShieldCheck className="size-3.5" />
                        <span>VERIFIED FIXED</span>
                      </Badge>
                    ) : isFailed ? (
                      <Badge className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                        <ShieldAlert className="size-3.5" />
                        <span>STILL VULNERABLE</span>
                      </Badge>
                    ) : isClosedWithoutVerdict ? (
                      <Badge
                        variant="outline"
                        className="border-border bg-muted/80 text-muted-foreground font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1.5"
                      >
                        <Clock className="size-3.5" />
                        <span>CLOSED WITHOUT A VERDICT</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1.5"
                      >
                        <Clock className="size-3.5 text-blue-500" />
                        <span>AWAITING VERDICT</span>
                      </Badge>
                    )}
                  </div>

                  {isOpen && deadlineLabel && (
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold",
                        deadline?.isOverdue
                          ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
                          : deadline?.isUrgent
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                            : "border-blue-500/25 bg-blue-500/5 text-blue-700 dark:text-blue-300",
                      )}
                    >
                      <CalendarClock className="size-4 shrink-0" />
                      <span>{deadlineLabel}</span>
                    </div>
                  )}

                  {attempt.targetEndpoint && (
                    <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground font-mono bg-background/80 px-3 py-1.5 rounded-xl border border-border/70">
                      <div className="flex items-center gap-2 min-w-0">
                        <Globe className="size-3.5 shrink-0 text-blue-500" />
                        <span className="truncate">{attempt.targetEndpoint}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyEndpoint(attempt.targetEndpoint || "", attemptId)
                        }
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                        title="Copy target endpoint"
                      >
                        {copiedEndpointId === attemptId ? (
                          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                            <Check className="size-3" />
                            Copied
                          </span>
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="rounded-xl border border-border/60 bg-background/60 p-3 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="font-bold text-foreground">Requested</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(attempt.requestedAt, "")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {attempt.requestNotes || "No instructions were given."}
                      </p>
                      {attempt.requestedBy?.name && (
                        <p className="text-xs text-muted-foreground/80 font-medium">
                          By {attempt.requestedBy.name}
                        </p>
                      )}
                    </div>

                    <div
                      className={cn(
                        "rounded-xl border p-3 space-y-1.5",
                        isPassed
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : isFailed
                            ? "border-red-500/30 bg-red-500/5"
                            : "border-border/60 bg-background/60",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          {isClosedWithoutVerdict ? (
                            <>
                              <Info className="size-3.5 text-muted-foreground" />
                              <span>Outcome</span>
                            </>
                          ) : (
                            <>
                              <User className="size-3.5 text-muted-foreground" />
                              <span>Researcher</span>
                            </>
                          )}
                        </span>
                        {attempt.completedAt && (
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(attempt.completedAt, "")}
                          </span>
                        )}
                      </div>

                      {isOpen ? (
                        <p className="text-sm text-muted-foreground italic leading-relaxed">
                          No verdict yet.
                        </p>
                      ) : (
                        <>
                          <p className="text-sm text-foreground leading-relaxed font-medium">
                            {attempt.resultNotes ||
                              (isClosedWithoutVerdict
                                ? "This attempt was closed before a verdict was given."
                                : "No notes were left.")}
                          </p>
                          {attempt.verdict && attempt.completedBy?.name && (
                            <p className="text-xs text-muted-foreground/80 font-medium">
                              By {attempt.completedBy.name}
                            </p>
                          )}
                          {evidenceCount > 0 && (
                            <p className="text-xs text-muted-foreground/80 font-medium flex items-center gap-1.5">
                              <Paperclip className="size-3" />
                              {evidenceCount}{" "}
                              {evidenceCount === 1 ? "attachment" : "attachments"}{" "}
                              submitted as evidence
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
