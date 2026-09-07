"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  Clock,
  RefreshCw,
  UserPlus,
  ChevronRight,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { ActionQueueItem } from "@/lib/types/dashboard/types";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface DashboardActionQueueProps {
  items: ActionQueueItem[];
  totalCount: number;
}

const ACTION_ICONS: Record<string, LucideIcon> = {
  triage: AlertCircle,
  review: Clock,
  retest: RefreshCw,
  invite: UserPlus,
};

export const DashboardActionQueue: React.FC<DashboardActionQueueProps> = ({
  items,
  totalCount,
}) => {
  const t = useT();
  const maxCount = Math.max(...items.map((i) => i.count), 0);

  return (
    <div className="flex flex-col justify-between h-full rounded-2xl border border-border/80 bg-card shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10 p-5">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-border/70">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-foreground">
              {t("dashboard.actionQueue.title")}
            </h2>
            <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs">
              {totalCount} {totalCount === 1 ? "Task" : "Tasks"}
            </Badge>
          </div>

          <Link
            href="/dashboard/my-reports"
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
          >
            View reports
          </Link>
        </div>

        {items.length === 0 || totalCount === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                All caught up!
              </p>
              <p className="text-xs text-muted-foreground max-w-xs">
                No reports, retests, or verification requests need your attention right now.
              </p>
            </div>
            <Link
              href="/dashboard/programs"
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <span>Explore active scopes</span>
              <ChevronRight className="size-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5 mt-3.5">
            {items.map((item, idx) => {
              const Icon = ACTION_ICONS[item.type] ?? AlertCircle;
              const translatedTitle = t(`dashboard.actionQueue.${item.type}`);
              const itemTitle =
                translatedTitle !== `dashboard.actionQueue.${item.type}`
                  ? translatedTitle
                  : item.title;
              const isPrimary = item.count === maxCount && maxCount > 0;
              const hasItems = item.count > 0;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                >
                  <Link
                    href={item.linkHref}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer group",
                      isPrimary
                        ? "border-primary/40 bg-primary/[0.04] ring-1 ring-primary/20 hover:bg-primary/[0.08] hover:border-primary/60 shadow-2xs"
                        : hasItems
                        ? "border-border/70 bg-card hover:bg-primary/[0.03] hover:border-primary/30"
                        : "border-border/40 bg-card/60 hover:bg-muted/20",
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={cn(
                          "size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          isPrimary
                            ? "bg-primary text-primary-foreground shadow-2xs border border-primary/40"
                            : hasItems
                            ? "bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground"
                            : "bg-muted text-muted-foreground border border-border/30",
                        )}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4
                            className={cn(
                              "text-sm font-bold transition truncate",
                              isPrimary
                                ? "text-primary dark:text-primary-foreground font-extrabold"
                                : "text-foreground group-hover:text-primary",
                            )}
                          >
                            {itemTitle}
                          </h4>
                          {isPrimary && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-primary/15 text-primary border border-primary/30 shrink-0">
                              Top Queue
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <Badge
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors",
                          isPrimary
                            ? "bg-primary text-primary-foreground shadow-2xs border border-primary/40 font-bold"
                            : hasItems
                            ? "bg-primary/10 text-primary border border-primary/20 font-semibold"
                            : "bg-muted text-muted-foreground border border-border/30 font-normal",
                        )}
                      >
                        {item.count}
                      </Badge>
                      <ChevronRight
                        className={cn(
                          "size-4 transition-transform group-hover:translate-x-0.5",
                          isPrimary
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-primary",
                        )}
                      />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
