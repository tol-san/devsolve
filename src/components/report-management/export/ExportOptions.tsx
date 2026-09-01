"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarRange,
  CheckCircle2,
  Eye,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Loader2,
  Sparkles,
  X,
  ArrowRight,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react"; 

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ExportTemplate = {
  id: string;
  name: string;
  format: "CSV" | "PDF" | "ZIP";
  description: string;
  detail: string;
  icon: typeof FileSpreadsheet;
};

const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: "queue-summary",
    name: "Queue Summary",
    format: "CSV",
    description: "Export report IDs, status, severity, assignee, and decision timestamps.",
    detail: "Includes moderation fields, queue ownership, and timeline columns.",
    icon: FileSpreadsheet,
  },
  {
    id: "moderation-audit",
    name: "Moderation Audit",
    format: "PDF",
    description: "Generate a clean review packet for approvals, analyst comments, and timelines.",
    detail: "Prepared for sign-off, compliance archive, and stakeholder review.",
    icon: FileText,
  },
  {
    id: "evidence-package",
    name: "Evidence Package",
    format: "ZIP",
    description: "Bundle attachments, screenshots, and notes into a single handoff archive.",
    detail: "Packages evidence files, notes, and case metadata into one bundle.",
    icon: FileArchive,
  },
];

const FILTER_OPTIONS = {
  status: ["All reports", "Open", "Closed", "Pending review"],
  severity: ["All severities", "Critical", "High", "Medium", "Low"],
  fields: [
    "Report metadata",
    "Researcher details",
    "Severity history",
    "Evidence references",
    "Queue timestamps",
  ],
} as const;

type GenerateState = "idle" | "loading" | "success" | "error";

export function ExportOptions() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("2026-07-01");
  const [dateTo, setDateTo] = useState("2026-07-31");
  const [reportStatus, setReportStatus] = useState<string>("All reports");
  const [severity, setSeverity] = useState<string>("All severities");
  const [includedFields, setIncludedFields] = useState<string[]>([
    "Report metadata",
    "Severity history",
    "Evidence references",
  ]);
  const [generateState, setGenerateState] = useState<GenerateState>("idle");

  const selectedTemplate = useMemo(
    () => EXPORT_TEMPLATES.find((t) => t.id === selectedTemplateId) ?? null,
    [selectedTemplateId]
  );

  useEffect(() => {
    if (generateState !== "loading") return;
    const timeoutId = window.setTimeout(() => setGenerateState("success"), 1300);
    return () => window.clearTimeout(timeoutId);
  }, [generateState]);

  function toggleField(field: string) {
    setIncludedFields((prev) =>
      prev.includes(field) ? prev.filter((i) => i !== field) : [...prev, field]
    );
  }

  function handleGenerateExport() {
    if (!selectedTemplate) return;
    if (!dateFrom || !dateTo || dateFrom > dateTo || includedFields.length === 0) {
      setGenerateState("error");
      return;
    }
    setGenerateState("loading");
  }

  return (
    <>
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Export Templates</h2>
          <p className="text-xs text-slate-500">
            Choose a preset workflow to quickly build files for moderation queues, audits, or evidence handoffs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {EXPORT_TEMPLATES.map((template) => {
            const Icon = template.icon;

            return (
              <motion.div
                key={template.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Card className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:border-blue-300 hover:shadow-md">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100/80">
                        <Icon className="size-5" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase text-slate-600"
                      >
                        {template.format}
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-1.5">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {template.description}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {template.detail}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 pt-4 border-t border-slate-100">
                    <Button
                      type="button"
                      onClick={() => setSelectedTemplateId(template.id)}
                      className="flex-1 h-9 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all"
                    >
                      <span>Create export</span>
                      <Sparkles className="size-3.5 ml-1.5 opacity-80" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setSelectedTemplateId(template.id)}
                      className="h-9 rounded-lg px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      <Eye className="size-3.5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Configuration Modal */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs"
            onClick={() => setSelectedTemplateId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <selectedTemplate.icon className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedTemplate.name}</h3>
                    <p className="text-xs text-slate-500">Configure parameters before rendering package</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTemplateId(null)}
                  className="size-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="size-4" />
                </Button>
              </div>

              {/* Body Content */}
              <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-5">
                <div className="space-y-4 md:col-span-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Date from</label>
                      <DatePicker
                        value={dateFrom}
                        onChange={(val) => setDateFrom(val)}
                        placeholder="Start date"
                        className="h-9 rounded-lg border-border text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Date to</label>
                      <DatePicker
                        value={dateTo}
                        onChange={(val) => setDateTo(val)}
                        placeholder="End date"
                        min={dateFrom || undefined}
                        className="h-9 rounded-lg border-border text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Status</label>
                      <Select value={reportStatus} onValueChange={(val) => val && setReportStatus(val)}>
                        <SelectTrigger className="h-9 w-full rounded-lg border-border bg-card text-xs text-foreground">
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          {FILTER_OPTIONS.status.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Severity</label>
                      <Select value={severity} onValueChange={(val) => val && setSeverity(val)}>
                        <SelectTrigger className="h-9 w-full rounded-lg border-border bg-card text-xs text-foreground">
                          <SelectValue placeholder="All severities" />
                        </SelectTrigger>
                        <SelectContent>
                          {FILTER_OPTIONS.severity.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <CalendarRange className="size-3.5 text-blue-600" />
                      Included Fields
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {FILTER_OPTIONS.fields.map((field) => {
                        const active = includedFields.includes(field);
                        return (
                          <button
                            key={field}
                            type="button"
                            onClick={() => toggleField(field)}
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[11px] font-medium transition-all",
                              active
                                ? "bg-blue-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            )}
                          >
                            {field}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Sidebar Summary */}
                <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 md:col-span-2">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Summary
                    </span>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Format:</span>
                        <span className="font-semibold text-slate-800">{selectedTemplate.format}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Fields:</span>
                        <span className="font-semibold text-slate-800">{includedFields.length} selected</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Scope:</span>
                        <span className="font-semibold text-slate-800">{reportStatus}</span>
                      </div>
                    </div>

                    {generateState === "success" && (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 flex items-start gap-2">
                        <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Export requested successfully! Check recent exports.</span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleGenerateExport}
                    disabled={generateState === "loading"}
                    className="w-full mt-4 h-9 rounded-lg bg-blue-600 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                  >
                    {generateState === "loading" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Generate Export"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}