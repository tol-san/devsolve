"use client";

import { Clock, MessageSquareReply } from "lucide-react";

import { useNow } from "@/hooks/useNow";
import { formatDateTime, formatDuration } from "@/lib/format/datetime";
import { cn } from "@/lib/utils";

type ReportResponseTimeProps = {
  submittedAt: string | null | undefined;
  firstRespondedAt: string | null | undefined;
  className?: string;
};

/**
 * How long the report waited before anyone answered it.
 *
 * Measured from `firstRespondedAt`, which is stamped once when someone other
 * than the reporter first acts. Deliberately **not** from `triagedAt`: that is
 * overwritten by every re-triage, so a report answered in an hour and
 * re-triaged a month later would read as a month of silence.
 *
 * A null `firstRespondedAt` is shown, never hidden and never rendered as zero
 * — a report that has been waiting three weeks is the single most useful thing
 * this can tell a researcher. But it is stated as elapsed time, not as an
 * accusation: null is also what every report filed before this field existed
 * returns, and the two are indistinguishable from here, so the copy says how
 * long it has been rather than that anyone ignored it.
 */
export function ReportResponseTime({
  submittedAt,
  firstRespondedAt,
  className,
}: ReportResponseTimeProps) {
  /* Null during server rendering, which keeps the elapsed figure out of the
     HTML and so out of hydration's way — the clock is a client fact. */
  const now = useNow();

  if (!submittedAt) return null;

  const answered = Boolean(firstRespondedAt);
  const responseIn = answered
    ? formatDuration(submittedAt, firstRespondedAt)
    : now !== null
      ? formatDuration(submittedAt, now)
      : null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3.5",
        answered
          ? "border-emerald-500/25 bg-emerald-500/5"
          : "border-amber-500/25 bg-amber-500/5",
        className,
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
          answered
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        )}
      >
        {answered ? (
          <MessageSquareReply className="size-4" />
        ) : (
          <Clock className="size-4" />
        )}
      </span>

      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground">
          {answered ? "First response" : "Awaiting first response"}
        </p>

        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
          {answered ? (
            <>
              Answered in{" "}
              <strong className="text-foreground">{responseIn}</strong>
              {firstRespondedAt && (
                <> · {formatDateTime(firstRespondedAt, "")}</>
              )}
            </>
          ) : responseIn ? (
            <>
              Waiting{" "}
              <strong className="text-foreground">{responseIn}</strong> since
              you submitted it
              {/* The moment it is counting from. Elapsed time alone invites
                  "why does it say 7 hours?" on a report filed overnight —
                  the timestamp answers that without anyone having to ask. */}
              {" · "}
              {formatDateTime(submittedAt, "")}
            </>
          ) : (
            "No response has been recorded yet."
          )}
        </p>
      </div>
    </div>
  );
}
