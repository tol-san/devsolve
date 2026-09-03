"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import { SearchDropdown } from "@/components/search/SearchDropdown";
import { useSearchModal } from "@/components/search/useSearchModal";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-card p-3 shadow-2xl ring-1 ring-foreground/10"
          >
            <SearchDropdown autoFocus onDone={close} />

            {/* Keyboard hints footer */}
            <div className="mt-2.5 flex items-center justify-between px-2 pt-2 border-t border-border/50 text-xs text-muted-foreground select-none">
              <div className="flex items-center gap-2">
                <span>
                  Navigate{" "}
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    ↑
                  </kbd>{" "}
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    ↓
                  </kbd>
                </span>
                <span>
                  Select{" "}
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    ↵
                  </kbd>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Close</span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  ESC
                </kbd>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
