"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { AlertTriangle, Clock, Info, Pencil, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useGetAutoReviewQuery } from "@/lib/redux/services/autoReviewsApi";
import { useGetNotificationsQuery } from "@/lib/redux/services/notificationsApi";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/types/notifications/types";

const AUTO_APPROVAL_HOLD_PATTERN = /^Your (problem|showcase) is waiting for review$/;

interface AutoApprovalHoldNoticeProps {
  notifiableId: string;
  notifiableType: "PROBLEM" | "SHOWCASE";
  isAuthor: boolean;
  isPending: boolean;
  editHref?: string;
  className?: string;
}

export function AutoApprovalHoldNotice({
  notifiableId,
  notifiableType,
  isAuthor,
  isPending,
  editHref,
  className = "",
}: AutoApprovalHoldNoticeProps) {
  const shouldFetch = isAuthor && isPending && Boolean(notifiableId);

  // 1. Primary: fetch explicit auto-review verdict
  const { data: verdict, isSuccess: hasVerdict } = useGetAutoReviewQuery(
    { target: notifiableType, contentId: notifiableId },
    { skip: !shouldFetch },
  );

  // 2. Fallback: notification stream for backwards compatibility if verdict not available yet
  const { data: notificationPage } = useGetNotificationsQuery(
    { unreadOnly: false, pageNumber: 0, pageSize: 50 },
    { skip: !shouldFetch || hasVerdict },
  );

  const fallbackNotice: Notification | null = useMemo(() => {
    if (!shouldFetch || hasVerdict || !notificationPage?.content) return null;

    const matches = notificationPage.content.filter(
      (item) =>
        item.notifiableId === notifiableId &&
        item.notifiableType?.toUpperCase() === notifiableType &&
        Boolean(item.title && AUTO_APPROVAL_HOLD_PATTERN.test(item.title)),
    );

    if (matches.length === 0) return null;

    return matches.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
  }, [shouldFetch, hasVerdict, notificationPage, notifiableId, notifiableType]);

  // If approved or post is live, don't render a banner
  if (verdict?.status === "APPROVED") {
    return null;
  }

  // Handle NOT_CHECKED state (neutral tone, no urgent edit prompt)
  if (verdict && verdict.status === "NOT_CHECKED") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`rounded-2xl border border-border/80 bg-muted/30 p-4 sm:p-5 shadow-xs ${className}`}
        role="region"
        aria-label="Submission review status explanation"
      >
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground border border-border/70 mt-0.5">
            <Clock className="size-4.5" aria-hidden="true" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">
                Awaiting moderator review
              </h2>
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground border border-border/60">
                <Info className="size-3" aria-hidden="true" />
                Queue Status
              </span>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground break-words">
              {verdict.message}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Handle HELD state or fallback hold notice (warning tone with Edit action)
  const isHeld = verdict?.status === "HELD" || Boolean(fallbackNotice);
  const message = verdict?.message || fallbackNotice?.content;

  if (!isHeld || !message) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`rounded-2xl border border-amber-500/35 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 shadow-xs ${className}`}
      role="region"
      aria-label="Submission review status explanation"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 mt-0.5">
            <AlertTriangle className="size-4.5" aria-hidden="true" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">
                Waiting for moderator review
              </h2>
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300 border border-amber-500/20">
                <Sparkles className="size-3" aria-hidden="true" />
                Automatic Check
              </span>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground break-words">
              {message}
            </p>
          </div>
        </div>

        {editHref && (
          <div className="shrink-0 pl-12 sm:pl-0">
            <Link
              href={editHref}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-xl border-amber-500/30 text-xs font-semibold hover:bg-amber-500/10 hover:text-amber-900 dark:hover:text-amber-200 cursor-pointer shadow-2xs",
              )}
            >
              <Pencil className="size-3.5 mr-1.5" aria-hidden="true" />
              <span>Edit Submission</span>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
