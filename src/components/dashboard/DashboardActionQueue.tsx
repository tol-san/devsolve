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
  Sparkles,
} from "lucide-react";
import { ActionQueueItem } from "@/lib/types/dashboard/types";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface DashboardActionQueueProps {
  items: ActionQueueItem[];
  totalCount: number;
}

const getActionIcon = (type: ActionQueueItem["type"]) => {
  switch (type) {
    case "triage":
      return {
        icon: AlertCircle,
        bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
      };
    case "review":
      return {
        icon: Clock,
        bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
      };
    case "retest":
      return {
        icon: RefreshCw,
        bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      };
    case "invite":
      return {
        icon: UserPlus,
        bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      };
    default:
      return {
        icon: AlertCircle,
        bg: "bg-primary/10 text-primary border border-primary/20",
      };
  }
};

export const DashboardActionQueue: React.FC<DashboardActionQueueProps> = ({
  items,
  totalCount,
}) => {
  const t = useT();
  const hasUrgent = items.some((i) => i.status === "urgent" && i.count > 0);

  return (
    <div className="flex flex-col justify-between h-full rounded-2xl border border-border/80 bg-card/80 p-5 shadow-2xs backdrop-blur-md ring-1 ring-foreground/5 dark:ring-foreground/10">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-border/70">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-foreground">
              {t("dashboard.actionQueue.title")}
            </h2>
            {totalCount > 0 ? (
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs",
                  hasUrgent
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
                )}
              >
                {hasUrgent && (
                  <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
                <span>{totalCount}</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium px-2 py-0.5 rounded-full"
              >
                Clear
              </Badge>
            )}
          </div>

          <Link
            href="/dashboard/my-reports"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View reports
          </Link>
        </div>

        {items.length === 0 || totalCount === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
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
          <div className="divide-y divide-border/50 mt-1">
            {items.map((item, idx) => {
              const config = getActionIcon(item.type);
              const Icon = config.icon;
              const translatedTitle = t(`dashboard.actionQueue.${item.type}`);
              const itemTitle =
                translatedTitle !== `dashboard.actionQueue.${item.type}`
                  ? translatedTitle
                  : item.title;
              const isItemUrgent = item.status === "urgent" && item.count > 0;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                >
                  <Link
                    href={item.linkHref}
                    className="flex items-center justify-between py-3.5 px-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-xl shadow-2xs",
                          config.bg,
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {itemTitle}
                          </p>
                          {isItemUrgent && (
                            <span className="size-1.5 shrink-0 rounded-full bg-rose-500 animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="rounded-lg border border-border/80 bg-muted px-2.5 py-0.5 text-xs font-bold text-foreground tabular-nums">
                        {item.count}
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground transition-all" />
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
