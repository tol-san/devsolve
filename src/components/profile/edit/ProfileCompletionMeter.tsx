"use client";

import { motion } from "motion/react";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditProfileFormData } from "@/lib/types/profile/types";

interface ProfileCompletionMeterProps {
  values: EditProfileFormData;
  onFocusSection?: (sectionId: string) => void;
}

interface CompletionTask {
  id: string;
  label: string;
  weight: number;
  completed: boolean;
  sectionId: string;
}

export default function ProfileCompletionMeter({
  values,
  onFocusSection,
}: ProfileCompletionMeterProps) {
  const hasSocial = Boolean(
    values.socialLinks?.github ||
    values.socialLinks?.twitter ||
    values.socialLinks?.linkedin ||
    values.socialLinks?.website
  );

  const tasks: CompletionTask[] = [
    {
      id: "name",
      label: "Full Name",
      weight: 15,
      completed: Boolean(values.fullName?.trim()),
      sectionId: "section-identity",
    },
    {
      id: "avatar",
      label: "Profile Avatar",
      weight: 15,
      completed: Boolean(values.avatarUrl),
      sectionId: "section-media",
    },
    {
      id: "bio",
      label: "Research Bio",
      weight: 20,
      completed: Boolean(values.bio?.trim() && values.bio.trim().length >= 10),
      sectionId: "section-bio",
    },
    {
      id: "cover",
      label: "Cover Banner",
      weight: 10,
      completed: Boolean(values.coverUrl),
      sectionId: "section-media",
    },
    {
      id: "location",
      label: "Location / Country",
      weight: 10,
      completed: Boolean(values.location?.trim()),
      sectionId: "section-identity",
    },
    {
      id: "social",
      label: "Social Profiles",
      weight: 15,
      completed: hasSocial,
      sectionId: "section-social",
    },
    {
      id: "personal",
      label: "Personal Details",
      weight: 15,
      completed: Boolean(values.phone?.trim() || values.dateOfBirth || values.gender),
      sectionId: "section-personal",
    },
  ];

  const score = tasks.reduce(
    (acc, task) => acc + (task.completed ? task.weight : 0),
    0
  );

  const pendingTasks = tasks.filter((t) => !t.completed);

  const getScoreColor = (value: number) => {
    if (value >= 90) return "text-emerald-600 dark:text-emerald-400";
    if (value >= 60) return "text-blue-600 dark:text-blue-400";
    if (value >= 30) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getBarColor = (value: number) => {
    if (value >= 90) return "bg-emerald-500";
    if (value >= 60) return "bg-blue-600";
    if (value >= 30) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </span>
            <h3 className="text-base font-bold text-foreground">
              Profile Completeness
            </h3>
            <span
              className={cn(
                "ml-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset",
                score === 100
                  ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400"
                  : "bg-primary/10 text-primary ring-primary/20"
              )}
            >
              {score}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {score === 100
              ? "Your profile is fully completed and verified for community rankings!"
              : "Complete all fields to boost your credibility across programs & leaderboards."}
          </p>
        </div>

        <div className="w-full sm:w-56 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground">
            <span>Progress</span>
            <span className={getScoreColor(score)}>{score}/100</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn("h-full rounded-full transition-all", getBarColor(score))}
            />
          </div>
        </div>
      </div>

      {pendingTasks.length > 0 && (
        <div className="mt-4 border-t border-border/70 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recommended actions:
          </p>
          <div className="flex flex-wrap gap-2">
            {pendingTasks.slice(0, 4).map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onFocusSection?.(task.sectionId)}
                className="group flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
              >
                <span>+{task.weight}% {task.label}</span>
                <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
