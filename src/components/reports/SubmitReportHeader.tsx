"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, FileText } from "lucide-react";

export const SubmitReportHeader: React.FC = () => {
  return (
    <div className="space-y-4">
      <nav aria-label="Back Navigation">
        <Link
          href="/dashboard/my-reports"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Reports</span>
        </Link>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Submit Vulnerability Report
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Provide details of your finding following ethical disclosure guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs font-medium text-blue-800 dark:text-blue-300 max-w-sm shrink-0">
          <ShieldAlert className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <span>
            Strictly follow target program policies. Do not perform destructive attacks or access unauthorized user data.
          </span>
        </div>
      </div>
    </div>
  );
};
