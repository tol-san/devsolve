"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Gift,
  Maximize2,
  MessageSquare,
  Minimize2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/lib/redux/services/notificationsApi";
import { NotificationItemCard } from "./NotificationItemCard";
import { Badge } from "@/components/ui/badge";
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

  // Handle escape key and body scroll lock
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

  // Filter notifications by category client-side
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
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 shrink-0">
            <Bell className="size-4.5 sm:size-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight truncate">
                {t("notifications.title") || "Notifications"}
              </h2>
              {unreadCount > 0 && (
                <Badge className="bg-blue-600 text-white font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-full shadow-2xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate hidden sm:block">
              Stay updated with your reports, bounties, and activity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground shrink-0">
          {/* Refresh Button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => refetch()}
            disabled={isFetching}
            className="size-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
          </Button>

          {!isEmbedded && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="size-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              title={isExpanded ? "Collapse width" : "Expand width"}
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
              className="size-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              title="Close"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Action / Filter Bar */}
      <div className="flex flex-col gap-2.5 px-4 sm:px-6 py-3 border-b border-border bg-muted/30 shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* All vs Unread Status Tabs */}
          <div className="flex items-center p-1 bg-muted rounded-xl border border-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setUnreadOnly(false);
                setPageNumber(0);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                !unreadOnly
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("notifications.all") || "All"}
              {data && data.totalElements > 0 && (
                <span className="ml-1.5 text-[10px] text-muted-foreground">
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
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                unreadOnly
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("notifications.unread") || "Unread"}
              {unreadCount > 0 && (
                <span className="ml-1.5 text-[10px] text-primary font-bold">
                  ({unreadCount})
                </span>
              )}
            </button>
          </div>

          {/* Mark All As Read Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll || allNotifications.length === 0}
            className="h-8 px-3 border-border bg-card hover:bg-muted text-foreground font-semibold text-xs rounded-xl gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
          >
            <CheckCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t("notifications.markAllRead") || "Mark all as read"}</span>
          </Button>
        </div>

        {/* Category Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
          {[
            { id: "all", label: "All Types", icon: Sparkles },
            { id: "security", label: "Security & Reports", icon: ShieldAlert },
            { id: "rewards", label: "Rewards", icon: Gift },
            { id: "community", label: "Discussions", icon: MessageSquare },
            { id: "team", label: "Team & Org", icon: Users },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as FilterCategory)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-xs whitespace-nowrap transition-all cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-3" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications List Body */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 overscroll-contain">
        {isLoading ? (
          // Skeleton Loading State
          <div className="space-y-3 py-2 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-card border border-border"
              >
                <div className="size-10 rounded-2xl bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded-md w-3/4" />
                  <div className="h-3.5 bg-muted rounded-md w-full" />
                  <div className="h-3 bg-muted rounded-md w-1/3" />
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
              className="rounded-xl cursor-pointer"
            >
              {t("notifications.retry") || "Retry"}
            </Button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center text-muted-foreground font-medium text-sm space-y-3 min-h-[300px]">
            <div className="flex size-14 items-center justify-center rounded-3xl bg-muted text-muted-foreground ring-1 ring-border shadow-inner">
              <BellOff className="size-6 opacity-70" />
            </div>
            <div className="space-y-1 max-w-xs">
              <p className="text-foreground font-bold text-base">
                {t("notifications.emptyTitle") || "No notifications found"}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {unreadOnly
                  ? t("notifications.emptyUnread") || "You have read all your notifications."
                  : activeCategory !== "all"
                  ? "No notifications matching this category."
                  : t("notifications.emptyAll") || "You have no notifications in your inbox."}
              </p>
            </div>
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

      {/* Footer Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-border bg-card text-xs font-medium text-muted-foreground shrink-0">
        <Link
          href="/dashboard/notifications"
          onClick={() => onClose?.()}
          className="inline-flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          <span>Open Full Notification Center</span>
          <ExternalLink className="size-3" />
        </Link>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground mr-1">
              Page {pageNumber + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 0))}
              disabled={isFirstPage}
              className="size-7 rounded-lg cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPageNumber((prev) => prev + 1)}
              disabled={isLastPage}
              className="size-7 rounded-lg cursor-pointer"
            >
              <ChevronRight className="size-3.5" />
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
          {/* Smooth Backdrop Fade */}
          <motion.div
            key="notification-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-0 z-[290] bg-black/50 backdrop-blur-xs cursor-pointer dark:bg-black/70"
            onClick={onClose}
          />

          {/* Ultra-Fast Hardware-Accelerated Right Drawer */}
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
