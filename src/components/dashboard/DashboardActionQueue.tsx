"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { AlertCircle, Clock, RefreshCw, UserPlus, ChevronRight } from "lucide-react";
import { ActionQueueItem } from "@/lib/types/dashboard/types";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n/I18nProvider";

interface DashboardActionQueueProps {
  items: ActionQueueItem[];
  totalCount: number;
}

const getActionIcon = (type: ActionQueueItem["type"]) => {
  switch (type) {
    case "triage":
      return {
        icon: AlertCircle,
        bg: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
      };
    case "review":
      return {
        icon: Clock,
        bg: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
      };
    case "retest":
      return {
        icon: RefreshCw,
        bg: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
      };
    case "invite":
      return {
        icon: UserPlus,
        bg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      };
  }
};

export const DashboardActionQueue: React.FC<DashboardActionQueueProps> = ({
  items,
  totalCount,
}) => {
  const t = useT();

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-xs p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-neutral-100">
              {t("dashboard.actionQueue.title")}
            </h2>
            <Badge
              variant="destructive"
              className="bg-red-500 hover:bg-red-600 text-white rounded-full px-2.5 py-0.5 text-xs font-semibold"
            >
              {totalCount}
            </Badge>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-neutral-800/60 mt-1">
          {items.map((item, idx) => {
            const config = getActionIcon(item.type);
            const Icon = config.icon;
            const translatedTitle = t(`dashboard.actionQueue.${item.type}`);
            const itemTitle = translatedTitle !== `dashboard.actionQueue.${item.type}` ? translatedTitle : item.title;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
              >
                <Link
                  href={item.linkHref}
                  className="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50 dark:hover:bg-neutral-800/40 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${config.bg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {itemTitle}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-neutral-400">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-neutral-100 px-2 py-0.5 bg-slate-100 dark:bg-neutral-800 rounded-md">
                      {item.count}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
