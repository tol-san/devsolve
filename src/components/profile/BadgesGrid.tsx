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
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {badges.map((badge) => (
          <BadgeItem key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  );
}
