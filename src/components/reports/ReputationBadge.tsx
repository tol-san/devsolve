import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type ReputationBadgeProps = {
  points: number | null | undefined;
  awardedAt: string | null | undefined;
  className?: string;
};

/**
 * What a finding earned, for scanning down a list.
 *
 * Renders nothing unless reputation was actually awarded. Three cases have to
 * stay distinguishable and only two of them are visible:
 *
 * - awarded, `> 0` — the badge, with the number the backend recorded
 * - awarded, `0` — an informational finding: credited, scores nothing, and
 *   said in words so it does not read as a missing value
 * - never awarded — unresolved, or resolved before reputation was automatic
 *   and deliberately not backfilled. Nothing is shown, because nothing is
 *   known; a `0` here would be a claim rather than a fact.
 */
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
