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
        className="block bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-2xs hover:shadow-xs hover:border-primary/40 ring-1 ring-foreground/5 dark:ring-foreground/10 transition-all duration-200 group cursor-pointer"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 font-bold text-base group-hover:scale-105 transition-transform">
              {item.companyName.charAt(0)}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  {item.companyName}
                </h3>
                <StatusBadge status={item.status} />
                <Badge
                  variant="outline"
                  className="text-xs font-medium rounded-lg px-2 py-0.5 border-border bg-muted/40 text-muted-foreground"
                >
                  {item.businessType}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.domain}
                </span>
                <span>•</span>
                <span className="font-mono">Tax ID: {item.taxId}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.documentsCount} docs
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.registrationDate}
                </span>
              </div>

              {item.notes && (
                <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-xl border border-border line-clamp-1 w-fit max-w-full">
                  <span className="font-semibold text-foreground">Note: </span>
                  {item.notes}
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
