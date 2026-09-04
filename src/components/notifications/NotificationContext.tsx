"use client";

import React, { createContext, useContext, useState } from "react";
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

  const openNotification = () => setIsOpen(true);
  const closeNotification = () => setIsOpen(false);
  const toggleNotification = () => setIsOpen((prev) => !prev);

  return (
    <NotificationContext.Provider
      value={{ isOpen, openNotification, closeNotification, toggleNotification }}
    >
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
