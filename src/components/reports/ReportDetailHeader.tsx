import React from "react";
import { ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { formatDateTime } from "@/lib/format/datetime";

interface ReportDetailHeaderProps {
  reportId: string;
  program: string;
  submittedAgo?: string;
  submittedAt?: string;
  isRejected?: boolean;
  onBack: () => void;
  onToggleDemoView?: (rejected: boolean) => void;
}

export function ReportDetailHeader({
  reportId,
  program,
  submittedAgo,
  submittedAt,
  onBack,
}: ReportDetailHeaderProps) {
  const displaySubmitted = submittedAt
    ? formatDateTime(submittedAt)
    : submittedAgo
    ? formatDateTime(submittedAgo) !== "—"
      ? formatDateTime(submittedAgo)
      : submittedAgo
    : "Recently";

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              My Reports
            </h1>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 font-bold text-xs px-2.5 py-0.5 rounded-md font-mono">
              {reportId}
            </Badge>
          </div>
          <p className="text-base text-muted-foreground font-medium">
            {program} &bull; Submitted {displaySubmitted}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onBack}
          className="self-start sm:self-auto cursor-pointer rounded-xl bg-card text-foreground hover:bg-muted transition-all gap-2 px-4 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
      </header>
    </div>
  );
}
