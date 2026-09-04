"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  BellOff,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  X,
} from "lucide-react";

import {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/lib/redux/services/notificationsApi";
import { NotificationItemCard } from "./NotificationItemCard";
import { Button } from "@/components/ui/button";
import { useSidebarAuth } from "@/hooks/useSidebarAuth";
import { useT } from "@/lib/i18n/I18nProvider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NotificationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  isEmbedded?: boolean;
}

type FilterCategory = "all" | "security" | "rewards" | "community" | "team";

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen = true,
  onClose,
  isEmbedded = false,
}) => {
  const t = useT();
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [pageNumber, setPageNumber] = useState(0);
  const { user } = useSidebarAuth();
  const isAdmin = user?.roles?.includes("ADMIN") ?? false;

  const shouldFetch = Boolean(user);

  const { data, isLoading, isFetching, isError, refetch } = useGetNotificationsQuery(
    {
      pageNumber,
      pageSize: 20,
      unreadOnly,
    },
    {
      skip: !shouldFetch,
    }
  );

  const [markSingleRead] = useMarkAsReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  useEffect(() => {
    if (!isOpen || isEmbedded) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isEmbedded, onClose]);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
      toast.success("All notifications marked as read");
      refetch();
    } catch {
      toast.error("Failed to mark all as read. Please try again.");
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await markSingleRead(id).unwrap();
    } catch {
      // Handled by RTK Query
    }
  };

  const allNotifications = data?.content || [];

  const filteredNotifications = useMemo(() => {
    if (activeCategory === "all") return allNotifications;

    return allNotifications.filter((item) => {
      switch (activeCategory) {
        case "security":
          return (
            item.notifiableType === "REPORT" ||
            item.notifiableType === "SECURITY" ||
            item.notifiableType === "DISPUTE"
          );
        case "rewards":
          return (
            item.notifiableType === "REWARD" ||
            item.notifiableType === "RECOGNITION"
          );
        case "community":
          return (
            item.notifiableType === "COMMENT" ||
            item.notifiableType === "PROBLEM" ||
            item.notifiableType === "SOLUTION" ||
            item.notifiableType === "SHOWCASE" ||
            item.notifiableType === "USER"
          );
        case "team":
          return (
            item.notifiableType === "ORGANIZATION" ||
            item.notifiableType === "PROGRAM" ||
            item.notifiableType === "INVITATION" ||
            item.notifiableType === "KYC"
          );
        default:
          return true;
      }
    });
  }, [allNotifications, activeCategory]);

  const totalPages = data?.totalPages || 0;
  const isFirstPage = data?.first ?? true;
  const isLastPage = data?.last ?? true;
  const unreadCount = allNotifications.filter((n) => !n.read).length;

  const cardContent = (
    <div
      className={cn(
        "flex flex-col h-full w-full bg-card text-card-foreground overflow-hidden relative min-w-0",
        isEmbedded
          ? "rounded-2xl border border-border shadow-xl"
          : "rounded-l-2xl border-l border-border",
      )}
    >
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            {t("notifications.title") || "Notifications"}
          </h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-2.5 py-0.5 tabular-nums">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll || allNotifications.length === 0}
            className="h-8.5 px-3 text-xs sm:text-sm text-muted-foreground hover:text-foreground font-medium rounded-lg gap-1.5 cursor-pointer"
            title="Mark all as read"
          >
            <CheckCheck className="size-4" />
            <span className="hidden sm:inline">Mark all read</span>
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => refetch()}
            disabled={isFetching}
            className="size-8.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
          </Button>

          {!isEmbedded && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="size-8.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </Button>
          )}

          {onClose && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="size-8.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              title="Close"
            >
              <X className="size-4.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-2.5 border-b border-border/70 bg-muted/20 shrink-0 overflow-x-auto scrollbar-none text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setUnreadOnly(false);
              setPageNumber(0);
            }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer",
              !unreadOnly
                ? "bg-foreground text-background font-semibold shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            )}
          >
            All
            {data && data.totalElements > 0 && (
              <span className="ml-1 opacity-70">
                ({data.totalElements})
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setUnreadOnly(true);
              setPageNumber(0);
            }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer",
              unreadOnly
                ? "bg-foreground text-background font-semibold shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            )}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-1 opacity-70">
                ({unreadCount})
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {[
            { id: "all", label: "All" },
            { id: "security", label: "Security" },
            { id: "rewards", label: "Rewards" },
            { id: "community", label: "Discussions" },
            { id: "team", label: "Team" },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as FilterCategory)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "text-foreground font-semibold bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-border/60">
        {isLoading ? (
          <div className="divide-y divide-border/50 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3.5 px-5 sm:px-6 py-4">
                <div className="size-8 sm:size-9 rounded-xl bg-muted shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-muted rounded w-2/5" />
                  <div className="h-4 bg-muted rounded w-4/5" />
                  <div className="h-3 bg-muted rounded w-3/5" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-muted-foreground font-medium text-sm space-y-3">
            <p>{t("notifications.failedLoad") || "Failed to load notifications. Please try again."}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="rounded-lg cursor-pointer text-sm"
            >
              {t("notifications.retry") || "Retry"}
            </Button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center text-muted-foreground font-medium text-sm space-y-2 min-h-[260px]">
            <BellOff className="size-7 text-muted-foreground/60 mb-1" />
            <p className="text-foreground font-semibold text-base">
              {t("notifications.emptyTitle") || "No notifications"}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
              {unreadOnly
                ? t("notifications.emptyUnread") || "You have read all your notifications."
                : activeCategory !== "all"
                ? "No notifications matching this category."
                : t("notifications.emptyAll") || "You have no notifications in your inbox."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item, index) => (
            <NotificationItemCard
              key={item.id ?? `notification-${index}`}
              item={item}
              isAdmin={isAdmin}
              onMarkRead={handleMarkSingleRead}
              onCloseModal={onClose}
            />
          ))
        )}
      </div>

      <div className="flex items-center justify-between px-5 sm:px-6 py-3 border-t border-border bg-card text-xs sm:text-sm text-muted-foreground shrink-0">
        <Link
          href="/dashboard/notifications"
          onClick={() => onClose?.()}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span>Open notification center</span>
          <ExternalLink className="size-3.5" />
        </Link>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm text-muted-foreground mr-1 tabular-nums">
              {pageNumber + 1} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 0))}
              disabled={isFirstPage}
              className="size-8 rounded-md cursor-pointer hover:bg-muted"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPageNumber((prev) => prev + 1)}
              disabled={isLastPage}
              className="size-8 rounded-md cursor-pointer hover:bg-muted"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  if (isEmbedded) {
    return cardContent;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="notification-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-0 z-[290] bg-black/50 backdrop-blur-xs cursor-pointer dark:bg-black/70"
            onClick={onClose}
          />

          <motion.div
            key="notification-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              duration: 0.24,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ willChange: "transform" }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "fixed inset-y-0 right-0 z-[300] h-full shadow-2xl bg-card text-card-foreground border-l border-border flex flex-col transition-[width] duration-200 ease-out",
              isExpanded
                ? "w-full sm:w-[720px] lg:w-[820px]"
                : "w-full sm:w-[480px] md:w-[520px]",
            )}
          >
            {cardContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
