"use client";

import React from "react";

const BLOCK_CLASS = "rounded-lg bg-muted";

export function DiscussionSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading discussions"
      className="flex animate-pulse flex-col border-t border-border/70"
    >
      <span className="sr-only">Loading discussions…</span>

      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 border-b border-border/70 py-4 sm:py-5 px-2 sm:px-3.5 sm:flex-row sm:items-start sm:gap-4.5"
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
