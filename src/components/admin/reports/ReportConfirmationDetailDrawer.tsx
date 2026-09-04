"use client";

import React, { useState, useEffect } from "react";
import { ReportConfirmationItem } from "@/lib/types/admin/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldAlert,
  Building2,
  User,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  Copy,
  Check,
  FileText,
  Paperclip,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface ReportConfirmationDetailDrawerProps {
  report: ReportConfirmationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    id: string,
    status: "CONFIRMED" | "REJECTED" | "ESCALATED",
    severity: "Critical" | "High" | "Medium" | "Low",
    rewardEstimate: string,
    notes: string
  ) => Promise<void>;
}

export function ReportConfirmationDetailDrawer({
  report,
  isOpen,
  onClose,
  onConfirm,
}: ReportConfirmationDetailDrawerProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<
    "Critical" | "High" | "Medium" | "Low"
  >("High");
  const [bountyEstimate, setBountyEstimate] = useState("");
  const [triageNotes, setTriageNotes] = useState("");
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "poc" | "triage" | "timeline">("overview");

  useEffect(() => {
    if (report) {
      setSelectedSeverity(report.severity);
      setBountyEstimate(report.rewardEstimate || "");
      setTriageNotes(report.triageNotes || "");
    }
  }, [report]);

  if (!report) return null;

  const handleCopyPayload = () => {
    if (report.pocPayload) {
      navigator.clipboard.writeText(report.pocPayload);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  const handleAction = async (status: "CONFIRMED" | "REJECTED" | "ESCALATED") => {
    setIsSubmitting(true);
    try {
      await onConfirm(report.id, status, selectedSeverity, bountyEstimate, triageNotes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev.toLowerCase()) {
      case "critical":
        return "bg-rose-600 text-white font-bold";
      case "high":
        return "bg-orange-500 text-white font-bold";
      case "medium":
        return "bg-blue-600 text-white font-bold";
      default:
        return "bg-slate-600 text-white font-bold";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border p-6 shadow-2xl text-foreground">
        <DialogHeader className="space-y-3 pb-4 border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {report.reportCode && (
                <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  {report.reportCode}
                </span>
              )}
              <Badge className={`rounded-full px-2.5 py-0.5 text-xs ${getSeverityBadgeClass(report.severity)}`}>
                {report.severity}
              </Badge>
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-semibold border-border">
                {report.status}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Submitted {report.submittedAt}
            </div>
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {report.title}
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground flex flex-wrap items-center gap-4 pt-1">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4 text-muted-foreground" />
              Researcher: <strong className="text-foreground dark:text-foreground font-semibold">{report.researcherName}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Target: <strong className="text-foreground dark:text-foreground font-semibold">{report.companyName}</strong>
              {report.programName && <span className="text-muted-foreground"> ({report.programName})</span>}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-border pb-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === "overview"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Overview & Scope
          </button>
          <button
            onClick={() => setActiveTab("poc")}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === "poc"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            PoC & Attachments
          </button>
          <button
            onClick={() => setActiveTab("triage")}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === "triage"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Triage Audit Action
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === "timeline"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Activity History
          </button>
        </div>

        {/* Tab 1: Overview & Scope */}
        {activeTab === "overview" && (
          <div className="space-y-5 pt-2">
            {/* Target Asset & Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Target Asset / Scope</span>
                <div className="font-mono text-xs font-bold text-foreground break-all flex items-center justify-between">
                  <span>{report.targetAsset || "N/A"}</span>
                  {report.targetAsset && (
                    <a
                      href={report.targetAsset}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">CVSS Rating</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-rose-600 text-white text-xs font-bold px-2 py-0.5">
                    {report.cvssScore || "N/A"}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {report.cvssVector || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* CWE */}
            {report.cwe && (
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300">CWE Classification</span>
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">{report.cwe}</p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Vulnerability Description
              </h4>
              <p className="text-sm text-foreground leading-relaxed bg-card p-4 rounded-2xl border border-border">
                {report.description || "No description provided."}
              </p>
            </div>

            {/* Impact */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                Security Impact & Threat Assessment
              </h4>
              <p className="text-sm text-foreground leading-relaxed bg-card p-4 rounded-2xl border border-border">
                {report.impact || "No impact assessment provided."}
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: PoC & Attachments */}
        {activeTab === "poc" && (
          <div className="space-y-5 pt-2">
            {/* Steps to reproduce */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-foreground">
                Steps to Reproduce
              </h4>
              {report.reproduceSteps && report.reproduceSteps.length > 0 ? (
                <ol className="list-decimal list-inside space-y-2 text-sm text-foreground bg-muted/40 p-4 rounded-2xl border border-border">
                  {report.reproduceSteps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">No reproduction steps listed.</p>
              )}
            </div>

            {/* PoC Payload code block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground">
                  Proof of Concept Payload
                </h4>
                {report.pocPayload && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyPayload}
                    className="h-8 px-2.5 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    {copiedPayload ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        Copy Payload
                      </>
                    )}
                  </Button>
                )}
              </div>

              {report.pocPayload ? (
                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed max-h-60">
                  <code>{report.pocPayload}</code>
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">No payload snippet provided.</p>
              )}
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
                Submitted Evidence & Attachments
              </h4>
              {report.attachments && report.attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {report.attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-card text-xs font-medium text-foreground"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <span className="text-muted-foreground text-[11px] shrink-0 ml-2">
                        {file.size}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No attachments provided.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Triage Audit Action */}
        {activeTab === "triage" && (
          <div className="space-y-5 pt-2">
            {/* Severity Override */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground">
                Confirmed Severity Tier Override
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["Critical", "High", "Medium", "Low"] as const).map((sev) => (
                  <Button
                    key={sev}
                    type="button"
                    variant={selectedSeverity === sev ? "default" : "outline"}
                    onClick={() => setSelectedSeverity(sev)}
                    className={`rounded-xl h-10 text-sm font-semibold cursor-pointer ${
                      selectedSeverity === sev
                        ? sev === "Critical"
                          ? "bg-rose-600 text-white"
                          : sev === "High"
                          ? "bg-orange-500 text-white"
                          : sev === "Medium"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-white"
                        : "border-border text-foreground"
                    }`}
                  >
                    {sev}
                  </Button>
                ))}
              </div>
            </div>

            {/* Reward Estimate Input */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground">
                Suggested Bounty Payout Range
              </Label>
              <div className="relative">
                <Coins className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={bountyEstimate}
                  onChange={(e) => setBountyEstimate(e.target.value)}
                  placeholder="e.g. $3,500 - $5,000"
                  className="pl-9 h-10 bg-card border-border rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Triager Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground">
                Triager Internal Notes & Justification
              </Label>
              <textarea
                value={triageNotes}
                onChange={(e) => setTriageNotes(e.target.value)}
                placeholder="Add audit justification notes for the program owner..."
                rows={3}
                className="w-full p-3 bg-card border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-border flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="destructive"
                disabled={isSubmitting}
                onClick={() => handleAction("REJECTED")}
                className="rounded-xl h-10 font-semibold cursor-pointer w-full sm:w-auto"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Reject as Spam / Out of Scope
              </Button>
              <Button
                variant="outline"
                disabled={isSubmitting}
                onClick={() => handleAction("ESCALATED")}
                className="rounded-xl h-10 font-semibold border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer w-full sm:w-auto"
              >
                <AlertTriangle className="w-4 h-4 mr-1.5 text-purple-600" />
                Escalate to Lead
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={() => handleAction("CONFIRMED")}
                className="rounded-xl h-10 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer w-full sm:w-auto shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Confirm & Route to Company
              </Button>
            </div>
          </div>
        )}

        {/* Tab 4: Activity History Timeline */}
        {activeTab === "timeline" && (
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold text-foreground">
              Report Audit Timeline
            </h4>
            {report.auditLog && report.auditLog.length > 0 ? (
              <div className="space-y-3 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {report.auditLog.map((log) => (
                  <div key={log.id} className="relative space-y-1">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{log.action}</span>
                      <span className="text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">By: {log.actor}</p>
                    {log.note && (
                      <div className="text-xs p-2.5 rounded-xl bg-muted text-foreground mt-1">
                        {log.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No activity logged yet.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
