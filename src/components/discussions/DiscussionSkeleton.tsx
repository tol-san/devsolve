"use client";

import React from "react";

const BLOCK_CLASS = "rounded-lg bg-muted";

export function DiscussionSkeleton({
  viewMode = "list",
}: {
  viewMode?: "list" | "card";
}) {
  if (viewMode === "card") {
    return (
      <div
        role="status"
        aria-label="Loading discussions"
        className="grid grid-cols-1 gap-5 md:grid-cols-2 animate-pulse"
      >
        <span className="sr-only">Loading discussions…</span>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex h-64 flex-col justify-between rounded-2xl bg-card p-5 sm:p-6 ring-1 ring-foreground/5 dark:ring-foreground/10"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-muted shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className={`h-4 w-32 ${BLOCK_CLASS}`} />
                  <div className={`h-3 w-24 ${BLOCK_CLASS}`} />
                </div>
              </div>
              <div className={`h-5 w-3/4 ${BLOCK_CLASS}`} />
              <div className={`h-3.5 w-full ${BLOCK_CLASS}`} />
              <div className={`h-3.5 w-2/3 ${BLOCK_CLASS}`} />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/40">
              <div className={`h-6 w-20 ${BLOCK_CLASS}`} />
              <div className={`h-4 w-28 ${BLOCK_CLASS}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Loading discussions"
      className="flex animate-pulse flex-col rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-xs overflow-hidden ring-1 ring-foreground/5"
    >
      <span className="sr-only">Loading discussions…</span>

      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 border-b border-border/60 last:border-b-0 p-5 sm:p-6 sm:flex-row sm:items-start sm:gap-4.5"
        >
          {/* Avatar Skeleton */}
          <div className="size-11 rounded-full bg-muted shrink-0" />

          {/* Body Skeleton */}
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className={`h-5 w-24 rounded-full ${BLOCK_CLASS}`} />
              <div className={`h-3 w-16 ${BLOCK_CLASS}`} />
            </div>
            <div className={`h-6 w-3/4 ${BLOCK_CLASS}`} />
            <div className={`h-4 w-full ${BLOCK_CLASS}`} />
            <div className="flex gap-2 pt-1">
              <div className={`h-6 w-14 ${BLOCK_CLASS}`} />
              <div className={`h-6 w-16 ${BLOCK_CLASS}`} />
            </div>
          </div>

          {/* Right actions skeleton */}
          <div className="flex shrink-0 sm:flex-col sm:items-end justify-between items-center gap-3">
            <div className="flex -space-x-2">
              <div className="size-6 rounded-full bg-muted" />
              <div className="size-6 rounded-full bg-muted" />
            </div>
            <div className={`h-4 w-20 ${BLOCK_CLASS}`} />
            <div className="flex items-center gap-2">
              <div className="h-8 w-16 rounded-xl bg-muted" />
              <div className="size-8 rounded-xl bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
