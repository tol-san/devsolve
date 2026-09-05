"use client";

import React from "react";

export function ShowcaseDetailSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse pb-16">
      {/* Hero section */}
      <div className="space-y-6">
        {/* 16:9 cover skeleton */}
        <div className="aspect-[16/9] w-full rounded-2xl sm:rounded-3xl border border-border/60 bg-muted/40" />

        {/* Title, chips, and links */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-6 w-24 rounded-full bg-muted/60" />
            <div className="h-6 w-16 rounded-md bg-muted/50" />
            <div className="h-6 w-20 rounded-md bg-muted/50" />
          </div>

          <div className="h-10 sm:h-12 w-3/4 rounded-xl bg-muted/70" />
          <div className="h-5 w-full max-w-3xl rounded-lg bg-muted/50" />
          <div className="h-5 w-2/3 max-w-2xl rounded-lg bg-muted/40" />

          {/* Links row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="h-9 w-28 rounded-xl bg-muted/60" />
            <div className="h-9 w-32 rounded-xl bg-muted/60" />
          </div>
        </div>
      </div>

      {/* Action Bar skeleton */}
      <div className="h-14 w-full rounded-2xl border border-border/60 bg-card/60" />

      {/* Main Grid: Content (Walkthrough) + Sidebar (Author) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Walkthrough column (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="h-7 w-48 rounded-lg bg-muted/60 mb-4" />

          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-muted/70" />
                <div className="h-6 w-52 rounded-lg bg-muted/60" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-muted/50" />
                <div className="h-4 w-5/6 rounded bg-muted/40" />
              </div>
              <div className="h-36 w-full rounded-xl bg-muted/40" />
            </div>
          ))}
        </div>

        {/* Sidebar column (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Author Card skeleton */}
          <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="size-14 rounded-full bg-muted/70" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-32 rounded bg-muted/60" />
                <div className="h-4 w-24 rounded bg-muted/40" />
              </div>
            </div>
            <div className="h-4 w-full rounded bg-muted/40" />
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60">
              <div className="h-10 rounded-lg bg-muted/50" />
              <div className="h-10 rounded-lg bg-muted/50" />
              <div className="h-10 rounded-lg bg-muted/50" />
            </div>
            <div className="h-10 w-full rounded-xl bg-muted/60" />
          </div>
        </div>
      </div>

      {/* Related Grid skeleton */}
      <div className="space-y-4 pt-6 border-t border-border/60">
        <div className="h-7 w-40 rounded-lg bg-muted/60" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/60 bg-card/60 overflow-hidden space-y-3 p-4"
            >
              <div className="aspect-[16/9] w-full rounded-xl bg-muted/50" />
              <div className="h-5 w-3/4 rounded bg-muted/60" />
              <div className="h-4 w-1/2 rounded bg-muted/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
