"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  ChevronRight,
  ShieldAlert,
  FileCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AdminActionQueueItem } from "@/lib/types/admin/types";

const ACTION_ICONS: Record<AdminActionQueueItem["type"], LucideIcon> = {
  verification: Building2,
  report_confirmation: FileCheck,
  moderation: ShieldAlert,
  user_review: Users,
};

interface AdminActionQueueCardProps {
  items: AdminActionQueueItem[];
  totalCount: number;
}

export function AdminActionQueueCard({ items, totalCount }: AdminActionQueueCardProps) {
  const maxCount = Math.max(...items.map((i) => i.count), 0);

  return (
    <Card className="lg:col-span-7 rounded-2xl border border-border/80 bg-card shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10 flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-border/80">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              Admin Action Queue
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-0.5">
              Tasks requiring platform administrator approval or review
            </CardDescription>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs">
            {totalCount} Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {items.map((item) => {
          const Icon = ACTION_ICONS[item.type];
          const isPrimary = item.count === maxCount && maxCount > 0;
          const hasItems = item.count > 0;

          return (
            <Link key={item.id} href={item.linkHref} className="block group">
              <div
                className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                  isPrimary
                    ? "border-primary/40 bg-primary/[0.04] ring-1 ring-primary/20 hover:bg-primary/[0.08] hover:border-primary/60 shadow-2xs"
                    : hasItems
                    ? "border-border/70 bg-card hover:bg-primary/[0.03] hover:border-primary/30"
                    : "border-border/40 bg-card/60 hover:bg-muted/20"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isPrimary
                        ? "bg-primary text-primary-foreground shadow-2xs border border-primary/40"
                        : hasItems
                        ? "bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground"
                        : "bg-muted text-muted-foreground border border-border/30"
                    }`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-bold transition ${
                          isPrimary
                            ? "text-primary dark:text-primary-foreground font-extrabold"
                            : "text-foreground group-hover:text-primary"
                        }`}
                      >
                        {item.title}
                      </h4>
                      {isPrimary && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-primary/15 text-primary border border-primary/30">
                          Top Queue
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors ${
                      isPrimary
                        ? "bg-primary text-primary-foreground shadow-2xs border border-primary/40 font-bold"
                        : hasItems
                        ? "bg-primary/10 text-primary border border-primary/20 font-semibold"
                        : "bg-muted text-muted-foreground border border-border/30 font-normal"
                    }`}
                  >
                    {item.count} items
                  </Badge>
                  <ChevronRight
                    className={`size-4 transition-transform group-hover:translate-x-0.5 ${
                      isPrimary
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary"
                    }`}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
