"use client";

import React from "react";
import { Building2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProgramStatCardsProps {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export const ProgramStatCards: React.FC<ProgramStatCardsProps> = ({
  total,
  pending,
  approved,
  rejected,
}) => {
  const stats = [
    {
      title: "Total Programs",
      value: total,
      subtext: `${pending} awaiting review`,
      icon: Building2,
    },
    {
      title: "Pending Review",
      value: pending,
      subtext: "Requires admin approval",
      icon: Clock,
    },
    {
      title: "Approved Programs",
      value: approved,
      subtext: "Passed admin review",
      icon: CheckCircle2,
    },
    {
      title: "Rejected Programs",
      value: rejected,
      subtext: "Declined by admin",
      icon: XCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
          >
            <Card className="gap-3 rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 py-5 shadow-xs transition-shadow hover:shadow-sm">
              <CardHeader className="grid grid-cols-[1fr_auto] items-center gap-3 px-5">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-0.5 px-5">
                <div className="text-2xl font-bold tabular-nums text-foreground">
                  {stat.value}
                </div>
                <CardDescription className="text-sm text-muted-foreground">
                  {stat.subtext}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
