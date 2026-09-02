"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Award,
  Building2,
  Clock,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import Link from "next/link";
import type { UserRecognitionItem } from "@/lib/types/thanks/types";
import { Badge } from "@/components/ui/badge";
import { formatFullDateTime, formatRelativeTime } from "@/components/thanks/thanks-utils";
import { cn } from "@/lib/utils";

interface ThanksCardProps {
  recognition: UserRecognitionItem;
}

const SEVERITY_BORDER: Record<string, string> = {
  CRITICAL: "border-l-red-500",
  HIGH: "border-l-orange-500",
  MEDIUM: "border-l-amber-500",
  LOW: "border-l-blue-500",
  NONE: "border-l-slate-400",
};

const SEVERITY_BADGE: Record<string, string> = {
  CRITICAL: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  HIGH: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  LOW: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  NONE: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export default function ThanksCard({ recognition }: ThanksCardProps) {
  const sevKey = (recognition.severity ?? "NONE").toUpperCase();
  const borderStyle = SEVERITY_BORDER[sevKey] || SEVERITY_BORDER.NONE;
  const badgeStyle = SEVERITY_BADGE[sevKey] || SEVERITY_BADGE.NONE;

  const relativeDate = formatRelativeTime(recognition.awardedAt);
  const fullDate = formatFullDateTime(recognition.awardedAt);

  const program = recognition.program;
  const orgName = program?.organizationName || "";
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
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs transition-all duration-200 hover:border-border/90 hover:shadow-xs",
        "border-l-4",
        borderStyle
      )}
    >
      <div className="space-y-3.5">
        {/* Top Row: Organization / Program Header & Hall of Thanks Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            {/* Organization / Program Avatar Logo */}
            {orgLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={orgLogoUrl}
                alt={orgName || "Organization"}
                className="size-10 sm:size-11 shrink-0 rounded-xl object-cover border border-border bg-muted/60 shadow-2xs"
              />
            ) : (
              <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/60 text-foreground font-bold text-sm shadow-2xs">
                <Building2 className="size-5 text-muted-foreground" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              {/* Main Headline: Company publicly thanked & recognized */}
              <div className="text-sm sm:text-base text-foreground font-normal leading-snug">
                {orgName ? (
                  orgHref ? (
                    <Link
                      href={orgHref}
                      className="font-bold text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {orgName}
                    </Link>
                  ) : (
                    <strong className="font-bold text-foreground">{orgName}</strong>
                  )
                ) : (
                  <strong className="font-bold text-foreground">{programName}</strong>
                )}
                {" publicly thanked & recognized for "}
                {programHref ? (
                  <Link
                    href={programHref}
                    className="font-bold text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1"
                  >
                    <span>{programName}</span>
                    <ExternalLink className="size-3 text-muted-foreground" />
                  </Link>
                ) : (
                  <strong className="font-bold text-foreground">{programName}</strong>
                )}
              </div>

              {/* Subtext: Organization Name & Timestamp */}
              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
                {orgName && (
                  <span className="font-medium text-foreground/80">{orgName}</span>
                )}
                {orgName && <span aria-hidden className="text-border">·</span>}
                <span title={fullDate} className="flex items-center gap-1">
                  <Clock className="size-3 text-muted-foreground/70" />
                  <span>{relativeDate}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Hall of Thanks Accolade Pill */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 shrink-0">
            <Award className="size-4 text-amber-500" />
            <span>Hall of Thanks</span>
          </div>
        </div>

        {/* Accolade Title */}
        <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-foreground">
          <Sparkles className="size-4 text-amber-500 shrink-0" />
          <span>{recognition.title}</span>
        </div>

        {/* Company Gratitude Message / Note */}
        {recognition.description && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 p-3.5 text-sm sm:text-base font-medium text-foreground leading-relaxed">
            &ldquo;{recognition.description}&rdquo;
          </div>
        )}

        {/* Metadata Chips Row: Severity & Company Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50">
          {recognition.severity && (
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide gap-1",
                badgeStyle
              )}
            >
              <ShieldAlert className="size-3.5" />
              <span>{recognition.severity}</span>
            </Badge>
          )}

          {orgName && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {orgLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={orgLogoUrl}
                  alt=""
                  className="size-3.5 rounded-full object-cover shrink-0"
                />
              ) : (
                <Building2 className="size-3.5 text-muted-foreground/80" />
              )}
              {orgHref ? (
                <Link
                  href={orgHref}
                  className="hover:text-foreground transition-colors"
                >
                  {orgName}
                </Link>
              ) : (
                <span>{orgName}</span>
              )}
            </span>
          )}

          {programName && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              <Tag className="size-3.5 text-muted-foreground/80" />
              <span>{programName}</span>
            </span>
          )}

          <div className="ml-auto sm:hidden flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-bold">
            <Award className="size-3.5 text-amber-500" />
            <span>Hall of Thanks</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
