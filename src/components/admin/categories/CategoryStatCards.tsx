"use client";

import React from "react";
import { motion } from "motion/react";
import { CircleSlash, LayoutTemplate, MessageSquare, Tags } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CategoryResponse } from "@/lib/redux/services/categoriesApi";

export function CategoryStatCards({
  categories,
}: {
  categories: CategoryResponse[];
}) {
  const total = categories.length;
  const active = categories.filter((c) => c.isActive).length;
  const problems = categories.filter((c) => c.scope === "PROBLEM").length;
  const showcases = categories.filter((c) => c.scope === "SHOWCASE").length;

  const stats = [
    {
      title: "Total Categories",
      value: total,
      subtext: `${total - active} inactive`,
      icon: Tags,
    },
    {
      title: "Active",
      value: active,
      subtext: "Offered in the pickers",
      icon: CircleSlash,
    },
    {
      title: "Problem Scope",
      value: problems,
      subtext: "Filed against problems",
      icon: MessageSquare,
    },
    {
      title: "Showcase Scope",
      value: showcases,
      subtext: "Filed against showcases",
      icon: LayoutTemplate,
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
            <Card className="gap-3 rounded-2xl border-none bg-card text-card-foreground py-5 shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10">
              <CardHeader className="grid grid-cols-[1fr_auto] items-center gap-3 px-5">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-0.5 px-5">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-none">
                  {stat.value}
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  {stat.subtext}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
