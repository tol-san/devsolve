"use client";

import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, ShieldCheck, UserPlus, DollarSign, Radio, Sparkles } from "lucide-react";
import { SecurityFeedItem } from "@/lib/types/dashboard/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DashboardSecurityFeedProps {
  feed: SecurityFeedItem[];
}

const getFeedIcon = (type: SecurityFeedItem["type"]) => {
  switch (type) {
    case "confirmed":
      return {
        icon: ShieldCheck,
        bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      };
    case "resolved":
      return {
        icon: CheckCircle2,
        bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      };
    case "joined":
      return {
        icon: UserPlus,
        bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
      };
    case "bounty":
      return {
        icon: DollarSign,
        bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
      };
    default:
      return {
        icon: ShieldCheck,
        bg: "bg-primary/10 text-primary border border-primary/20",
      };
  }
};

const getSeverityBadgeClass = (severity?: string) => {
  switch (severity) {
    case "Critical":
      return "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400";
    case "High":
      return "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400";
    case "Medium":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "Low":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
};

export const DashboardSecurityFeed: React.FC<DashboardSecurityFeedProps> = ({ feed }) => {
  return (
    <div className="flex flex-col justify-between h-full rounded-2xl border border-border/80 bg-card shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10 p-5">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-border/70">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">
              Security Pulse
            </h2>
            <Badge
              className="flex items-center gap-1.5 border border-primary/20 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full"
            >
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span>Live</span>
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground font-medium">Recent platform feed</span>
        </div>

        {feed.length === 0 ? (
          <div className="flex min-h-44 flex-col items-center justify-center gap-2 px-4 py-8 text-center text-muted-foreground">
            <Radio className="size-6 text-muted-foreground/60" />
            <p className="text-xs">No recent disclosure feed events recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50 mt-1">
            {feed.map((item, idx) => {
              const config = getFeedIcon(item.type);
              const Icon = config.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  className="py-3 px-2 hover:bg-primary/[0.03] rounded-xl transition-colors flex items-start gap-3 group"
                >
                  <div className="size-9 shrink-0 flex items-center justify-center rounded-xl mt-0.5 border border-primary/20 bg-primary/10 text-primary shadow-2xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="size-4" />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug truncate">
                        {item.title}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                        {item.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate">{item.programName}</span>
                      {item.severity && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wider rounded-md border",
                            getSeverityBadgeClass(item.severity),
                          )}
                        >
                          {item.severity}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
