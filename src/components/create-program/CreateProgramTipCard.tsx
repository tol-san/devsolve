"use client";

import React from "react";
import { Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { StepTip } from "./types";

interface CreateProgramTipCardProps {
  tip?: StepTip;
}

export function CreateProgramTipCard({ tip }: CreateProgramTipCardProps) {
  if (!tip || (!tip.title && !tip.text)) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-blue-200/80 bg-blue-50/60 p-4 sm:p-5 shadow-xs dark:border-blue-500/20 dark:bg-blue-500/10">
      <AnimatePresence mode="wait">
        <motion.div
          key={tip.title || "tip"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <span className="flex size-6 sm:size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Lightbulb className="size-3.5 sm:size-4" />
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-blue-100">
              {tip.title}
            </h4>
          </div>
          <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-600 dark:text-blue-200/90 pl-8">
            {tip.text}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
