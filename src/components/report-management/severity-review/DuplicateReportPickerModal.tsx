"use client";

import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  Copy,
  Search,
  X,
  CheckCircle2,
  Building2,
  Layers,
  User,
  Clock,
  AlertCircle,
} from "lucide-react";
import type {
  ManagedReport,
  ReportManagementDetail,
} from "@/components/report-management/types";
import { useGetManagedReportsQuery } from "@/lib/redux/services/reportsApi";
import { useGetProgramsQuery } from "@/lib/redux/services/program/programsApi";
import SeverityBadge from "@/components/reports/SeverityBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format/datetime";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isUuid = (val?: string): val is string => !!val && UUID_REGEX.test(val);

interface DuplicateReportPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentReport: ReportManagementDetail;
  onConfirmDuplicate: (targetReportId: string, note?: string) => Promise<void>;
  isSubmitting: boolean;
}

export function DuplicateReportPickerModal({
  isOpen,
  onClose,
  currentReport,
  onConfirmDuplicate,
  isSubmitting,
}: DuplicateReportPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    currentReport.programId || "all",
  );
  const [selectedReport, setSelectedReport] = useState<ManagedReport | null>(
    null,
  );
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualUuid, setManualUuid] = useState("");
  const [duplicateNote, setDuplicateNote] = useState("");

  const { data: managedReports = [], isLoading: isLoadingReports } =
    useGetManagedReportsQuery();
  const { data: programsData, isLoading: isLoadingPrograms } =
    useGetProgramsQuery();

  const programs = useMemo(
    () => programsData?.content ?? [],
    [programsData?.content],
  );

  const currentProgramName =
    currentReport.programName ||
    programs.find((p) => p.id === currentReport.programId)?.name ||
    "Current Program";

  // Filter candidate reports
  const filteredReports = useMemo(() => {
    const currentIdStr = String(currentReport.id).toLowerCase();
    const currentReportCode = (currentReport.reportId || "").toLowerCase();

    return managedReports.filter((report) => {
      // Exclude the current report itself
      const repIdStr = String(report.id).toLowerCase();
      const repCode = (report.reportId || "").toLowerCase();
      if (repIdStr === currentIdStr || (currentReportCode && repCode === currentReportCode)) {
        return false;
      }

      // Filter by program if specified
      if (selectedProgramId !== "all" && report.programId) {
        if (report.programId.toLowerCase() !== selectedProgramId.toLowerCase()) {
          return false;
        }
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (report.title || "").toLowerCase().includes(q);
        const matchCode = (report.reportId || "").toLowerCase().includes(q);
        const matchAuthor = (
          report.author ||
          report.authorUsername ||
          ""
        )
          .toLowerCase()
          .includes(q);
        const matchProg = (report.programName || "").toLowerCase().includes(q);
        const matchId = repIdStr.includes(q);

        return matchTitle || matchCode || matchAuthor || matchProg || matchId;
      }

      return true;
    });
  }, [
    managedReports,
    currentReport.id,
    currentReport.reportId,
    selectedProgramId,
    searchQuery,
  ]);

  const effectiveTargetId = isManualMode
    ? manualUuid.trim()
    : selectedReport
      ? String(selectedReport.id)
      : "";

  const isValidSelection = isUuid(effectiveTargetId);

  const handleSubmit = async () => {
    if (!isValidSelection || isSubmitting) return;
    await onConfirmDuplicate(effectiveTargetId, duplicateNote.trim());
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/60 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
              <Copy className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-foreground truncate">
                Close as a Duplicate
              </h3>
              <p className="truncate font-mono text-xs text-muted-foreground flex items-center gap-1.5">
                <span>Triaging #{currentReport.reportId || currentReport.id}</span>
                <span>•</span>
                <span className="font-sans truncate">{currentProgramName}</span>
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 p-5 overflow-y-auto flex-1">
          {/* Selected Report Preview (if chosen) */}
          {selectedReport ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] dark:bg-emerald-950/20 p-4 space-y-3 ring-1 ring-emerald-500/20">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  <span>Original Finding Selected</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedReport(null)}
                  className="h-7 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg px-2"
                >
                  Change Report
                </Button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                    {selectedReport.reportId || `#RPT-${String(selectedReport.id).slice(0, 8)}`}
                  </span>
                  <SeverityBadge severity={selectedReport.severity} />
                  {selectedReport.programName && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="size-3" />
                      {selectedReport.programName}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-foreground leading-snug">
                  {selectedReport.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
                  <span className="flex items-center gap-1">
                    <User className="size-3" />
                    {selectedReport.author || selectedReport.authorUsername || "Researcher"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDate(selectedReport.submittedAt || selectedReport.submittedAtIso)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-500/20 text-xs font-mono text-muted-foreground break-all">
                UUID: {String(selectedReport.id)}
              </div>
            </div>
          ) : isManualMode ? (
            /* Manual UUID Mode */
            <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="manualUuidInput"
                  className="text-sm font-semibold text-foreground"
                >
                  Original Report UUID
                </label>
                <button
                  type="button"
                  onClick={() => setIsManualMode(false)}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  ← Back to search
                </button>
              </div>
              <Input
                id="manualUuidInput"
                autoFocus
                value={manualUuid}
                onChange={(e) => setManualUuid(e.target.value)}
                placeholder="f08fe404-173e-4cd2-b2c2-810d40842780"
                className="h-11 border-border bg-card font-mono text-sm"
              />
              {manualUuid.trim() && !isUuid(manualUuid.trim()) && (
                <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="size-3.5" />
                  Must be a valid UUID format (8-4-4-4-12 hex characters)
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Paste the full UUID from the original report URL.
              </p>
            </div>
          ) : (
            /* Search & Filter Mode */
            <div className="space-y-3">
              {/* Program Scoping Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Search Within Program
                  </label>
                  <Select
                    value={selectedProgramId}
                    onValueChange={(val) => {
                      if (val) setSelectedProgramId(val);
                    }}
                  >
                    <SelectTrigger className="h-10 bg-card border-border text-xs sm:text-sm font-medium">
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {currentReport.programId && (
                        <SelectItem value={currentReport.programId}>
                          Current: {currentProgramName}
                        </SelectItem>
                      )}
                      <SelectItem value="all">
                        All Programs ({managedReports.length} reports)
                      </SelectItem>
                      {programs
                        .filter((p) => p.id !== currentReport.programId)
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search original report by title, #RPT ID, or researcher..."
                  className="h-11 pl-10 pr-9 border-border bg-card text-sm rounded-xl"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Reports List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>
                    Matching Reports ({filteredReports.length})
                  </span>
                  {selectedProgramId !== "all" && (
                    <button
                      type="button"
                      onClick={() => setSelectedProgramId("all")}
                      className="text-primary hover:underline cursor-pointer"
                    >
                      Show all programs
                    </button>
                  )}
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 rounded-xl border border-border/60 bg-muted/20 p-2">
                  {isLoadingReports || isLoadingPrograms ? (
                    <div className="space-y-2 p-2">
                      <div className="h-14 bg-muted/60 rounded-xl animate-pulse" />
                      <div className="h-14 bg-muted/60 rounded-xl animate-pulse" />
                      <div className="h-14 bg-muted/60 rounded-xl animate-pulse" />
                    </div>
                  ) : filteredReports.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <Layers className="size-8 text-muted-foreground mx-auto opacity-50" />
                      <p className="text-sm font-semibold text-foreground">
                        No matching reports found
                      </p>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        {searchQuery
                          ? `No reports found matching "${searchQuery}". Try broadening your search.`
                          : "No other reports available in this program scope."}
                      </p>
                      {selectedProgramId !== "all" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProgramId("all")}
                          className="text-xs font-semibold rounded-lg mt-1"
                        >
                          Search All Programs
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredReports.map((report) => (
                      <button
                        key={String(report.id)}
                        type="button"
                        onClick={() => setSelectedReport(report)}
                        className="w-full text-left p-3 rounded-xl border border-border/80 bg-card hover:bg-muted/80 hover:border-primary/50 transition-all shadow-2xs group flex flex-col gap-1.5 cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                              {report.reportId || `#RPT-${String(report.id).slice(0, 8)}`}
                            </span>
                            <SeverityBadge severity={report.severity} />
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDate(report.submittedAt || report.submittedAtIso)}
                          </span>
                        </div>

                        <div className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {report.title}
                        </div>

                        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span className="truncate flex items-center gap-1">
                            <User className="size-3" />
                            {report.author || report.authorUsername || "Researcher"}
                          </span>
                          {report.programName && (
                            <span className="truncate font-medium text-foreground/80 flex items-center gap-1 text-[11px]">
                              <Building2 className="size-3" />
                              {report.programName}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Switch to manual UUID entry */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setIsManualMode(true)}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                  >
                    Or enter report UUID manually
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Optional Note */}
          <div className="space-y-1.5 pt-1">
            <label
              htmlFor="duplicateNoteInput"
              className="text-sm font-semibold text-foreground"
            >
              Note for the Researcher (Optional)
            </label>
            <Textarea
              id="duplicateNoteInput"
              rows={2}
              value={duplicateNote}
              onChange={(e) => setDuplicateNote(e.target.value)}
              placeholder="Provide context on why this was marked as a duplicate..."
              className="resize-none border-border bg-card text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 border-t border-border bg-muted/40 p-4 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl font-semibold text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValidSelection || isSubmitting}
            className="rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 shadow-2xs gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Copy className="size-4" />
            <span>{isSubmitting ? "Closing as Duplicate…" : "Close as Duplicate"}</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
