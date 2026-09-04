import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type ReputationBadgeProps = {
  points: number | null | undefined;
  awardedAt: string | null | undefined;
  className?: string;
};

export function ReputationBadge({
  points,
  awardedAt,
  className,
}: ReputationBadgeProps) {
  if (!awardedAt || points == null) return null;

  const isInformational = points === 0;

  return (
    <span
      title={
        isInformational
          ? "Credited as informational — scores no reputation"
          : "Reputation awarded by DevSolve for this finding"
      }
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-bold",
        isInformational
          ? "border-border bg-muted text-muted-foreground"
          : "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
        className,
      )}
    >
      <Sparkles className="size-3 shrink-0" />
      {isInformational ? (
        "No reputation"
      ) : (
        <span className="tabular-nums">+{points.toLocaleString()} rep</span>
      )}
    </span>
  );
}
