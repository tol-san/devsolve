"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BellOff,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
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

interface NotificationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen = true,
  onClose,
  isEmbedded = false,
}) => {
  const t = useT();
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
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
      refetch();
    } catch {
      // Handled by RTK Query
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await markSingleRead(id).unwrap();
    } catch {
      // Handled by RTK Query
    }
  };

  const notifications = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const isFirstPage = data?.first ?? true;
  const isLastPage = data?.last ?? true;

  const cardContent = (
    <div
      className={`flex flex-col h-full w-full bg-card text-card-foreground overflow-hidden ${
        isEmbedded
          ? "rounded-2xl border border-border shadow-xl"
          : "rounded-l-2xl border-l border-border/80"
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border/70 bg-card/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
            {t("notifications.title") || "Notifications"}
          </h2>
          {data && data.totalElements > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold tabular-nums">
              {data.totalElements}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          {/* Refresh Button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => refetch()}
            disabled={isFetching}
            className="size-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
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
      <div className="flex items-center justify-between px-5 sm:px-6 py-2.5 border-b border-border/70 bg-muted/30 gap-3 flex-wrap shrink-0">
        {/* All vs Unread Filter Tabs */}
        <div className="flex items-center p-1 bg-muted/80 border border-border/60 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setUnreadOnly(false);
              setPageNumber(0);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold ${
              !unreadOnly
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("notifications.all") || "All"}
          </button>
          <button
            type="button"
            onClick={() => {
              setUnreadOnly(true);
              setPageNumber(0);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold ${
              unreadOnly
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("notifications.unread") || "Unread"}
          </button>
        </div>

        {/* Mark All As Read Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          disabled={isMarkingAll || notifications.length === 0}
          className="h-8 px-3 border-border/80 bg-card hover:bg-muted text-foreground font-medium text-xs rounded-xl gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
        >
          <CheckCheck className="size-3.5 text-muted-foreground" />
          <span>{t("notifications.markAllRead") || "Mark all as read"}</span>
        </Button>
      </div>

      {/* Notifications List Container with Custom Scroll */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 overscroll-contain">
        {isLoading ? (
          // Skeleton Loading State
          <div className="space-y-3 py-2 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3.5 p-4 rounded-2xl bg-muted/60 border border-border/40">
                <div className="size-10 rounded-xl bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded-md w-3/4" />
                  <div className="h-3.5 bg-muted rounded-md w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-muted-foreground font-medium text-sm space-y-3">
            <p>{t("notifications.failedLoad") || "Failed to load notifications. Please try again."}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl cursor-pointer">
              {t("notifications.retry") || "Retry"}
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground font-medium text-sm space-y-3 min-h-[300px]">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground ring-1 ring-border/50 shadow-inner">
              <BellOff className="size-6 opacity-60" />
            </div>
            <div className="space-y-1">
              <p className="text-foreground font-bold text-base">
                {t("notifications.emptyTitle") || "No notifications found"}
              </p>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                {unreadOnly
                  ? t("notifications.emptyUnread") || "You have read all your notifications."
                  : t("notifications.emptyAll") || "You have no notifications in your inbox."}
              </p>
            </div>
          </div>
        ) : (
          notifications.map((item, index) => (
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

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 sm:px-6 py-3 border-t border-border/70 bg-muted/20 text-xs font-medium text-muted-foreground shrink-0">
          <span>
            Page {pageNumber + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 0))}
              disabled={isFirstPage}
              className="size-8 rounded-xl cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPageNumber((prev) => prev + 1)}
              disabled={isLastPage}
              className="size-8 rounded-xl cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
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
            className="fixed inset-0 z-[290] bg-black/45 cursor-pointer dark:bg-black/65"
            onClick={onClose}
          />

          {/* Ultra-Fast Hardware-Accelerated Right Drawer */}
          <motion.div
            key="notification-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              duration: 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ willChange: "transform" }}
            onClick={(e) => e.stopPropagation()}
            className={`fixed inset-y-0 right-0 z-[300] h-full shadow-2xl bg-card text-card-foreground border-l border-border flex flex-col transition-[width] duration-200 ease-out ${
              isExpanded
                ? "w-full sm:w-[720px] lg:w-[800px]"
                : "w-full sm:w-[460px] md:w-[500px]"
            }`}
          >
            {cardContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
