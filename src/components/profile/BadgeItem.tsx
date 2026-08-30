"use client";

import { motion } from "motion/react";
import {
  Activity,
  Award,
  CheckCircle,
  Crown,
  Lock,
  LucideIcon,
  Shield,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { ProfileBadge } from "@/lib/types/profile/types";

const ICON_MAP: Record<ProfileBadge["icon"], LucideIcon> = {
  trophy: Trophy,
  shield: Shield,
  zap: Zap,
  activity: Activity,
  star: Star,
  target: Target,
  crown: Crown,
  check: CheckCircle,
};

interface BadgeItemProps {
  badge: ProfileBadge;
}

export default function BadgeItem({ badge }: BadgeItemProps) {
  const Icon = ICON_MAP[badge.icon] ?? Award;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={`group relative flex flex-col items-center justify-center gap-2.5 rounded-2xl border p-4 text-center transition-all ${
        badge.locked
          ? "border-border/60 bg-muted/30 text-muted-foreground opacity-60"
          : "border-border bg-card shadow-2xs hover:border-primary/30 hover:shadow-xs"
      }`}
    >
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105 ${
          badge.locked
            ? "bg-muted text-muted-foreground"
            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20"
        }`}
      >
        {badge.locked ? <Lock className="size-5" /> : <Icon className="size-6" />}
      </div>

      <div className="w-full space-y-1">
        <p
          className={`text-xs sm:text-sm font-bold leading-snug wrap-break-word ${
            badge.locked ? "text-muted-foreground" : "text-foreground"
          }`}
        >
          {badge.label}
        </p>
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            badge.locked
              ? "bg-muted text-muted-foreground"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {badge.locked ? "Locked" : "Unlocked"}
        </span>
      </div>
    </motion.div>
  );
}
