"use client";

import { useSyncExternalStore } from "react";

let isModalOpen = false;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export const searchModalStore = {
  getSnapshot: () => isModalOpen,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  open: () => {
    if (!isModalOpen) {
      isModalOpen = true;
      emitChange();
    }
  },
  close: () => {
    if (isModalOpen) {
      isModalOpen = false;
      emitChange();
    }
  },
  toggle: () => {
    isModalOpen = !isModalOpen;
    emitChange();
  },
};

/**
 * Hook for consuming and controlling the global Search modal state.
 * Works uniformly across any trigger button, layout, or keyboard shortcut.
 */
export function useSearchModal() {
  const isOpen = useSyncExternalStore(
    searchModalStore.subscribe,
    searchModalStore.getSnapshot,
    () => false,
  );

  return {
    isOpen,
    open: searchModalStore.open,
    close: searchModalStore.close,
    toggle: searchModalStore.toggle,
  };
}
