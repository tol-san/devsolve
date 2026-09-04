"use client";

import React from "react";
import { PendingOrganizationItem } from "@/lib/redux/services/adminApi";
import { Badge } from "@/components/ui/badge";
import { Globe, User, Calendar, ChevronRight, Building2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { CountryDisplay } from "@/components/shared/CountryDisplay";

interface PendingOrganizationCardProps {
  item: PendingOrganizationItem;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export const PendingOrganizationCard: React.FC<PendingOrganizationCardProps> = ({ item }) => {
  const initial = item.name?.charAt(0)?.toUpperCase() ?? <Building2 className="w-4 h-4" />;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18 }}
    >
      <Link
        href={`/dashboard/company-verification/${item.id}`}
        className="block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs hover:shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-200 group cursor-pointer"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/50 font-bold text-base group-hover:scale-105 transition-transform">
              {initial}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {item.name}
                </h3>
                <Badge className="text-xs font-semibold rounded-lg px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  PENDING
                </Badge>
                {item.industry && (
                  <Badge
                    variant="outline"
                    className="text-xs font-medium rounded-lg px-2 py-0.5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  >
                    {item.industry}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                {item.websiteUrl && (
                  <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    {item.websiteUrl.replace(/^https?:\/\//, "")}
                  </span>
                )}
                {item.websiteUrl && item.ownerFullName && <span>•</span>}
                {item.ownerFullName && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {item.ownerFullName}
                  </span>
                )}
                {item.ownerEmail && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{item.ownerEmail}</span>
                  </>
                )}
                {item.createdAt && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(item.createdAt)}
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                {item.country && (
                  <CountryDisplay
                    value={item.country}
                    size={12}
                    textClassName="font-medium text-slate-600 dark:text-slate-400"
                  />
                )}
                {item.country && item.companySize && <span>•</span>}
                {item.companySize && <span>{item.companySize} employees</span>}
                {item.submissionVersion > 0 && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-400">v{item.submissionVersion}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
