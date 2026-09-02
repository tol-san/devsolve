"use client";

import React, { useState } from "react";
import { Coins, Eye, Globe, Loader2, RotateCcw, Send, Server, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useRequestRetestMutation,
  type ReportEnvironment,
} from "@/lib/redux/services/reportsApi";
import { apiErrorMessage } from "@/lib/api/error-message";
import { formatBountyAmount } from "@/lib/reports/retest";
import { cn } from "@/lib/utils";

type RetestRequestDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  reportTitle: string;
  submitterName: string;
  severity: string;
  defaultEndpoint?: string;
  /** The report's backend state. A retest may only be asked for from `RESOLVED`. */
  reportState?: string;
  onSuccess?: () => void;
};

const DEFAULT_NOTE =
  "We have pushed a remediation fix to the staging environment. Could you please retest using your original PoC steps and confirm if the vulnerability is resolved?";

const PRESET_RETESTS = [
  {
    label: "Staging Patch Verification",
    text: "We have pushed a remediation fix to the staging environment. Could you please retest using your original PoC steps and confirm if the vulnerability is resolved?",
  },
  {
    label: "Hotfix Deployed",
    text: "A security hotfix has been deployed. Please verify if the exploit payload is now blocked or sanitized.",
  },
  {
    label: "WAF & Boundary Mitigation",
    text: "Additional boundary authorization checks and WAF filters have been introduced. Please re-verify the affected endpoint.",
  },
];

const BONUS_SUGGESTIONS = [
  { label: "None", value: "" },
  { label: "+$25", value: "25.00" },
  { label: "+$50", value: "50.00" },
  { label: "+$100", value: "100.00" },
  { label: "+$250", value: "250.00" },
];

