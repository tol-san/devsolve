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

          // Invalidate RTK query cache so badge count and inbox refresh automatically
          dispatch(notificationsApi.util.invalidateTags(["Notification"]));

          /* A report notification means the report itself moved — the retest
             events (`:requested`, `:completed`, `:expired`) all arrive this
             way, and the last of them has no request behind it at all: an
             attempt that lapses is closed by the backend's clock, so without
             this the screen would keep counting down to a deadline that has
             already passed. The report is re-read rather than patched here,
             since the notification carries only its id. */
          if (notification.notifiableType === "REPORT" && notification.notifiableId) {
            /* Invalidated through `baseApi`, which owns the tags — the
               report endpoints are injected into it. Importing `reportsApi`
               here instead would pull its whole transform layer into every
               page that mounts the notification provider, which is all of
               them. */
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

          // Show interactive toast alert
          toast.info(notification.title || "New Notification", {
            description: notification.content,
            duration: 5000,
          });
        } catch {
          // Ignore invalid JSON / heartbeats
        }
      });

      eventSource.onerror = () => {
        // Close broken connection and attempt automatic reconnect after 5s
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
