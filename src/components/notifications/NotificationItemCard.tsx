"use client";

import React, { useState } from "react";
import Link from "next/link";
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
}

export type NotificationSemanticStatus = "accepted" | "rejected" | "pending" | "info";

interface StatusStyleConfig {
  iconContainerClass: string;
  solidBadgeClass: string;
  statusBadgeClass: string;
}

export const NOTIFICATION_STATUS_STYLES: Record<NotificationSemanticStatus, StatusStyleConfig> = {
  accepted: {
    iconContainerClass:
      "bg-emerald-500/12 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 ring-1 ring-emerald-500/25",
    solidBadgeClass: "bg-emerald-600 text-white ring-2 ring-card",
    statusBadgeClass:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  rejected: {
    iconContainerClass:
      "bg-rose-500/12 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 ring-1 ring-rose-500/25",
    solidBadgeClass: "bg-rose-600 text-white ring-2 ring-card",
    statusBadgeClass:
      "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
  pending: {
    iconContainerClass:
      "bg-amber-500/12 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 ring-1 ring-amber-500/25",
    solidBadgeClass: "bg-amber-500 text-white ring-2 ring-card",
    statusBadgeClass:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  info: {
    iconContainerClass:
      "bg-muted/80 text-muted-foreground ring-1 ring-border/60",
    solidBadgeClass: "bg-muted-foreground text-background ring-2 ring-card",
    statusBadgeClass:
      "border-border/60 bg-muted/40 text-muted-foreground",
  },
};

export function resolveNotificationStatus(item: Notification): {
  status: NotificationSemanticStatus;
  statusLabel: string | null;
} {
  const title = (item.title || "").toLowerCase();
  const content = (item.content || "").toLowerCase();
  const combined = `${title} ${content}`;

  // 1. Pending / Waiting for review (Orange)
  if (
    combined.includes("waiting for review") ||
    combined.includes("under review") ||
    combined.includes("in review") ||
    combined.includes("awaiting review") ||
    combined.includes("pending review") ||
    combined.includes("pending approval") ||
    combined.includes("pending") ||
    combined.includes("awaiting") ||
    combined.includes("on hold") ||
    item.notifiableType === "DISPUTE"
  ) {
    return { status: "pending", statusLabel: "Pending review" };
  }

  // 2. Rejected / Declined / Failed / Danger / Security (Red)
  if (
    combined.includes("rejected") ||
    combined.includes("declined") ||
    combined.includes("denied") ||
    combined.includes("disapproved") ||
    combined.includes("failed") ||
    combined.includes("removed") ||
    combined.includes("suspended") ||
    combined.includes("banned") ||
    combined.includes("security alert") ||
    item.notifiableType === "SECURITY"
  ) {
    let label = "Declined";
    if (combined.includes("failed")) label = "Failed";
    else if (combined.includes("rejected")) label = "Rejected";
    else if (combined.includes("denied")) label = "Denied";
    else if (combined.includes("suspended") || combined.includes("banned")) label = "Suspended";
    else if (item.notifiableType === "SECURITY") label = "Security Alert";
    return { status: "rejected", statusLabel: label };
  }

  // 3. Accepted / Approved / Published / Resolved / Verified (Green)
  if (
    combined.includes("approved") ||
    combined.includes("accepted") ||
    combined.includes("published") ||
    combined.includes("is now live") ||
    combined.includes("resolved") ||
    combined.includes("verified") ||
    combined.includes("reward") ||
    combined.includes("awarded") ||
    item.notifiableType === "REWARD" ||
    item.notifiableType === "RECOGNITION"
  ) {
    let label = "Approved";
    if (combined.includes("published") || combined.includes("is now live")) label = "Published";
    else if (combined.includes("resolved")) label = "Resolved";
    else if (combined.includes("verified")) label = "Verified";
    else if (combined.includes("reward") || combined.includes("awarded")) label = "Rewarded";
    else if (combined.includes("accepted")) label = "Accepted";
    return { status: "accepted", statusLabel: label };
  }

  // 4. Default / Informational
  return { status: "info", statusLabel: null };
}

const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, NotificationTypeConfig> = {
  REPORT: {
    label: "Vulnerability Report",
    category: "security",
    icon: AlertTriangle,
  },
  SECURITY: {
    label: "Security Alert",
    category: "security",
    icon: ShieldAlert,
  },
  REWARD: {
    label: "Bounty Reward",
    category: "rewards",
    icon: Gift,
  },
  RECOGNITION: {
    label: "Recognition Award",
    category: "rewards",
    icon: Award,
  },
  PROGRAM: {
    label: "Bounty Program",
    category: "team",
    icon: Building2,
  },
  ORGANIZATION: {
    label: "Organization",
    category: "team",
    icon: Building,
  },
  INVITATION: {
    label: "Team Invitation",
    category: "team",
    icon: Mail,
  },
  KYC: {
    label: "Identity & Verification",
    category: "system",
    icon: BadgeCheck,
  },
  COMMENT: {
    label: "Discussion Comment",
    category: "community",
    icon: MessageSquare,
  },
  PROBLEM: {
    label: "Community Problem",
    category: "community",
    icon: BookOpen,
  },
  SOLUTION: {
    label: "Verified Solution",
    category: "community",
    icon: CheckCircle2,
  },
  SHOWCASE: {
    label: "Solution Showcase",
    category: "community",
    icon: Sparkles,
  },
  USER: {
    label: "Member Follow",
    category: "community",
    icon: UserPlus,
  },
  DISPUTE: {
    label: "Triage Dispute",
    category: "security",
    icon: Gavel,
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

const AUTO_APPROVAL_HOLD_PATTERN = /^Your (problem|showcase) is waiting for review$/;

function getNotificationLink(
  type: NotificationType,
  id: string,
  isAdmin: boolean,
  title?: string,
  authorUsername?: string | null,
): string {
  const upperType = (type || "").toUpperCase();

  if (upperType === "SHOWCASE" && (!isAdmin || (title && AUTO_APPROVAL_HOLD_PATTERN.test(title)))) {
    return `/showcases/${id}`;
  }
  if (upperType === "PROBLEM" && (!isAdmin || (title && AUTO_APPROVAL_HOLD_PATTERN.test(title)))) {
    return `/community/${id}`;
  }

  if (isAdmin) return getAdminNotificationLink(type, id);

  switch (upperType) {
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
      return authorUsername ? `/profile/${authorUsername}` : `/dashboard/profile`;
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
    item.title,
    item.authorUsername,
  );
  const isUnread = !item.read;
  const hasAuthor = Boolean(
    item.authorAvatarUrl || item.authorName || item.authorUsername,
  );

  const config =
    NOTIFICATION_TYPE_CONFIG[item.notifiableType] ||
    NOTIFICATION_TYPE_CONFIG.COMMENT;
  const IconComponent = config.icon;
  const { status, statusLabel } = resolveNotificationStatus(item);
  const statusStyles = NOTIFICATION_STATUS_STYLES[status];

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("a")
    ) {
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
        "group relative flex items-start gap-3.5 px-5 sm:px-6 py-3.5 sm:py-4 transition-colors cursor-pointer select-none",
        isUnread
          ? "bg-primary/[0.03] hover:bg-muted/60 dark:bg-primary/[0.05]"
          : "bg-transparent hover:bg-muted/40",
        isSelected && "bg-muted",
      )}
    >
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
            className="size-4 rounded border-border text-primary focus:ring-primary/40 cursor-pointer accent-primary"
          />
        </div>
      )}

      <div className="shrink-0 pt-2 w-2 flex items-center justify-center">
        {isUnread && (
          <span className="size-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 ring-2 ring-blue-600/20" />
        )}
      </div>

      <div className="shrink-0 mt-0.5">
        {hasAuthor ? (
          <div className="relative">
            {item.authorUsername ? (
              <Link
                href={`/profile/${item.authorUsername}`}
                onClick={(e) => e.stopPropagation()}
                className="group/avatar block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                title={
                  item.authorName
                    ? `${item.authorName} (@${item.authorUsername})`
                    : `@${item.authorUsername}`
                }
              >
                <Avatar className="size-10 sm:size-11 rounded-full border border-border/80 group-hover/avatar:ring-2 group-hover/avatar:ring-primary/40 transition-all shadow-xs">
                  {item.authorAvatarUrl && (
                    <AvatarImage
                      src={item.authorAvatarUrl}
                      alt={item.authorName || item.authorUsername || "Author"}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="font-bold text-xs bg-muted text-muted-foreground">
                    {getInitials(item.authorName || item.authorUsername)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Avatar className="size-10 sm:size-11 rounded-full border border-border/80 shadow-xs">
                {item.authorAvatarUrl && (
                  <AvatarImage
                    src={item.authorAvatarUrl}
                    alt={item.authorName || "Author"}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="font-bold text-xs bg-muted text-muted-foreground">
                  {getInitials(item.authorName)}
                </AvatarFallback>
              </Avatar>
            )}

            <div
              className={cn(
                "absolute -bottom-1 -right-1 size-5 sm:size-5.5 rounded-full flex items-center justify-center shadow-md ring-2 ring-card z-10",
                statusStyles.solidBadgeClass,
              )}
            >
              <IconComponent className="size-3 sm:size-3.5 stroke-[2.5]" />
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "flex size-10 sm:size-11 items-center justify-center rounded-2xl ring-1 shadow-xs transition-transform group-hover:scale-105 shrink-0",
              statusStyles.iconContainerClass,
            )}
          >
            <IconComponent className="size-5 sm:size-5.5 stroke-[2.2]" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground min-w-0 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border border-border/60 bg-muted/40 text-muted-foreground shrink-0 shadow-2xs"
            >
              <IconComponent className="size-3 stroke-[2.2] text-muted-foreground/75" />
              <span>{config.label}</span>
            </span>

            {statusLabel && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border shadow-2xs shrink-0",
                  statusStyles.statusBadgeClass,
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full shrink-0",
                    status === "accepted" && "bg-emerald-500",
                    status === "pending" && "bg-amber-500",
                    status === "rejected" && "bg-rose-500",
                  )}
                />
                {statusLabel}
              </span>
            )}
            {hasAuthor && (item.authorName || item.authorUsername) && (
              <>
                <span className="text-muted-foreground/40">•</span>
                {item.authorUsername ? (
                  <Link
                    href={`/profile/${item.authorUsername}`}
                    onClick={(e) => e.stopPropagation()}
                    className="truncate font-medium text-foreground/80 hover:text-primary hover:underline transition-colors inline-flex items-center gap-1"
                  >
                    <span>{item.authorName || item.authorUsername}</span>
                    {item.authorName && item.authorUsername && (
                      <span className="text-muted-foreground text-[11px] font-normal">
                        @{item.authorUsername}
                      </span>
                    )}
                  </Link>
                ) : (
                  <span className="truncate font-medium text-foreground/70">
                    {item.authorName}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-xs text-muted-foreground tabular-nums">
            {isResolvingComment ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <span>{formatNotificationTime(item.createdAt)}</span>
            )}

            {isUnread && item.id && onMarkRead && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead(item.id!);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                title="Mark as read"
              >
                <Check className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        <h3
          className={cn(
            "text-[15px] sm:text-base leading-snug break-words transition-colors",
            isUnread
              ? "font-semibold text-foreground"
              : "font-medium text-foreground/85",
          )}
        >
          {item.title}
        </h3>

        {item.content && (
          <div className="space-y-1 pt-0.5">
            <p
              className={cn(
                "text-xs sm:text-sm leading-relaxed text-muted-foreground/90 break-words",
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
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer pt-0.5"
              >
                <span>{isExpanded ? "Show less" : "Read more"}</span>
                {isExpanded ? (
                  <ChevronUp className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
