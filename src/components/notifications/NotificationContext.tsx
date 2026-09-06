"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { NotificationModal } from "./NotificationModal";
import { useNotificationStream } from "@/lib/hooks/useNotificationStream";

interface NotificationContextType {
  isOpen: boolean;
  openNotification: () => void;
  closeNotification: () => void;
  toggleNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{
  children: React.ReactNode;
  enableStream?: boolean;
}> = ({ children, enableStream = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  useNotificationStream(enableStream);

  const openNotification = useCallback(() => setIsOpen(true), []);
  const closeNotification = useCallback(() => setIsOpen(false), []);
  const toggleNotification = useCallback(() => setIsOpen((prev) => !prev), []);

  const value = useMemo(
    () => ({ isOpen, openNotification, closeNotification, toggleNotification }),
    [isOpen, openNotification, closeNotification, toggleNotification],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationModal
        isOpen={enableStream && isOpen}
        onClose={closeNotification}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
