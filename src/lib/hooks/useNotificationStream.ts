"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { notificationsApi } from "@/lib/redux/services/notificationsApi";
import { baseApi } from "@/lib/redux/services/baseApi";
import type { Notification } from "@/lib/types/notifications/types";

export function useNotificationStream(enabled = true) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!enabled) return;

    let eventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connectStream = () => {
      eventSource = new EventSource("/api/notifications/stream");

      eventSource.addEventListener("notification", (event: MessageEvent) => {
        try {
          if (!event.data) return;
          const notification: Notification = JSON.parse(event.data);

          dispatch(notificationsApi.util.invalidateTags(["Notification"]));

          if (notification.notifiableType === "REPORT" && notification.notifiableId) {
            dispatch(
              baseApi.util.invalidateTags([
                { type: "Report", id: notification.notifiableId },
                "Report",
              ]),
            );
          } else if (notification.notifiableType === "PROBLEM" && notification.notifiableId) {
            dispatch(
              baseApi.util.invalidateTags([
                { type: "Problem", id: notification.notifiableId },
                "Problem",
              ]),
            );
          } else if (notification.notifiableType === "SHOWCASE" && notification.notifiableId) {
            dispatch(
              baseApi.util.invalidateTags([
                { type: "Showcase", id: notification.notifiableId },
                "Showcase",
              ]),
            );
          }

          toast.info(notification.title || "New Notification", {
            description: notification.content,
            duration: 5000,
          });
        } catch {
          // Ignore invalid JSON / heartbeats
        }
      });

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        reconnectTimer = setTimeout(connectStream, 5000);
      };
    };

    connectStream();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [dispatch, enabled]);
}
