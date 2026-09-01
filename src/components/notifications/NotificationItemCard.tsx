"use client";

import React from "react";
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
  CheckCircle2,
  ChevronRight,
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
import { useT } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface NotificationItemCardProps {
  item: Notification;
  isAdmin?: boolean;
  onMarkRead?: (id: string) => void;
  onCloseModal?: () => void;
}

/**
 * Where tapping a notification goes.
 *
 * Every branch here is checked against a route that exists. Most of these used
 * to point at pages that were never built — `/dashboard/problems/{id}`,
 * `/dashboard/solutions/{id}`, `/dashboard/showcases/{id}`,
 * `/dashboard/organizations/invitations`, `/dashboard/profile/kyc`,
 * `/dashboard/disputes/{id}` and `/dashboard/recognitions/{id}` were all
 * 404s, so seven of the eleven kinds of notification led nowhere.
 *
 * Where the id cannot address a page on its own, this lands on the list that
 * contains the item rather than on a broken URL. `SOLUTION` is the clearest
 * case: `notifiableId` is the solution's id, but a solution is only readable
 * under its problem, whose id the payload does not carry.
 */
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
      /* Not `/dashboard/team-management`: that reads the *reader's own*
         organization members, which for someone who has not accepted yet is
         the one page certain to show them nothing. */
      return `/dashboard/invitations`;
    case "KYC":
      // Verification state and its next action live on the org page.
      return `/dashboard/organizations`;
    case "REWARD":
    case "RECOGNITION":
      return `/dashboard/rewards`;
    case "SECURITY":
      return id ? `/dashboard/report-management/${id}` : `/dashboard/report-management`;
    case "USER":
      // A follow. The payload carries the actor's uuid and the profile route
      // keys on username, so this opens the reader's own followers instead.
      return `/dashboard/profile`;
    case "COMMENT":
    case "DISPUTE":
    default:
      return `/dashboard`;
  }
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "PROBLEM":
      return <BookOpen className="size-4" />;
    case "SOLUTION":
      return <CheckCircle2 className="size-4" />;
    case "PROGRAM":
      return <Building2 className="size-4" />;
    case "SHOWCASE":
      return <Sparkles className="size-4" />;
    case "ORGANIZATION":
      return <Building className="size-4" />;
    case "REPORT":
      return <AlertTriangle className="size-4" />;
    case "SECURITY":
      return <ShieldAlert className="size-4 text-red-500" />;
    case "INVITATION":
      return <Mail className="size-4" />;
    case "KYC":
      return <BadgeCheck className="size-4" />;
    case "DISPUTE":
      return <Gavel className="size-4" />;
    case "RECOGNITION":
      return <Award className="size-4" />;
    case "REWARD":
      return <Gift className="size-4" />;
    case "USER":
      return <UserPlus className="size-4" />;
    case "COMMENT":
    default:
      return <MessageSquare className="size-4" />;
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
  if (!name?.trim()) return "?";

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
}) => {
  const t = useT();
  const router = useRouter();
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

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (item.notifiableType === "COMMENT") {
      event.preventDefault();
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(
        "group relative flex items-start gap-3.5 rounded-2xl border p-3.5 transition-colors sm:p-4",
        isUnread
          ? "border-primary/30 bg-primary/5 hover:bg-primary/8 dark:bg-primary/10 dark:hover:bg-primary/15"
          : "border-border bg-card hover:bg-muted/50",
      )}
    >
      {hasCommentAuthor ? (
        <Avatar size="lg" aria-label={item.authorName || "Comment author"}>
          {item.authorAvatarUrl && (
            <AvatarImage
              src={item.authorAvatarUrl}
              alt={item.authorName || "Comment author"}
            />
          )}
          <AvatarFallback className="font-semibold">
            {getInitials(item.authorName)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground shadow-2xs">
          {getNotificationIcon(item.notifiableType)}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={targetHref}
            onClick={handleClick}
            aria-disabled={isResolvingComment}
            className="group/title block min-w-0"
          >
            <h3 className="truncate text-base font-semibold leading-snug text-foreground transition-colors group-hover/title:text-primary">
              {item.title}
            </h3>
          </Link>

          {/* Unread Indicator Dot */}
          {isUnread && item.id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onMarkRead && item.id) onMarkRead(item.id);
              }}
              title="Mark as read"
              className="mt-1 size-2.5 shrink-0 cursor-pointer rounded-full bg-primary shadow-[0_0_8px_rgba(37,99,235,0.6)] transition-transform hover:scale-125"
            />
          )}
        </div>

        {/* Content Details */}
        <p className="mt-1 break-words text-sm font-normal leading-relaxed text-muted-foreground">
          {item.content}
        </p>

        {/* Footer info & Link */}
        <div className="mt-2.5 flex items-center justify-between gap-2 text-sm font-medium text-muted-foreground">
          <span className="min-w-0 truncate text-xs">
            {hasCommentAuthor && item.authorName ? `${item.authorName} · ` : ""}
            {formatNotificationTime(item.createdAt)}
          </span>

          <Link
            href={targetHref}
            onClick={handleClick}
            aria-disabled={isResolvingComment}
            className="inline-flex shrink-0 items-center gap-1 text-xs sm:text-sm font-semibold text-primary transition-colors hover:text-primary/80 aria-disabled:pointer-events-none aria-disabled:opacity-60"
          >
            {isResolvingComment ? (
              <>
                <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" />
                <span>{t("notifications.opening") || "Opening…"}</span>
              </>
            ) : (
              <>
                <span>{t("notifications.viewDetails") || "View details"}</span>
                <ChevronRight className="size-3.5" />
              </>
            )}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
