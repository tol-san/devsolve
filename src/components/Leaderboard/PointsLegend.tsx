"use client";

import { motion, useReducedMotion } from "motion/react";
import { REPUTATION_POINTS } from "@/lib/types/leaderboard/types";

const ITEMS: { label: string; points: number; dot: string; glow: string }[] = [
  {
    label: "Critical",
    points: REPUTATION_POINTS.critical,
    dot: "bg-rose-500",
    glow: "rgba(244,63,94,0.35)",
  },
  {
    label: "High",
    points: REPUTATION_POINTS.high,
    dot: "bg-orange-500",
    glow: "rgba(249,115,22,0.35)",
  },
  {
    label: "Medium",
    points: REPUTATION_POINTS.medium,
    dot: "bg-amber-500",
    glow: "rgba(245,158,11,0.35)",
  },
  {
    label: "Low",
    points: REPUTATION_POINTS.low,
    dot: "bg-muted-foreground",
    glow: "rgba(115,115,115,0.35)",
  },
];

/**
 * How reputation is earned. Deliberately stated in points, not payouts — a
 * Critical at a startup and a Critical at a bank move the board identically.
 *
 * Severity is the whole ladder: the platform pays this automatically when a
 * report is resolved. Recognition used to appear here for +25 and no longer
 * does — it is public credit and awards no reputation.
 */
export default function PointsLegend({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground">Points per finding</span>

      {ITEMS.map((item, i) => (
        <motion.span
          key={item.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.04 * i, ease: "easeOut" }}
          whileHover={
            reduce
              ? undefined
              : {
                  y: -2,
                  // Hairline picks up the item's own hue on hover
                  boxShadow: `0 0 0 1px ${item.glow}, 0 6px 16px -8px ${item.glow}`,
                }
          }
          className="group inline-flex cursor-default items-center gap-1.5 rounded-lg bg-card px-2.5 py-1 text-sm font-medium text-muted-foreground ring-1 ring-foreground/5 dark:ring-foreground/10"
        >
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full transition-transform duration-200 group-hover:scale-150 ${item.dot}`}
          />
          {item.label}
          <span className="font-bold tabular-nums text-foreground">
            +{item.points}
          </span>
        </motion.span>
      ))}
    </div>
  );
}