export function RetestRequestDialog({
  isOpen,
  onOpenChange,
  reportId,
  reportTitle,
  submitterName,
  severity,
  defaultEndpoint = "",
  reportState,
  onSuccess,
}: RetestRequestDialogProps) {
  const [environment, setEnvironment] = useState<ReportEnvironment>("STAGING");
  const [targetEndpoint, setTargetEndpoint] = useState(defaultEndpoint);
  const [bountyReward, setBountyReward] = useState("50.00");
  const [note, setNote] = useState(DEFAULT_NOTE);
  const [showPreview, setShowPreview] = useState(false);

  const [requestRetest, { isLoading }] = useRequestRetestMutation();

  /* The backend allows this only from `RESOLVED`, and answers a 409 naming
     the actual state otherwise. Saying so before the call is friendlier than
     letting them write a note and then be refused. */
  const isResolved = !reportState || reportState.toUpperCase() === "RESOLVED";

  /* Kept as the decimal string the API takes. Trimming to two places here
     matches `NUMERIC(10,2)` upstream, which refuses anything longer. */
  const normalizedBounty = bountyReward.trim().replace(/[^0-9.]/g, "");
  const isBountyValid =
    normalizedBounty === "" ||
    (/^\d+(\.\d{1,2})?$/.test(normalizedBounty) && /[1-9]/.test(normalizedBounty));

  const handleSendRetest = async () => {
    if (!isResolved) return;

    if (!isBountyValid) {
      toast.error("Enter a bonus over $0.01, or leave it empty.");
      return;
    }

    try {
      await requestRetest({
        id: reportId,
        environment,
        targetEndpoint: targetEndpoint.trim() || undefined,
        notes: note.trim() || undefined,
        bountyReward: normalizedBounty || undefined,
      }).unwrap();

      toast.success("Retest requested", {
        description: `${submitterName} has been asked to re-run their proof of concept on report #${reportId.slice(0, 8)}.`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      /* The upstream's 409s name the problem exactly — "A retest is already
         awaiting the researcher", "A final severity is required before
         requesting a retest", "This program does not offer monetary bounties"
         — so they are shown as written rather than flattened into one line. */
      toast.error("Retest could not be requested", {
        description: apiErrorMessage(
          error,
          "The retest service did not respond. Nothing was sent.",
        ),
      });
    }
  };

  const getEnvBadgeColor = (env: string) => {
    switch (env) {
      case "PRODUCTION":
        return "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300";
      case "STAGING":
        return "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300";
      case "TESTING":
        return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
      default:
        return "border-border bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border-border bg-card text-card-foreground shadow-xl p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex size-10 sm:size-11 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
              <RotateCcw className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground flex flex-wrap items-center gap-2">
                <span>Request a retest</span>
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5 break-words">
                Ask <strong className="text-foreground">{submitterName}</strong> to
                re-run their proof of concept on report #{reportId.slice(0, 8)}.
                They answer with one of two verdicts, and have until the
                deadline to do it.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!isResolved && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-sm leading-relaxed text-amber-900 dark:text-amber-200">
              Only a resolved report can be sent for retest, and this one is{" "}
              <strong>{reportState}</strong>. Resolve it first, or wait for the
              attempt already in flight to be answered.
            </div>
          )}

          {/* Summary Card */}
          <div className="rounded-xl border border-border bg-muted/40 p-3 sm:p-3.5 space-y-1.5 text-xs">
            <p className="font-semibold text-foreground break-words">{reportTitle}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
              <span>Researcher: <strong className="text-foreground">{submitterName}</strong></span>
              <span>&bull;</span>
              <span>Severity: <strong className="text-foreground">{severity}</strong></span>
            </div>
          </div>

          {/* Environment & Bonus Bounty Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="space-y-1.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Server className="size-3.5 text-blue-500" />
                  <span>Verification Environment</span>
                </label>
                <Select
                  value={environment}
                  onValueChange={(val) =>
                    setEnvironment((val as ReportEnvironment) || "STAGING")
                  }
                >
                  <SelectTrigger className="w-full h-9 rounded-xl border-border bg-background text-xs font-medium">
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent className="w-(--anchor-width) min-w-[260px] rounded-xl border-border bg-popover text-popover-foreground">
                    <SelectItem value="STAGING" className="text-xs font-medium">
                      🧪 Staging (staging.target.com)
                    </SelectItem>
                    <SelectItem value="PRODUCTION" className="text-xs font-medium">
                      🌐 Production Live
                    </SelectItem>
                    <SelectItem value="TESTING" className="text-xs font-medium">
                      🔍 QA / Testing Environment
                    </SelectItem>
                    <SelectItem value="DEVELOPMENT" className="text-xs font-medium">
                      🛠️ Development Sandbox
                    </SelectItem>
                    <SelectItem value="LOCAL" className="text-xs font-medium">
                      💻 Local Docker / Container
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Select the deployed environment where fixes are ready to be verified by the researcher.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Coins className="size-3.5 text-emerald-500" />
                  <span>Retest Bounty Bonus</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">$</span>
                <Input
                  inputMode="decimal"
                  placeholder="0.00"
                  value={bountyReward}
                  onChange={(e) => setBountyReward(e.target.value)}
                  aria-invalid={!isBountyValid}
                  className={cn(
                    "w-full h-9 pl-7 rounded-xl border-border bg-background text-sm font-semibold",
                    !isBountyValid && "border-red-500/60",
                  )}
                />
              </div>

              {/* Quick Bonus Suggestion Chips */}
              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                <span className="text-[10px] font-medium text-muted-foreground mr-0.5">Quick:</span>
                {BONUS_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.label}
                    type="button"
                    onClick={() => setBountyReward(sug.value)}
                    className={cn(
                      "px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer",
                      bountyReward === sug.value
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {sug.label}
                  </button>
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-snug pt-0.5">
                Paid when {submitterName.split(" ")[0]} submits a verdict &mdash;
                whichever verdict it is. It is only not paid if the retest
                goes unanswered.
              </p>
            </div>
          </div>

          {/* Target Endpoint */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Globe className="size-3.5 text-muted-foreground" />
              <span>Target Endpoint / Scope URL (Optional)</span>
            </label>
            <Input
              placeholder="e.g. https://staging-api.example.com/v1/invoices"
              value={targetEndpoint}
              onChange={(e) => setTargetEndpoint(e.target.value)}
              maxLength={1000}
              className="w-full h-9 rounded-xl border-border bg-background text-sm font-mono break-all"
            />
          </div>

          {/* Retest Instructions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Retest Instructions / Remediation Notes
              </label>
              <span className="text-[10px] text-muted-foreground">
                {note.length} / 2000 chars
              </span>
            </div>
            <Textarea
              placeholder="Provide instructions for the researcher to retest the deployed fix..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={2000}
              className="resize-none text-xs border-border bg-background leading-relaxed"
            />

            {/* Smart Templates */}
            <div className="space-y-1.5 pt-0.5">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Sparkles className="size-3 text-amber-500" />
                <span>One-click instruction templates:</span>
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {PRESET_RETESTS.map((preset) => (
                  <button
                    type="button"
                    key={preset.label}
                    onClick={() => setNote(preset.text)}
                    className="text-left text-[11px] p-2 sm:p-2.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer flex flex-col gap-0.5"
                  >
                    <span className="font-semibold text-foreground">{preset.label}</span>
                    <span className="line-clamp-2 sm:line-clamp-1 opacity-80 break-words">{preset.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <Eye className="size-3.5" />
              <span>{showPreview ? "Hide Preview" : "Preview Researcher Notification"}</span>
            </button>

            {showPreview && (
              <div className="mt-2 p-3 sm:p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <RotateCcw className="size-3 text-blue-500 shrink-0" />
                    <span>Retest Invitation for {submitterName}</span>
                  </span>
                  <Badge variant="outline" className={cn("text-[10px] uppercase font-bold shrink-0", getEnvBadgeColor(environment))}>
                    {environment}
                  </Badge>
                </div>
                {isBountyValid && normalizedBounty && (
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
                    <Coins className="size-3.5 text-emerald-500 shrink-0" />
                    <span>
                      {formatBountyAmount(normalizedBounty)} bonus, paid when you
                      submit your verdict
                    </span>
                  </div>
                )}
                {targetEndpoint && (
                  <p className="font-mono text-[11px] text-muted-foreground break-all">
                    Endpoint: {targetEndpoint}
                  </p>
                )}
                <p className="text-muted-foreground leading-relaxed italic break-words">
                  &ldquo;{note || "No custom instructions provided."}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto rounded-xl border-border cursor-pointer text-xs h-9"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSendRetest}
            disabled={isLoading || !isResolved || !isBountyValid}
            className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-2 cursor-pointer shadow-xs h-9"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            <span>Request retest</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
