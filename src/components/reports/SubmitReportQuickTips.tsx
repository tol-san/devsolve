"use client";

import React from "react";
import { BookOpen, CheckCircle2 } from "lucide-react";

export const SubmitReportQuickTips: React.FC = () => {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-3 font-sans">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span>Triage Quick Tips</span>
      </div>

      <ul className="space-y-2.5 text-sm text-foreground font-medium">
        <li className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <span>Include full HTTP request & response when applicable</span>
        </li>
        <li className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <span>Specific, clear titles get triaged up to 2x faster</span>
        </li>
        <li className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <span>Accurate CVSS scores assist faster bounty calculation</span>
        </li>
      </ul>
    </div>
  );
};

