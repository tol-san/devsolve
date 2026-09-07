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
        className="block bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-2xs hover:shadow-xs hover:border-amber-500/40 ring-1 ring-foreground/5 dark:ring-foreground/10 transition-all duration-200 group cursor-pointer"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 font-bold text-base group-hover:scale-105 transition-transform">
              {initial}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                  {item.name}
                </h3>
                <Badge className="text-xs font-semibold rounded-lg px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                  PENDING
                </Badge>
                {item.industry && (
                  <Badge
                    variant="outline"
                    className="text-xs font-medium rounded-lg px-2 py-0.5 border-border bg-muted/40 text-muted-foreground"
                  >
                    {item.industry}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {item.websiteUrl && (
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                    {item.websiteUrl.replace(/^https?:\/\//, "")}
                  </span>
                )}
                {item.websiteUrl && item.ownerFullName && <span>•</span>}
                {item.ownerFullName && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
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
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      {formatDate(item.createdAt)}
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {item.country && (
                  <CountryDisplay
                    value={item.country}
                    size={12}
                    textClassName="font-medium text-foreground"
                  />
                )}
                {item.country && item.companySize && <span>•</span>}
                {item.companySize && <span>{item.companySize} employees</span>}
                {item.submissionVersion > 0 && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-muted-foreground">v{item.submissionVersion}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 text-muted-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
