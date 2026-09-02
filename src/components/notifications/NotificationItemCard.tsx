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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group relative flex items-start gap-3.5 sm:gap-4 rounded-2xl border p-4 sm:p-5 transition-all min-w-0 shadow-xs cursor-pointer select-none",
        isUnread
          ? "border-primary/30 bg-primary/5 hover:bg-primary/8 dark:bg-primary/10 dark:hover:bg-primary/15 ring-1 ring-primary/20"
          : "border-border bg-card text-card-foreground hover:bg-muted/40 hover:border-border/90 hover:shadow-xs",
        isSelected && "ring-2 ring-primary border-primary bg-primary/10",
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
            className="size-4 rounded-md border-border text-primary focus:ring-primary/40 cursor-pointer accent-primary"
          />
        </div>
      )}

      {/* Avatar or Themed Category Icon */}
      <div className="shrink-0 relative mt-0.5">
        {hasCommentAuthor ? (
          <Avatar className="size-10 sm:size-11 ring-2 ring-border shadow-xs">
            {item.authorAvatarUrl && (
              <AvatarImage
                src={item.authorAvatarUrl}
                alt={item.authorName || "Comment author"}
                className="object-cover"
              />
            )}
            <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
              {getInitials(item.authorName)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div
            className={cn(
              "flex size-10 sm:size-11 items-center justify-center rounded-2xl ring-1 shadow-2xs transition-transform group-hover:scale-105",
              config.iconContainerClass,
            )}
          >
            <IconComponent className="size-5" />
          </div>
        )}

        {/* Pulsing unread status dot */}
        {isUnread && (
          <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full size-2.5 bg-primary" />
          </span>
        )}
      </div>

      {/* Main Notification Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Top Badges & Meta Row */}
        <div className="flex items-center justify-between gap-2 min-w-0 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider truncate",
                config.badgeClass,
              )}
            >
              {config.label}
            </Badge>

            {hasCommentAuthor && item.authorName && (
              <span className="text-xs font-medium text-muted-foreground truncate">
                by <strong className="text-foreground font-semibold">{item.authorName}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isResolvingComment ? (
              <Loader2 className="size-3.5 animate-spin text-primary" />
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground tabular-nums">
                <Clock className="size-3 text-muted-foreground/70 shrink-0" />
                <span>{formatNotificationTime(item.createdAt)}</span>
              </span>
            )}

            {/* Quick Mark as Read Action Button */}
            {isUnread && item.id && onMarkRead && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead(item.id!);
                }}
                className="size-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer transition-colors"
                title="Mark as read"
              >
                <Check className="size-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold leading-snug text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors break-words">
          {item.title}
        </h3>

        {/* Formatted Content Body */}
        <div className="space-y-1">
          <p
            className={cn(
              "text-xs sm:text-sm font-normal leading-relaxed text-muted-foreground break-words",
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
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer pt-0.5"
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
      </div>
    </motion.div>
  );
};
