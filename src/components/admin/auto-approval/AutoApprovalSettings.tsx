"use client";

import React, { useState } from "react";
import {
  Sparkles,
  MessageSquareWarning,
  LayoutTemplate,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useGetAutoApprovalRulesQuery,
  useUpdateAutoApprovalRuleMutation,
  type AutoApprovalRule,
  type AutoApprovalTarget,
} from "@/lib/redux/services/admin/autoApprovalApi";
import { cn } from "@/lib/utils";

/**
 * Parses server-local ISO strings (e.g. "2026-09-03T17:04:11") without UTC shifting.
 */
function formatServerLocalDateTime(iso?: string | null): string {
  if (!iso) return "—";

  // If no timezone is present, treat as local time by splitting parts
  try {
    const parts = iso.split(/[-T:]/);
    if (parts.length >= 5) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const hour = parseInt(parts[3], 10);
      const minute = parseInt(parts[4], 10);
      const date = new Date(year, month, day, hour, minute);

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    }
  } catch {
    // fallback
  }

  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

interface TargetMeta {
  title: string;
  description: string;
  icon: typeof MessageSquareWarning;
  badgeText: string;
}

const TARGET_CONFIG: Record<AutoApprovalTarget, TargetMeta> = {
  PROBLEM: {
    title: "Problems",
    description:
      "Community problem submissions. When approved, problems are published to the open discussions feed.",
    icon: MessageSquareWarning,
    badgeText: "Problem Submissions",
  },
  SHOWCASE: {
    title: "Showcases",
    description:
      "Project showcase guides with build steps. When approved, showcases become publicly browseable.",
    icon: LayoutTemplate,
    badgeText: "Showcase Submissions",
  },
};

