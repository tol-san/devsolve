"use client";

import { motion } from "motion/react";

export default function ProfileSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6 pb-16"
    >
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="h-36 sm:h-48 w-full bg-muted animate-pulse" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-20">
              <div className="size-28 sm:size-36 rounded-full border-4 border-card bg-muted animate-pulse shrink-0" />
              <div className="space-y-2 pb-1">
                <div className="h-7 w-48 rounded-lg bg-muted animate-pulse" />
                <div className="h-4 w-32 rounded-md bg-muted animate-pulse" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-28 rounded-xl bg-muted animate-pulse" />
              <div className="h-9 w-20 rounded-xl bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-border bg-card p-4 animate-pulse"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="size-8 rounded-xl bg-muted" />
            </div>
            <div className="mt-4 h-7 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-start">
        <div className="w-full shrink-0 space-y-5 lg:w-80">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="h-4 w-28 rounded bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-3.5 w-full rounded bg-muted animate-pulse" />
              <div className="h-3.5 w-4/5 rounded bg-muted animate-pulse" />
              <div className="h-3.5 w-3/5 rounded bg-muted animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
              <div className="h-14 rounded-xl bg-muted animate-pulse" />
              <div className="h-14 rounded-xl bg-muted animate-pulse" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="h-4 w-36 rounded bg-muted animate-pulse" />
            <div className="h-9 w-full rounded-xl bg-muted animate-pulse" />
            <div className="h-9 w-full rounded-xl bg-muted animate-pulse" />
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-6">
          <div className="flex gap-6 border-b border-border pb-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-4 rounded bg-muted animate-pulse"
                style={{ width: `${60 + i * 14}px` }}
              />
            ))}
          </div>

          <div className="h-64 rounded-2xl border border-border bg-card animate-pulse" />
          <div className="h-48 rounded-2xl border border-border bg-card animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
