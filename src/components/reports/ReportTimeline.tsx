"use client";

import {
  Activity,
  ArrowRight,
  Award,
  Bot,
  CheckCircle2,
  Clock,
  Coins,
  Eye,
  FileUp,
  RotateCcw,
  ShieldAlert,
  Sliders,
} from "lucide-react";
import { motion } from "motion/react";

import type {
  ReportActivity,
  ReportActivitySeverity,
  ReportActivityState,
} from "@/lib/types/reports/activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format/datetime";
import { cn } from "@/lib/utils";

type ReportTimelineProps = {
  activities: ReportActivity[];
  isLoading?: boolean;
  isError?: boolean;
  className?: string;
};

/** How each state reads, rather than as the constant the API sends. */
const STATE_LABEL: Record<ReportActivityState, string> = {
  NEW: "New",
  TRIAGING: "Triaging",
  NEEDS_MORE_INFO: "Needs more info",
  VALID_CONFIRMED: "Valid",
  RETESTING: "Retesting",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
  DUPLICATE: "Duplicate",
};

const SEVERITY_TONE: Record<ReportActivitySeverity, string> = {
  CRITICAL: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  HIGH: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  MEDIUM: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  LOW: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  NONE: "border-border bg-muted text-muted-foreground",
};

/**
 * The glyph and headline for an entry.
 *
 * Falls through to a neutral entry for a type this build has never heard of —
 * more will be added, and an unrecognised one still describes something that
 * happened to the report.
 */
function presentationFor(activity: ReportActivity): {
  Icon: typeof Activity;
  tone: string;
  headline: string;
} {
  switch (activity.activityType) {
    case "SUBMITTED":
      return {
        Icon: FileUp,
        tone: "border-blue-500 text-blue-500 bg-blue-500/10",
        headline: "Report submitted",
      };
    case "STATE_CHANGED":
      return {
        Icon: CheckCircle2,
        tone: "border-emerald-500 text-emerald-500 bg-emerald-500/10",
        headline: "State changed",
      };
    case "SEVERITY_CHANGED":
      return {
        Icon: Sliders,
        tone: "border-amber-500 text-amber-500 bg-amber-500/10",
        headline: "Severity settled",
      };
    case "REWARD_GRANTED":
      return {
        Icon: Coins,
        tone: "border-emerald-500 text-emerald-500 bg-emerald-500/10",
        headline: "Bounty recorded",
      };
    case "RETEST_REQUESTED":
      return {
        Icon: RotateCcw,
        tone: "border-cyan-500 text-cyan-500 bg-cyan-500/10",
        headline: "Retest requested",
      };
    case "RETEST_SUBMITTED":
      return {
        Icon: ShieldAlert,
        tone: "border-indigo-500 text-indigo-500 bg-indigo-500/10",
        headline: "Retest verdict submitted",
      };
    case "RETEST_EXPIRED":
      return {
        Icon: Clock,
        tone: "border-muted-foreground/40 text-muted-foreground bg-muted",
        headline: "Retest window closed",
      };
    case "DISCLOSURE_CHANGED":
      return {
        Icon: Eye,
        tone: "border-purple-500 text-purple-500 bg-purple-500/10",
        headline: "Disclosure status changed",
      };
    default:
      /* A type added after this build shipped. Shown, not swallowed. */
      return {
        Icon: Award,
        tone: "border-border text-muted-foreground bg-muted",
        headline: "Activity recorded",
      };
  }
}

/**
 * Everything that has happened to a report, oldest first.
 *
 * This is the record both sides argue from when a severity is disputed, so it
 * is deliberately literal: every entry the API returns is rendered, including
 * types this build does not recognise, and nothing is inferred that the API
 * did not say.
 *
 * An empty timeline is a normal answer, not a failure — it only records what
 * happened after the feature shipped, so older reports genuinely have none.
 */
export function ReportTimeline({
  activities,
  isLoading,
  isError,
  className,
}: ReportTimelineProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-border bg-card shadow-xs overflow-hidden",
        className,
      )}
    >
      <CardHeader className="bg-muted/40 border-b border-border/70 px-4 py-3.5 sm:px-6 sm:py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Activity className="size-4.5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold tracking-tight text-foreground">
              Timeline
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Everything that has happened to this report, oldest first
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {isLoading ? (
          <div className="space-y-3" aria-hidden>
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="h-16 animate-pulse rounded-xl bg-muted/50"
              />
            ))}
          </div>
        ) : isError ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            This report&apos;s activity could not be loaded.
          </p>
        ) : activities.length === 0 ? (
          /* Not an error and not a spinner: reports filed before the timeline
             existed have nothing recorded, which is worth saying plainly. */
          <p className="py-6 text-center text-sm text-muted-foreground">
            No recorded activity.
          </p>
        ) : (
          <ol className="space-y-3">
            {activities.map((activity, index) => {
              const { Icon, tone, headline } = presentationFor(activity);
              /* The transition is drawn from the states being present, not
                 from the type — so a future type that moves the report still
                 shows its move without this file being updated. */
              const hasTransition = Boolean(activity.fromState || activity.toState);
              const isSystem = activity.actor === null;

              return (
                <motion.li
                  key={activity.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(index, 8) * 0.03 }}
                  className="relative border-l-2 border-border pb-3 pl-7 last:pb-0"
                >
                  <span
                    className={cn(
                      "absolute -left-3.25 top-0.5 flex size-6 items-center justify-center rounded-full border-2 bg-background",
                      tone,
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>

                  <div className="rounded-xl border border-border/80 bg-muted/30 p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="text-sm font-bold text-foreground">
                        {headline}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(activity.createdAt, "")}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {/* A null actor is the platform acting, which is a fact.
                          It is never rendered as an unknown person. */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-sm font-medium",
                          isSystem
                            ? "text-muted-foreground"
                            : "text-foreground",
                        )}
                      >
                        {isSystem ? (
                          <>
                            <span className="flex size-5 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
                              <Bot className="size-3" />
                            </span>
                            System
                          </>
                        ) : (
                          activity.actor?.name
                        )}
                      </span>

                      {hasTransition && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                          {activity.fromState && (
                            <>
                              {STATE_LABEL[activity.fromState] ??
                                activity.fromState}
                              <ArrowRight className="size-3" />
                            </>
                          )}
                          <span className="text-foreground">
                            {activity.toState
                              ? (STATE_LABEL[activity.toState] ??
                                activity.toState)
                              : "—"}
                          </span>
                        </span>
                      )}

                      {activity.severity && (
                        <span
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-xs font-bold uppercase tracking-wide",
                            SEVERITY_TONE[activity.severity] ??
                              "border-border bg-muted text-muted-foreground",
                          )}
                        >
                          {activity.severity}
                        </span>
                      )}
                    </div>

                    {/* Written by the platform, so it is plain text — and it
                        is not the discussion, which lives in the comments. */}
                    {activity.detail && (
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {activity.detail}
                      </p>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
