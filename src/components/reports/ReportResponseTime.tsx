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

export function ReportResponseTime({
  submittedAt,
  firstRespondedAt,
  className,
}: ReportResponseTimeProps) {
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
