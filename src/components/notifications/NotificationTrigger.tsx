"use client";

import React from "react";
import { Bell } from "lucide-react";
import { motion } from "motion/react";
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
      aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
      title={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
      className={cn(
        "group relative inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-2xs transition-all active:scale-95 hover:bg-muted hover:border-primary/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
    >
      <motion.div
        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.4 }}
      >
        <Bell className="size-4.5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </motion.div>

      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs tabular-nums ring-2 ring-card">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};
