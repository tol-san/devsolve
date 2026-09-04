import React from "react";
import { Badge } from "@/components/ui/badge";
import { Scale } from "lucide-react";
import type { ReportItem } from "@/lib/types/reports/types";

interface SeverityBadgeProps {
  severity: ReportItem["severity"] | string | null | undefined;
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  if (!severity) {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 font-semibold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit shadow-2xs"
      >
        <Scale className="size-3 text-amber-500" />
        DISPUTED / UNSETTLED
      </Badge>
    );
  }

  const norm = String(severity).toUpperCase();

  switch (norm) {
    case "CRITICAL":
      return (
        <Badge className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          CRITICAL
        </Badge>
      );
    case "HIGH":
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          HIGH
        </Badge>
      );
    case "MEDIUM":
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          MEDIUM
        </Badge>
      );
    case "LOW":
      return (
        <Badge className="bg-slate-500 hover:bg-slate-600 text-white font-semibold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          LOW
        </Badge>
      );
    case "NONE":
      return (
        <Badge className="bg-slate-400 dark:bg-slate-700 text-white font-semibold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit shadow-xs">
          NONE
        </Badge>
      );
    default:
      return (
        <Badge className="bg-slate-500 text-white font-semibold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit shadow-xs">
          {severity}
        </Badge>
      );
  }
}
