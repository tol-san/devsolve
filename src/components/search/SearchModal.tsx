"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import { SearchDropdown } from "@/components/search/SearchDropdown";
import { useSearchModal } from "@/components/search/useSearchModal";

const emptySubscribe = () => () => {};

/**
 * Global Search Dialog Modal.
 *
 * Rendered through a React Portal directly to document.body so the backdrop
 * blurs the entire screen and page content cleanly without being clipped or
 * constrained by parent transforms or stacking contexts.
 *
 * Supports global ⌘K / Ctrl+K keyboard shortcut across the entire app.
 */
export function SearchModal() {
  const { isOpen, close, toggle } = useSearchModal();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  /* Global keyboard shortcut (Cmd+K / Ctrl+K) and Escape key listener */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggle();
      } else if (event.key === "Escape" && isOpen) {
        close();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close, toggle]);

  /* Lock body scroll while search overlay is active */
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-start overflow-y-auto px-4 pt-16 sm:pt-24 pb-6">
          {/* Fullscreen Backdrop: Blurs all content across the entire page */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 bg-background/70 dark:bg-black/80 backdrop-blur-md cursor-pointer"
            aria-hidden="true"
          />

          {/* Centered Search Command Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="relative z-10 w-full max-w-2xl rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl ring-1 ring-foreground/10 overflow-hidden flex flex-col p-0"
          >
            <SearchDropdown autoFocus onDone={close} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
