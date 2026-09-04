"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle2, ShieldAlert, ThumbsUp, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  LeaderboardHighlight,
  LeaderboardHighlightKind,
} from "@/lib/types/leaderboard/types";
import ResearcherAvatar from "./ResearcherAvatar";
import { formatNumber, profileHref } from "./leaderboard-ui";

const ICONS: Record<LeaderboardHighlightKind, LucideIcon> = {
  reports: CheckCircle2,
  valid: CheckCircle2,
  critical: ShieldAlert,
  recognition: ThumbsUp,
  climb: TrendingUp,
};

const TONES: Record<LeaderboardHighlightKind, string> = {
  reports: "bg-blue-50 text-blue-700",
  valid: "bg-blue-50 text-blue-700",
  critical: "bg-rose-50 text-rose-700",
  recognition: "bg-emerald-50 text-emerald-700",
  climb: "bg-muted text-foreground",
};

export default function LeaderboardHighlights({
  highlights,
}: {
  highlights: LeaderboardHighlight[];
}) {
  return (
    <section aria-label="Standout researchers" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {highlights.map((highlight, i) => {
        const Icon = ICONS[highlight.kind];

        return (
          <motion.div
            key={highlight.kind}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 * i, ease: "easeOut" }}
          >
            <Link
              href={profileHref(highlight.username)}
              className="group flex h-full items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/5 transition-shadow hover:shadow-[0_10px_28px_-18px_rgba(37,99,235,0.5)] hover:ring-blue-500/40 dark:ring-foreground/10"
            >
              <div className="relative shrink-0">
                <ResearcherAvatar
                  username={highlight.username}
                  displayName={highlight.displayName}
                  avatarUrl={highlight.avatarUrl}
                  initials={highlight.avatarInitials}
                  size={44}
                />
                <span
                  className={`absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-card ${
                    TONES[highlight.kind]
                  }`}
                >
                  <Icon className="h-3 w-3" aria-hidden />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {highlight.label}
                </p>
                <p className="truncate text-sm font-semibold text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-400">
                  {highlight.displayName}
                </p>
              </div>

              <p className="shrink-0 text-right">
                <span className="block text-2xl font-bold leading-none tracking-tighter text-foreground">
                  {formatNumber(highlight.value)}
                </span>
                <span className="mt-1 block text-xs font-medium text-muted-foreground">
                  {highlight.unit}
                </span>
              </p>
            </Link>
          </motion.div>
        );
      })}
    </section>
  );
}
