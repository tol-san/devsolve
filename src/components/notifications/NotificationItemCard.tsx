"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Award,
  BadgeCheck,
  BookOpen,
  Building,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Gavel,
  Gift,
  Loader2,
  Mail,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  UserPlus,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Notification, NotificationType } from "@/lib/types/notifications/types";
import {
  useLazyGetCommentByIdQuery,
  type CommentResponse,
} from "@/lib/redux/services/commentsApi";
import { cn } from "@/lib/utils";

interface NotificationItemCardProps {
  item: Notification;
  isAdmin?: boolean;
  onMarkRead?: (id: string) => void;
  onCloseModal?: () => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  showCheckbox?: boolean;
}

interface NotificationTypeConfig {
  label: string;
  category: "security" | "rewards" | "community" | "team" | "system";
  icon: React.ComponentType<{ className?: string }>;
  iconContainerClass: string;
  badgeClass: string;
}

const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, NotificationTypeConfig> = {
  REPORT: {
    label: "Vulnerability Report",
    category: "security",
    icon: AlertTriangle,
    iconContainerClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20",
    badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
  SECURITY: {
    label: "Security Alert",
    category: "security",
    icon: ShieldAlert,
    iconContainerClass: "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20",
    badgeClass: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  },
  REWARD: {
    label: "Bounty Reward",
    category: "rewards",
    icon: Gift,
    iconContainerClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  RECOGNITION: {
    label: "Recognition Award",
    category: "rewards",
    icon: Award,
    iconContainerClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  PROGRAM: {
    label: "Bounty Program",
    category: "team",
    icon: Building2,
    iconContainerClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  ORGANIZATION: {
    label: "Organization",
    category: "team",
    icon: Building,
    iconContainerClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-indigo-500/20",
    badgeClass: "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  },
  INVITATION: {
    label: "Team Invitation",
    category: "team",
    icon: Mail,
    iconContainerClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-purple-500/20",
    badgeClass: "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
  },
  KYC: {
    label: "Identity & Verification",
    category: "system",
    icon: BadgeCheck,
    iconContainerClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-cyan-500/20",
    badgeClass: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  },
  COMMENT: {
    label: "Discussion Comment",
    category: "community",
    icon: MessageSquare,
    iconContainerClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-sky-500/20",
    badgeClass: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  PROBLEM: {
    label: "Community Problem",
    category: "community",
    icon: BookOpen,
    iconContainerClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  SOLUTION: {
    label: "Verified Solution",
    category: "community",
    icon: CheckCircle2,
    iconContainerClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 ring-teal-500/20",
    badgeClass: "border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300",
  },
  SHOWCASE: {
    label: "Solution Showcase",
    category: "community",
    icon: Sparkles,
    iconContainerClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-violet-500/20",
    badgeClass: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  USER: {
    label: "Member Follow",
    category: "community",
    icon: UserPlus,
    iconContainerClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  DISPUTE: {
    label: "Triage Dispute",
    category: "security",
    icon: Gavel,
    iconContainerClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
};

function getAdminNotificationLink(type: NotificationType, id: string): string {
  switch (type) {
    case "ORGANIZATION":
    case "KYC":
      return `/dashboard/company-verification/${id}`;
    case "PROGRAM":
      return `/dashboard/program-management/${id}?scope=admin`;
    case "PROBLEM":
      return `/dashboard/content-moderation/problems/${id}`;
    case "SHOWCASE":
      return `/dashboard/content-moderation/showcases/${id}`;
    case "SOLUTION":
      return `/dashboard/content-moderation/solutions/${id}`;
    case "USER":
      return "/dashboard/users";
    case "REPORT":
    case "DISPUTE":
      return "/dashboard/content-moderation?tab=queue";
    case "SECURITY":
      return "/dashboard/content-moderation";
    default:
      return "/dashboard";
  }
}

function getNotificationLink(
  type: NotificationType,
  id: string,
  isAdmin: boolean,
): string {
  if (isAdmin) return getAdminNotificationLink(type, id);

  switch (type) {
    case "PROBLEM":
      return `/community/${id}`;
    case "SHOWCASE":
      return `/showcases/${id}`;
    case "PROGRAM":
      return `/dashboard/programs/${id}`;
    case "ORGANIZATION":
      return `/dashboard/organizations/${id}`;
    case "REPORT":
      return `/dashboard/my-reports/${id}`;
    case "SOLUTION":
      return `/dashboard/my-community`;
    case "INVITATION":
      return `/dashboard/invitations`;
    case "KYC":
      return `/dashboard/organizations`;
    case "REWARD":
    case "RECOGNITION":
      return `/dashboard/rewards`;
    case "SECURITY":
      return id ? `/dashboard/report-management/${id}` : `/dashboard/report-management`;
    case "USER":
      return `/dashboard/profile`;
    case "COMMENT":
    case "DISPUTE":
    default:
      return `/dashboard`;
  }
}

function getCommentLink(comment: CommentResponse): string {
  const anchor = `#comment-${comment.id}`;

  switch (comment.commentableType) {
    case "PROBLEM":
      return `/community/${comment.commentableId}${anchor}`;
    case "SHOWCASE":
      return `/showcases/${comment.commentableId}${anchor}`;
    case "PROGRAM":
      return `/dashboard/programs/${comment.commentableId}${anchor}`;
    case "REPORT":
      return `/dashboard/my-reports/${comment.commentableId}${anchor}`;
    case "SOLUTION":
    default:
      return "/dashboard/my-community";
  }
}

function getInitials(name?: string | null): string {
  if (!name?.trim()) return "DV";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatNotificationTime(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr.endsWith("Z") ? dateStr : `${dateStr}Z`);
  if (isNaN(date.getTime())) return dateStr;

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const NotificationItemCard: React.FC<NotificationItemCardProps> = ({
  item,
  isAdmin = false,
  onMarkRead,
  onCloseModal,
  isSelected = false,
  onToggleSelect,
  showCheckbox = false,
}) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [resolveComment, { isFetching: isResolvingComment }] =
    useLazyGetCommentByIdQuery();

  const targetHref = getNotificationLink(
    item.notifiableType,
    item.notifiableId,
    isAdmin,
  );
  const isUnread = !item.read;
  const hasCommentAuthor =
    item.notifiableType === "COMMENT" &&
    Boolean(item.authorName || item.authorAvatarUrl);

  const config =
    NOTIFICATION_TYPE_CONFIG[item.notifiableType] ||
    NOTIFICATION_TYPE_CONFIG.COMMENT;
  const IconComponent = config.icon;

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // If user clicked directly on an input or button inside, do not trigger card navigation
    const target = event.target as HTMLElement;
    if (target.closest("button") || target.closest("input")) {
      return;
    }

    if (item.notifiableType === "COMMENT") {
      if (isResolvingComment) return;

      if (isUnread && item.id && onMarkRead) {
        onMarkRead(item.id);
      }

      void resolveComment(item.notifiableId)
        .unwrap()
        .then((comment) => {
          onCloseModal?.();
          router.push(getCommentLink(comment));
        })
        .catch(() => {
          toast.error("That comment could not be opened.");
        });
      return;
    }

    if (isUnread && item.id && onMarkRead) {
      onMarkRead(item.id);
    }
    if (onCloseModal) {
      onCloseModal();
    }
    router.push(targetHref);
  };

  const isLongContent = (item.content || "").length > 180;

  return (
    <motion.div
      layout
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "group relative flex items-start gap-3 px-5 py-3 transition-colors cursor-pointer select-none",
        isUnread
          ? "bg-primary/[0.025] hover:bg-muted/50 dark:bg-primary/[0.04]"
          : "bg-transparent hover:bg-muted/30",
        isSelected && "bg-muted",
      )}
    >
      {/* Optional Selection Checkbox */}
      {showCheckbox && item.id && (
        <div
          className="shrink-0 pt-1"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect?.(item.id!)}
            aria-label="Select notification"
            className="size-3.5 rounded border-border text-primary focus:ring-primary/40 cursor-pointer accent-primary"
          />
        </div>
      )}

      {/* Subtle unread dot */}
      <div className="shrink-0 pt-2 w-1.5 flex items-center justify-center">
        {isUnread && (
          <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
        )}
      </div>

      {/* Compact Understated Icon */}
      <div className="shrink-0 mt-0.5">
        {hasCommentAuthor ? (
          <Avatar className="size-7 sm:size-8 rounded-full border border-border">
            {item.authorAvatarUrl && (
              <AvatarImage
                src={item.authorAvatarUrl}
                alt={item.authorName || "Comment author"}
                className="object-cover"
              />
            )}
            <AvatarFallback className="font-bold text-[10px] bg-muted text-muted-foreground">
              {getInitials(item.authorName)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground group-hover:text-foreground transition-colors">
            <IconComponent className="size-3.5 sm:size-4" />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        {/* Top Meta: Type & Time */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
            <span className="font-medium text-foreground/80 truncate">
              {config.label}
            </span>
            {hasCommentAuthor && item.authorName && (
              <>
                <span>•</span>
                <span className="truncate">{item.authorName}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-muted-foreground tabular-nums">
            {isResolvingComment ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <span>{formatNotificationTime(item.createdAt)}</span>
            )}

            {/* Quick Mark Read on Hover */}
            {isUnread && item.id && onMarkRead && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead(item.id!);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                title="Mark as read"
              >
                <Check className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          className={cn(
            "text-sm leading-snug break-words transition-colors",
            isUnread
              ? "font-semibold text-foreground"
              : "font-medium text-foreground/90",
          )}
        >
          {item.title}
        </h3>

        {/* Formatted Body */}
        {item.content && (
          <div className="space-y-1">
            <p
              className={cn(
                "text-xs leading-relaxed text-muted-foreground break-words",
                !isExpanded && isLongContent && "line-clamp-2",
              )}
            >
              {item.content}
            </p>

            {isLongContent && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded((prev) => !prev);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer pt-0.5"
              >
                <span>{isExpanded ? "Show less" : "Read more"}</span>
                {isExpanded ? (
                  <ChevronUp className="size-3" />
                ) : (
                  <ChevronDown className="size-3" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