export function AutoApprovalSettings() {
  const {
    data: rules,
    isLoading,
    isError,
    refetch,
  } = useGetAutoApprovalRulesQuery();

  const [updateRule, { isLoading: isUpdating }] =
    useUpdateAutoApprovalRuleMutation();

  // Target currently waiting for confirmation to turn ON
  const [confirmingTarget, setConfirmingTarget] =
    useState<AutoApprovalTarget | null>(null);

  const handleToggle = async (target: AutoApprovalTarget, currentlyEnabled: boolean) => {
    if (!currentlyEnabled) {
      // Prompt requirement: confirm strictly on turning ON
      setConfirmingTarget(target);
    } else {
      // Turning OFF: immediate update without confirmation dialog
      try {
        await updateRule({ target, enabled: false }).unwrap();
        toast.success(`Auto-approval disabled for ${TARGET_CONFIG[target].title}.`);
      } catch {
        toast.error(`Could not disable auto-approval for ${TARGET_CONFIG[target].title}.`);
      }
    }
  };

  const handleConfirmTurnOn = async () => {
    if (!confirmingTarget) return;
    const target = confirmingTarget;
    setConfirmingTarget(null);

    try {
      await updateRule({ target, enabled: true }).unwrap();
      toast.success(`Auto-approval enabled for ${TARGET_CONFIG[target].title}.`, {
        description: "AI check is now actively screening submissions for this kind.",
      });
    } catch {
      toast.error(`Could not enable auto-approval for ${TARGET_CONFIG[target].title}.`);
    }
  };

  if (isLoading) {
    return <AutoApprovalSkeleton />;
  }

  if (isError || !rules) {
    return (
      <Card className="p-8 text-center border-border bg-card">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 mb-3">
          <AlertTriangle className="size-6" />
        </div>
        <CardTitle className="text-lg font-bold text-foreground">
          Unable to Load Auto-Approval Settings
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          The auto-approval service returned an unexpected response. Please try again.
        </CardDescription>
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => void refetch()}
            className="rounded-xl"
          >
            <RotateCcw className="size-4 mr-1.5" />
            Try again
          </Button>
        </div>
      </Card>
    );
  }

  // Ensure both targets exist in order
  const displayRules: AutoApprovalRule[] = [
    rules.find((r) => r.target === "PROBLEM") || {
      target: "PROBLEM",
      enabled: false,
      available: false,
      updatedBy: null,
      updatedAt: null,
    },
    rules.find((r) => r.target === "SHOWCASE") || {
      target: "SHOWCASE",
      enabled: false,
      available: false,
      updatedBy: null,
      updatedAt: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Explanatory Risk Control Banner ── */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-purple-50/60 p-5 dark:border-blue-500/20 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/20">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <Sparkles className="size-5" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>Automated AI Quality & Safety Screening</span>
              <Badge variant="outline" className="bg-background/80 text-xs font-semibold">
                Risk Control
              </Badge>
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              When on, submissions are checked automatically and published if they are
              free of abusive or sexual content and are about software or security.
              Anything the check is unsure about still waits for a moderator. Nothing
              is ever rejected automatically.
            </p>
          </div>
        </div>
      </div>

      {/* ── Kind Configuration Rows ── */}
      <div className="grid grid-cols-1 gap-5">
        {displayRules.map((rule) => {
          const config = TARGET_CONFIG[rule.target];
          const Icon = config.icon;

          // Matrix:
          // enabled && available: Switch ON, working.
          // enabled && !available: Switch ON, but nothing is running — warn next to it.
          // !enabled && available: Switch OFF. Normal.
          // !enabled && !available: Switch OFF and disabled, tooltip "No review model configured".
          const isSwitchDisabled = !rule.available && !rule.enabled;

          return (
            <Card
              key={rule.target}
              className={cn(
                "border-border bg-card transition-all duration-200 shadow-xs",
                rule.enabled && rule.available && "ring-1 ring-blue-500/30",
                rule.enabled && !rule.available && "ring-1 ring-amber-500/30",
              )}
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: Icon & Meta */}
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-2xl border",
                        rule.enabled && rule.available
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : rule.enabled && !rule.available
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "border-border bg-muted/60 text-muted-foreground",
                      )}
                    >
                      <Icon className="size-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-lg font-bold text-foreground">
                          {config.title}
                        </h3>

                        {/* Status Badge according to matrix */}
                        {rule.enabled && rule.available && (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 flex items-center gap-1.5 font-semibold text-xs">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Auto-approval active
                          </Badge>
                        )}

                        {rule.enabled && !rule.available && (
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 flex items-center gap-1.5 font-semibold text-xs">
                            <AlertTriangle className="size-3.5" />
                            Model unavailable
                          </Badge>
                        )}

                        {!rule.enabled && rule.available && (
                          <Badge variant="outline" className="text-muted-foreground text-xs font-semibold">
                            Manual moderation only
                          </Badge>
                        )}

                        {!rule.enabled && !rule.available && (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground text-xs font-semibold border-dashed"
                            title="No review model configured on server"
                          >
                            Model unconfigured
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                        {config.description}
                      </p>

                      {/* Audit stamp: last changed by {updatedBy} on {updatedAt} */}
                      <div className="pt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
                        {rule.updatedBy || rule.updatedAt ? (
                          <>
                            {rule.updatedBy && (
                              <span className="flex items-center gap-1">
                                <User className="size-3 text-muted-foreground/70" />
                                <span>Changed by {rule.updatedBy.slice(0, 8)}…</span>
                              </span>
                            )}
                            {rule.updatedAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="size-3 text-muted-foreground/70" />
                                <span>{formatServerLocalDateTime(rule.updatedAt)}</span>
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground/60 italic">
                            Default state — not changed yet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Switch & Warnings */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground sm:hidden">
                        {rule.enabled ? "Enabled" : "Disabled"}
                      </span>
                      <div
                        title={
                          isSwitchDisabled
                            ? "No review model configured"
                            : rule.enabled
                            ? "Click to disable auto-approval"
                            : "Click to enable auto-approval"
                        }
                      >
                        <Switch
                          id={`switch-${rule.target}`}
                          checked={rule.enabled}
                          disabled={isSwitchDisabled || isUpdating}
                          onCheckedChange={() => handleToggle(rule.target, rule.enabled)}
                          aria-label={`Toggle auto-approval for ${config.title}`}
                        />
                      </div>
                    </div>

                    {isSwitchDisabled && (
                      <span className="text-xs text-muted-foreground font-medium italic">
                        No review model configured
                      </span>
                    )}
                  </div>
                </div>

                {/* Notice banner if switch is ON but model is not available */}
                {rule.enabled && !rule.available && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <p className="leading-relaxed">
                      <strong>Auto-approval is turned on, but nothing is currently running.</strong> The server has no review model configured (e.g. GEMINI_API_KEY). Submissions will continue waiting for human moderators until the review model is initialized.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Confirmation Modal: Strictly on Turning ON ── */}
      <Dialog
        open={confirmingTarget !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmingTarget(null);
        }}
      >
        <DialogContent className="max-w-md rounded-3xl p-6 bg-card border-border">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
              <ShieldCheck className="size-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Enable AI Auto-Approval for{" "}
              {confirmingTarget ? TARGET_CONFIG[confirmingTarget].title : ""}?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              This setting allows valid submissions to reach the public platform
              without prior human moderator review.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-border bg-muted/40 p-4 text-xs leading-relaxed text-foreground space-y-2">
            <p className="font-semibold text-foreground">How the safety gate works:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Submissions are screened against abuse, sexual content, and relevancy.</li>
              <li>Anything the check is unsure about continues waiting for a moderator.</li>
              <li>Nothing is ever automatically rejected.</li>
            </ul>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmingTarget(null)}
              className="rounded-xl h-11"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleConfirmTurnOn()}
              className="rounded-xl h-11 bg-blue-600 text-white hover:bg-blue-700 font-semibold"
            >
              Confirm & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AutoApprovalSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading auto-approval settings">
      <div className="h-24 rounded-2xl bg-muted/60" />
      <div className="space-y-5">
        <div className="h-36 rounded-2xl bg-muted/60" />
        <div className="h-36 rounded-2xl bg-muted/60" />
      </div>
    </div>
  );
}
