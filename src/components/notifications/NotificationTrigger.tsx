"use client";

import React from "react";
import { Bell } from "lucide-react";
import { useNotification } from "./NotificationContext";
import { useGetUnreadCountQuery } from "@/lib/redux/services/notificationsApi";
import { cn } from "@/lib/utils";

export const NotificationTrigger: React.FC<{ className?: string }> = ({ className }) => {
  const { openNotification } = useNotification();
  const { data } = useGetUnreadCountQuery();
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <button
      type="button"
      onClick={openNotification}
      aria-label="Notifications"
      title="Notifications"
      className={cn(
        "relative inline-flex size-9 sm:size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-2xs transition-all active:scale-95 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800",
        className,
      )}
    >
      <Bell className="size-4.5 sm:size-5" />
      {unreadCount > 0 && (
        <span
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 sm:h-4.5 sm:min-w-4.5 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] sm:text-[10px] font-bold text-white shadow-xs tabular-nums"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
};
