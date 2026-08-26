"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const { user } = useSidebarAuth();
  const isAdmin = user?.roles?.includes("ADMIN") ?? false;

  const shouldFetch = (isOpen || isEmbedded) && Boolean(user);

  const { data, isLoading, isError, refetch } = useGetNotificationsQuery(
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

  if (!isOpen && !isEmbedded) return null;

  const notifications = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const isFirstPage = data?.first ?? true;
  const isLastPage = data?.last ?? true;

  const cardContent = (
    <div
      className={`flex flex-col h-full w-full bg-card text-card-foreground overflow-hidden ${
        isEmbedded
          ? "rounded-2xl border border-border shadow-xl"
          : "rounded-l-2xl border-l border-border"
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-foreground tracking-tight">Notifications</h2>
          {data && data.totalElements > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
              {data.totalElements}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          {!isEmbedded && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              title={isExpanded ? "Collapse width" : "Expand width"}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          )}

          {onClose && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Action / Filter Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/40 gap-3 flex-wrap shrink-0">
        {/* All vs Unread Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl text-xs font-medium">
          <button
            onClick={() => {
              setUnreadOnly(false);
              setPageNumber(0);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold ${
              !unreadOnly
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => {
              setUnreadOnly(true);
              setPageNumber(0);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold ${
              unreadOnly
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Unread
          </button>
        </div>

        {/* Mark All As Read Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          disabled={isMarkingAll || notifications.length === 0}
          className="h-8 px-3 border-border bg-card hover:bg-muted text-foreground font-medium text-xs rounded-xl gap-1.5 cursor-pointer shadow-2xs"
        >
          <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Mark all as read</span>
        </Button>
      </div>

      {/* Notifications List Container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
        {isLoading ? (
          // Skeleton Loading State
          <div className="space-y-3 py-2 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3.5 p-4 rounded-2xl bg-muted/60">
                <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3.5 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-muted-foreground font-medium text-sm space-y-3">
            <p>Failed to load notifications. Please try again.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl">
              Retry
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground font-medium text-sm space-y-2">
            <p className="text-foreground font-semibold text-base">No notifications found</p>
            <p className="text-xs text-slate-500">
              {unreadOnly ? "You have read all your notifications." : "You have no notifications in your inbox."}
            </p>
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
        <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/20 text-xs font-medium text-muted-foreground shrink-0">
          <span>
            Page {pageNumber + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 0))}
              disabled={isFirstPage}
              className="h-8 w-8 rounded-lg cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPageNumber((prev) => prev + 1)}
              disabled={isLastPage}
              className="h-8 w-8 rounded-lg cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
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
          {/* Slide Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[290] bg-black/50 backdrop-blur-xs cursor-pointer"
            onClick={onClose}
          />

          {/* Right Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className={`fixed inset-y-0 right-0 z-[300] h-full shadow-2xl bg-card text-card-foreground border-l border-border flex flex-col transition-all duration-300 ${
              isExpanded
                ? "w-full sm:w-[720px] lg:w-[800px]"
                : "w-full sm:w-[480px] md:w-[540px]"
            }`}
          >
            {cardContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
