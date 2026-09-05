"use client";

import { motion } from "motion/react";

export default function ProfileSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      role="status"
      aria-label="Loading the profile"
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-16 sm:px-6 sm:py-8 lg:px-8"
    >
      <span className="sr-only">Loading the profile…</span>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="h-40 w-full animate-pulse bg-muted sm:h-52" />
        <div className="px-5 pb-5 sm:px-8 sm:pb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="-mt-16 flex flex-col gap-4 sm:-mt-20 sm:flex-row sm:items-end sm:gap-6">
              <div className="size-28 shrink-0 animate-pulse rounded-full border-4 border-card bg-muted sm:size-36" />
              <div className="space-y-2.5 pb-1">
                <div className="h-8 w-52 animate-pulse rounded-lg bg-muted" />
                <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
              </div>
            </div>
            <div className="flex gap-2 lg:pb-1">
              <div className="h-9 w-28 animate-pulse rounded-xl bg-muted" />
              <div className="h-9 w-24 animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="h-40 animate-pulse rounded-2xl border border-border bg-card sm:col-span-2" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 xl:gap-8">
        <div className="min-w-0 space-y-5 lg:col-span-8 xl:col-span-9">
          <div className="h-12 animate-pulse rounded-xl border border-border bg-card" />
          <div className="h-72 animate-pulse rounded-2xl border border-border bg-card" />
          <div className="h-56 animate-pulse rounded-2xl border border-border bg-card" />
        </div>

        <div className="space-y-5 lg:col-span-4 xl:col-span-3">
          <div className="h-44 animate-pulse rounded-2xl border border-border bg-card" />
          <div className="h-48 animate-pulse rounded-2xl border border-border bg-card" />
          <div className="h-52 animate-pulse rounded-2xl border border-border bg-card" />
        </div>
      </div>
    </motion.div>
  );
}
