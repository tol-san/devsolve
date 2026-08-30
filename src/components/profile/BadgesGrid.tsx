"use client";

import { Award } from "lucide-react";
import { ProfileBadge } from "@/lib/types/profile/types";
import BadgeItem from "./BadgeItem";

interface BadgesGridProps {
  badges: ProfileBadge[];
}

export default function BadgesGrid({ badges }: BadgesGridProps) {
  const unlockedCount = badges.filter((b) => !b.locked).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <Award className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              Badges & Achievements
            </h2>
            <p className="text-xs text-muted-foreground">
              Milestone awards earned through security disclosures and activity
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          {unlockedCount} / {badges.length} unlocked
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {badges.map((badge) => (
          <BadgeItem key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  );
}
