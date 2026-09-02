"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Award,
  Building2,
  Clock,
  ExternalLink,
  Quote,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type { UserRecognitionItem } from "@/lib/types/thanks/types";
import { Badge } from "@/components/ui/badge";
import { formatFullDateTime, formatRelativeTime } from "@/components/thanks/thanks-utils";
import { cn } from "@/lib/utils";

interface ThanksCardProps {
  recognition: UserRecognitionItem;
}

const SEVERITY_CONFIG: Record<
  string,
  {
    badge: string;
    border: string;
    gradient: string;
  }
> = {
  CRITICAL: {
    badge: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    border: "hover:border-red-500/30",
    gradient: "from-red-500/60 via-red-500/30 to-transparent",
  },
  HIGH: {
    badge: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    border: "hover:border-orange-500/30",
    gradient: "from-orange-500/60 via-orange-500/30 to-transparent",
  },
  MEDIUM: {
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    border: "hover:border-amber-500/30",
    gradient: "from-amber-500/60 via-amber-500/30 to-transparent",
  },
  LOW: {
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    border: "hover:border-blue-500/30",
    gradient: "from-blue-500/60 via-blue-500/30 to-transparent",
  },
  NONE: {
    badge: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    border: "hover:border-border",
    gradient: "from-slate-400/40 via-slate-400/15 to-transparent",
  },
};

export default function ThanksCard({ recognition }: ThanksCardProps) {
  const sevKey = (recognition.severity ?? "NONE").toUpperCase();
  const sev = SEVERITY_CONFIG[sevKey] || SEVERITY_CONFIG.NONE;

  const relativeDate = formatRelativeTime(recognition.awardedAt);
  const fullDate = formatFullDateTime(recognition.awardedAt);

  const program = recognition.program;
  const orgName = program?.organizationName || "Security Team";
  const orgLogoUrl = program?.organizationLogoUrl || null;
  const orgHref = program?.organizationSlug
    ? `/company/${program.organizationSlug}`
    : program?.organizationId
      ? `/company?id=${program.organizationId}`
      : null;
  const programName = program?.name || recognition.programName || recognition.awardedBy || "Security Program";

  const programHref = program?.handle
    ? `/programs/${program.handle}`
    : program?.id
      ? `/programs/${program.id}`
      : recognition.programId
        ? `/programs/${recognition.programId}`
        : null;

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs transition-all duration-200 hover:shadow-xs",
        sev.border
      )}
    >
      {/* Subtle top severity accent gradient */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r",
          sev.gradient
        )}
      />

      <div className="space-y-4">
        {/* Header: Organization & Program Info + Hall of Thanks Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            {/* Organization Logo */}
            {orgLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={orgLogoUrl}
                alt={orgName}
                className="size-11 sm:size-12 shrink-0 rounded-xl object-cover border border-border bg-muted/50 shadow-2xs"
              />
            ) : (
              <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/60 text-muted-foreground shadow-2xs">
                <Building2 className="size-5" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {orgHref ? (
                  <Link
                    href={orgHref}
                    className="font-bold text-base sm:text-lg text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {orgName}
                  </Link>
                ) : (
                  <h4 className="font-bold text-base sm:text-lg text-foreground">
                    {orgName}
                  </h4>
                )}

                {recognition.severity && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider gap-1",
                      sev.badge
                    )}
                  >
                    <ShieldAlert className="size-3" />
                    <span>{recognition.severity}</span>
                  </Badge>
                )}
              </div>

              {/* Program Link & Time */}
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">recognized for</span>
                {programHref ? (
                  <Link
                    href={programHref}
                    className="font-semibold text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 truncate max-w-[200px] sm:max-w-xs"
                  >
                    <span className="truncate">{programName}</span>
                    <ExternalLink className="size-3 shrink-0 opacity-70" />
                  </Link>
                ) : (
                  <span className="font-semibold text-foreground truncate">{programName}</span>
                )}
                <span aria-hidden className="text-border">·</span>
                <span title={fullDate} className="flex items-center gap-1 shrink-0">
                  <Clock className="size-3 text-muted-foreground/70" />
                  <span>{relativeDate}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Hall of Thanks Accolade Pill */}
          <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 shrink-0 shadow-2xs">
            <Award className="size-3.5 text-amber-500" />
            <span>Hall of Thanks</span>
          </div>
        </div>

        {/* Accolade Recognition Title */}
        <div className="flex items-center gap-2 rounded-xl bg-muted/40 dark:bg-muted/20 border border-border/60 px-3.5 py-2 text-sm text-foreground">
          <Sparkles className="size-4 text-amber-500 shrink-0" />
          <span className="font-bold text-foreground text-sm">{recognition.title}</span>
        </div>

        {/* Executive Gratitude Note */}
        {recognition.description && (
          <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/[0.04] dark:bg-amber-500/[0.06] p-4 text-sm text-foreground leading-relaxed">
            <Quote className="absolute right-3.5 top-3 size-7 text-amber-500/15 dark:text-amber-500/10 pointer-events-none rotate-180" />
            <p className="relative z-10 italic font-medium text-foreground text-sm sm:text-base">
              &ldquo;{recognition.description}&rdquo;
            </p>
            <p className="relative z-10 text-[11px] font-semibold text-muted-foreground mt-2 flex items-center gap-1.5">
              <span>Appreciation note from</span>
              <span className="font-bold text-foreground/90">{orgName}</span>
            </p>
          </div>
        )}
      </div>
    </motion.article>
  );
}
