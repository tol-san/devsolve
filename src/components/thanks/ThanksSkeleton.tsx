"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function ThanksSkeleton() {
  return (
    <div className="space-y-6 w-full animate-pulse" aria-label="Loading Hall of Thanks">
      {/* Header Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl border border-border bg-card/60 p-4 space-y-2"
          >
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-6 w-16 bg-muted/80 rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card className="rounded-2xl border border-border bg-card overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between gap-4 p-4 sm:p-5"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="size-9 rounded-xl bg-muted shrink-0" />
                  <div className="size-10 rounded-full bg-muted shrink-0" />
                  <div className="space-y-1.5 min-w-0">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-20 bg-muted/60 rounded" />
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-2">
                  <div className="h-6 w-16 bg-muted/60 rounded-lg" />
                  <div className="h-6 w-16 bg-muted/60 rounded-lg" />
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="h-5 w-24 bg-muted/80 rounded" />
                  <div className="h-3 w-16 bg-muted/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
