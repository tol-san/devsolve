import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  Award,
  AlertCircle,
  XCircle,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import type { ReportItem } from "@/lib/types/reports/types";

interface StatusBadgeProps {
  status: ReportItem["status"] | string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case "RETESTING":
      return (
        <Badge
          variant="outline"
          className={`bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit shadow-2xs ${className || ""}`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-500 animate-spin-slow" />
          RETESTING
        </Badge>
      );
    case "VALID_CONFIRMED":
      return (
        <Badge
          variant="outline"
          className={`bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20 font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit ${className || ""}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          VALID CONFIRMED
        </Badge>
      );
    case "TRIAGING":
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20 font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit"
        >
          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          TRIAGING
        </Badge>
      );
    case "RESOLVED":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20 font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit"
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          RESOLVED
        </Badge>
      );
    case "ACCEPTED":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20 font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit"
        >
          <Award className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          ACCEPTED
        </Badge>
      );
    case "SUBMITTED":
      return (
        <Badge
          variant="outline"
          className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/20 font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit"
        >
          <AlertCircle className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
          SUBMITTED
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge
          variant="outline"
          className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/20 font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit"
        >
          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          REJECTED
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-border font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit"
        >
          {status}
        </Badge>
      );
  }
}
