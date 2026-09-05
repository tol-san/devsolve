"use client";

import { Award } from "lucide-react";
import { ProfileBadge } from "@/lib/types/profile/types";
import BadgeItem from "./BadgeItem";

interface BadgesGridProps {
  badges: ProfileBadge[];
}

export default function BadgesGrid({ badges }: BadgesGridProps) {
  const unlockedCount = badges.filter((badge) => !badge.locked).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs sm:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Award className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Achievements</h2>
            <p className="text-xs text-muted-foreground">
              Milestones unlocked through research on the platform
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          {unlockedCount} of {badges.length}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {badges.map((badge) => (
          <BadgeItem key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  );
}
