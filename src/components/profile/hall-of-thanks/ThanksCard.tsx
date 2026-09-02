"use client";

import React from "react";
import { motion } from "motion/react";
import { Award, Clock, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { UserRecognitionItem } from "@/lib/types/thanks/types";
import { Badge } from "@/components/ui/badge";
import { formatFullDateTime, formatRelativeTime } from "@/components/thanks/thanks-utils";
import { cn } from "@/lib/utils";

interface ThanksCardProps {
  recognition: UserRecognitionItem;
}

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
  HIGH: "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  MEDIUM: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  LOW: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  NONE: "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

export default function ThanksCard({ recognition }: ThanksCardProps) {
  const sevKey = (recognition.severity ?? "NONE").toUpperCase();
  const sevStyle = SEVERITY_STYLES[sevKey] || SEVERITY_STYLES.NONE;
  const relativeDate = formatRelativeTime(recognition.awardedAt);
  const fullDate = formatFullDateTime(recognition.awardedAt);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-2xs transition-all duration-200 hover:border-border/80 hover:shadow-xs"
    >
      <div className="flex items-start gap-4">
        {/* Award Icon Badge */}
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-2xs">
          <Award className="size-5" />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm sm:text-base font-bold text-foreground truncate">
                {recognition.awardedBy || "Security Program"}
              </span>

              {recognition.programId && (
                <Link
                  href={`/programs/${recognition.programId}`}
                  className="text-xs text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-0.5"
                  title="View Program"
                >
                  <ExternalLink className="size-3" />
                </Link>
              )}
            </div>

            {recognition.severity && (
              <Badge
                variant="outline"
                className={cn("rounded-lg px-2 py-0.5 text-xs font-bold uppercase", sevStyle)}
              >
                {recognition.severity}
              </Badge>
            )}
          </div>

          <p className="text-sm font-semibold text-foreground/90 leading-snug">
            {recognition.title}
          </p>

          {recognition.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {recognition.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              <span>Verified Thank-You Award</span>
            </span>

            <span
              className="flex items-center gap-1 font-medium cursor-default"
              title={fullDate}
            >
              <Clock className="size-3 text-muted-foreground/70" />
              <span>{relativeDate}</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
