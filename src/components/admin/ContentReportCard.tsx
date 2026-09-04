"use client";

import React from "react";
import Link from "next/link";
import { Flag, AlertTriangle, User, ShieldX, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ContentReportItem } from "@/lib/redux/services/adminApi";

type ReportAction = "DISMISS" | "WARN" | "REMOVE";

interface ContentReportCardProps {
  report: ContentReportItem;
  onAction: (id: string, action: ReportAction) => void;
  onViewDetail?: (id: string) => void;
}

export function ContentReportCard({ report, onAction, onViewDetail }: ContentReportCardProps) {
  return (
    <Card className="rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-xs transition duration-200">
      <CardContent className="p-0 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
            <Badge
              variant="outline"
              className="rounded-lg border-border bg-muted px-2.5 py-0.5 font-semibold text-muted-foreground"
            >
              {report.type}
            </Badge>
            <h3
              onClick={() => onViewDetail?.(report.id)}
              className="text-base font-bold text-foreground tracking-tight leading-snug cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              {report.title}
            </h3>
          </div>
          <span className="text-xs text-muted-foreground font-medium shrink-0 mt-0.5">
            {report.timestamp}
          </span>
        </div>

        {report.snippet && (
          <p
            onClick={() => onViewDetail?.(report.id)}
            className="text-sm text-muted-foreground bg-muted/60 p-3 rounded-xl border border-border leading-relaxed font-normal cursor-pointer hover:bg-muted transition"
          >
            {report.snippet}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 font-bold text-foreground bg-muted px-2.5 py-1 rounded-lg">
            <Flag className="size-3.5 text-muted-foreground" />
            <span>{report.reportCount} reports</span>
          </div>

          <Badge
            variant="outline"
            className="rounded-lg border-border bg-card px-2.5 py-0.5 font-semibold text-muted-foreground"
          >
            {report.reason}
          </Badge>

          <div className="flex items-center gap-1 font-medium text-muted-foreground">
            <User className="size-3.5 text-muted-foreground" />
            <span>Author:</span>
            {report.authorId ? (
              <Link
                href={`/profile/${report.authorId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                @{report.author}
              </Link>
            ) : (
              <strong className="text-foreground font-semibold">
                @{report.author}
              </strong>
            )}
          </div>

          {report.pastViolationsCount && report.pastViolationsCount > 0 ? (
            <span className="text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5 font-bold flex items-center gap-1 text-xs">
              <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400" />
              {report.pastViolationsCount} past violations
            </span>
          ) : null}
        </div>

        <div className="border-t border-border pt-3.5 flex items-center justify-between text-xs">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAction(report.id, "DISMISS")}
            className="h-9 cursor-pointer rounded-xl border-border bg-card px-3 font-semibold text-foreground hover:bg-muted"
          >
            <Check data-icon="inline-start" />
            Dismiss
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAction(report.id, "WARN")}
              className="h-9 cursor-pointer rounded-xl border-border bg-card px-3.5 font-semibold text-foreground hover:bg-muted"
            >
              <AlertTriangle data-icon="inline-start" className="text-amber-500" />
              Warn author
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onAction(report.id, "REMOVE")}
              className="h-9 cursor-pointer rounded-xl px-3.5 font-semibold shadow-2xs"
            >
              <ShieldX data-icon="inline-start" />
              Remove content
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
