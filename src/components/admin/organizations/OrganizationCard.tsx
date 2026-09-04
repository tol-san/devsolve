"use client";

import React from "react";
import { CompanyVerificationItem } from "@/lib/redux/services/adminApi";
import { Badge } from "@/components/ui/badge";
import { Globe, FileText, Calendar, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { StatusBadge } from "./statusUtils";

interface OrganizationCardProps {
  item: CompanyVerificationItem;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({ item }) => {
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
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50 font-bold text-base group-hover:scale-105 transition-transform">
              {item.companyName.charAt(0)}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {item.companyName}
                </h3>
                <StatusBadge status={item.status} />
                <Badge
                  variant="outline"
                  className="text-xs font-medium rounded-lg px-2 py-0.5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                >
                  {item.businessType}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {item.domain}
                </span>
                <span>•</span>
                <span className="font-mono">Tax ID: {item.taxId}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  {item.documentsCount} docs
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {item.registrationDate}
                </span>
              </div>

              {item.notes && (
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 line-clamp-1 w-fit max-w-full">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Note: </span>
                  {item.notes}
                </p>
              )}
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

