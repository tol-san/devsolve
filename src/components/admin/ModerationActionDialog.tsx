"use client";

import React, { useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Trash2,
  ShieldAlert,
  UserX,
  Ban,
  RotateCcw,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateModerationActionMutation } from "@/lib/redux/services/admin/moderationActionsApi";
import { useUpdateContentReportActionMutation } from "@/lib/redux/services/admin/moderationApi";
import type {
  ModerationActionType,
  ModerationActionTargetType,
  ContentReportItem,
} from "@/lib/types/admin/types";
import { DateTimePicker } from "@/components/ui/datetime-picker";

export interface TargetDetails {
  id: string;
  name: string;
  subtitle?: string;
  type?: string;
  status?: string;
}

interface ModerationActionDialogProps {
  report?: ContentReportItem | null;
  target?: TargetDetails | null;
  actionType?: ModerationActionType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onConfirm?: (id: string, action: ModerationActionType, note?: string) => void;
}

const ACTION_OPTIONS: {
  value: ModerationActionType;
  label: string;
  description: string;
}[] = [
  { value: "WARN", label: "WARN", description: "Issue a formal warning" },
  { value: "SUSPEND", label: "SUSPEND", description: "Temporarily suspend account access" },
  { value: "REMOVE", label: "REMOVE", description: "Remove content or target" },
  { value: "BAN", label: "BAN", description: "Permanently ban account" },
  { value: "REINSTATE", label: "REINSTATE", description: "Restore full account access" },
];

const ACTION_SELECT_ITEMS = ACTION_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.label,
}));

const REASON_PRESETS: Record<ModerationActionType, string[]> = {
  REINSTATE: [
    "Account review completed — restrictions lifted.",
    "False positive report resolved.",
    "Appealed by user and verified compliant.",
    "Temporary suspension period completed.",
  ],
  WARN: [
    "First warning for community guidelines violation.",
    "Inappropriate content or comments detected.",
    "Refused file upload flagged by VirusTotal security scanner.",
    "Please adhere to respectful collaboration standards.",
  ],
  SUSPEND: [
    "Repeated violations of community guidelines.",
    "Malicious file upload attempt detected via VirusTotal guard.",
    "Suspended pending investigation of suspicious file uploads.",
    "Suspicious activity requiring investigation.",
    "Harassment or abusive conduct reported.",
  ],
  BAN: [
    "Severe or persistent terms of service violations.",
    "Permanent ban for uploading/distributing malware payloads.",
    "Critical security violation: Attempted malicious payload deployment.",
    "Confirmed malicious actor or fraudulent activity.",
  ],
  REMOVE: [
    "Content violates platform quality or safety guidelines.",
    "Flagged by community as spam or inappropriate.",
  ],
};

const moderationActionSchema = z
  .object({
    action: z.enum(["WARN", "SUSPEND", "REMOVE", "BAN", "REINSTATE"]),
    reason: z
      .string()
      .trim()
      .min(1, "Moderation reason is required.")
      .max(2000, "Reason cannot exceed 2000 characters."),
    expiresAt: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.action === "SUSPEND" && (!data.expiresAt || !data.expiresAt.trim())) {
        return false;
      }
      return true;
    },
    {
      message: "Action expiration date is required for suspension.",
      path: ["expiresAt"],
    },
  );

type ModerationActionFormValues = z.infer<typeof moderationActionSchema>;

export function ModerationActionDialog({
  report,
  target,
  actionType: initialActionType,
  isOpen,
  onClose,
  onSuccess,
  onConfirm,
}: ModerationActionDialogProps) {
  const targetId = report?.id || target?.id;
  if (!isOpen || !targetId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModerationActionForm
        key={`${targetId}-${initialActionType ?? "default"}`}
        report={report}
        target={target}
        initialActionType={initialActionType}
        onClose={onClose}
        onSuccess={onSuccess}
        onConfirm={onConfirm}
      />
    </Dialog>
  );
}

function ModerationActionForm({
  report,
  target,
  initialActionType,
  onClose,
  onSuccess,
  onConfirm,
}: {
  report?: ContentReportItem | null;
  target?: TargetDetails | null;
  initialActionType?: ModerationActionType | null;
  onClose: () => void;
  onSuccess?: () => void;
  onConfirm?: (id: string, action: ModerationActionType, note?: string) => void;
}) {
  const defaultAction = initialActionType || "WARN";

  const isTargetRemoved =
    (report?.status as string) === "REMOVED" ||
    target?.status === "REMOVED";
  const isTargetSuspended =
    (report?.status as string) === "SUSPENDED" ||
    target?.status === "SUSPENDED";
  const isTargetActive =
    (report?.status as string) === "ACTIVE" ||
    target?.status === "ACTIVE";

  const getDefaultExpiresAt = () => {
    if (defaultAction === "SUSPEND") {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      return d.toISOString().slice(0, 16);
    }
    return "";
  };

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ModerationActionFormValues>({
    resolver: zodResolver(moderationActionSchema),
    defaultValues: {
      action: defaultAction,
      reason: "",
      expiresAt: getDefaultExpiresAt(),
    },
  });

  const action = useWatch({ control, name: "action" }) ?? defaultAction;
  const reasonValue = useWatch({ control, name: "reason" }) ?? "";

  const [createModerationAction, { isLoading: isCreatingAction }] =
    useCreateModerationActionMutation();
  const [updateContentReport, { isLoading: isUpdatingReport }] =
    useUpdateContentReportActionMutation();

  const isSubmitting = isCreatingAction || isUpdatingReport;

  const targetId = report?.id || target?.id || "";
  const targetName = report?.author || target?.name || "Target Entity";
  const targetTitle = report?.title || target?.subtitle || target?.type || "";

  const handleActionChange = (newAction: ModerationActionType) => {
    setValue("action", newAction, { shouldValidate: true });
    if (newAction === "SUSPEND") {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setValue("expiresAt", d.toISOString().slice(0, 16), { shouldValidate: true });
    }
  };

  const setPresetDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setValue("expiresAt", d.toISOString().slice(0, 16), { shouldValidate: true });
  };

  const getActionColorClass = (act: ModerationActionType) => {
    switch (act) {
      case "WARN":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      case "SUSPEND":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20";
      case "REMOVE":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
      case "BAN":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20";
      case "REINSTATE":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getActionIcon = (act: ModerationActionType) => {
    switch (act) {
      case "WARN":
        return <ShieldAlert className="size-5" />;
      case "SUSPEND":
        return <UserX className="size-5" />;
      case "REMOVE":
        return <Trash2 className="size-5" />;
      case "BAN":
        return <Ban className="size-5" />;
      case "REINSTATE":
        return <RotateCcw className="size-5" />;
    }
  };

  const getButtonBgClass = (act: ModerationActionType) => {
    switch (act) {
      case "WARN":
        return "bg-amber-600 hover:bg-amber-700 text-white";
      case "SUSPEND":
        return "bg-orange-600 hover:bg-orange-700 text-white";
      case "REMOVE":
        return "bg-rose-600 hover:bg-rose-700 text-white";
      case "BAN":
        return "bg-purple-600 hover:bg-purple-700 text-white";
      case "REINSTATE":
        return "bg-emerald-600 hover:bg-emerald-700 text-white";
    }
  };

  const onSubmit = async (values: ModerationActionFormValues) => {
    try {
      const formattedExpiresAt =
        values.action === "SUSPEND" && values.expiresAt
          ? new Date(values.expiresAt).toISOString()
          : undefined;

      if (report) {
        await updateContentReport({
          id: report.id,
          action: values.action,
          resolutionNote: values.reason.trim(),
          removeContent: values.action === "REMOVE",
        }).unwrap();
      } else {
        const targetType =
          (target?.type as ModerationActionTargetType) || "USER";

        await createModerationAction({
          id: targetId,
          body: {
            targetType,
            targetId,
            action: values.action,
            reason: values.reason.trim(),
            expiresAt: formattedExpiresAt,
          },
        }).unwrap();
      }

      toast.success(`Moderation action '${values.action}' applied successfully.`);
      if (onConfirm) {
        onConfirm(targetId, values.action, values.reason.trim());
      }
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to apply moderation action.";
      toast.error(message);
    }
  };

  const availableReasonPresets = useMemo(
    () => REASON_PRESETS[action] ?? [],
    [action]
  );

  return (
    <DialogContent className="sm:max-w-md rounded-2xl bg-card border border-border text-card-foreground p-6 shadow-xl space-y-4">
      <DialogHeader className="space-y-2">
        <div className="flex items-center gap-3">
          <div
            className={`size-11 rounded-2xl flex items-center justify-center shrink-0 ${getActionColorClass(
              action
            )}`}
          >
            {getActionIcon(action)}
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Apply Moderation Action
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Target:{" "}
              <span className="font-semibold text-foreground">
                {targetName}
              </span>
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {targetTitle && (
        <div className="p-3.5 rounded-xl bg-muted/50 border border-border space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span className="uppercase tracking-wider font-extrabold">
              {report?.type || target?.type || "TARGET"}
            </span>
            {report?.reportCount && <span>{report.reportCount} reports</span>}
          </div>
          <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
            {targetTitle}
          </p>
        </div>
      )}

      <form noValidate onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-foreground">
            Select Action Type
          </Label>
          <Controller
            control={control}
            name="action"
            render={({ field }) => (
              <Select
                items={ACTION_SELECT_ITEMS}
                value={field.value}
                onValueChange={(val: string | null) => {
                  if (val) handleActionChange(val as ModerationActionType);
                }}
              >
                <SelectTrigger className="w-full h-11 rounded-xl bg-background border-border text-sm text-foreground">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover text-popover-foreground rounded-xl">
                  {ACTION_OPTIONS.map((opt) => {
                    let disabled = false;
                    let badgeText = "";
                    if (opt.value === "WARN" && isTargetRemoved) {
                      disabled = true;
                      badgeText = "(User Removed)";
                    } else if (opt.value === "SUSPEND") {
                      if (isTargetRemoved) {
                        disabled = true;
                        badgeText = "(User Removed)";
                      } else if (isTargetSuspended) {
                        disabled = true;
                        badgeText = "(Already suspended)";
                      }
                    } else if (opt.value === "REMOVE" && isTargetRemoved) {
                      disabled = true;
                      badgeText = "(Already removed)";
                    } else if (opt.value === "BAN" && isTargetRemoved) {
                      disabled = true;
                      badgeText = "(User Removed)";
                    } else if (opt.value === "REINSTATE" && isTargetActive) {
                      disabled = true;
                      badgeText = "(Already active)";
                    }

                    return (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        disabled={disabled}
                        className="cursor-pointer rounded-lg py-2 text-sm"
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className="font-semibold">{opt.label}</span>
                          {badgeText && (
                            <span className="text-xs text-muted-foreground font-normal">
                              {badgeText}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="moderation-reason" className="text-xs font-bold text-foreground">
              Moderation Reason <span className="text-destructive">*</span>
            </Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {reasonValue.length}/2000
            </span>
          </div>

          {availableReasonPresets.length > 0 && (
            <div className="space-y-1.5 pb-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" />
                <span>Quick reason suggestions</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableReasonPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      setValue("reason", preset, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    className="rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground text-left cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Textarea
            id="moderation-reason"
            {...register("reason")}
            placeholder="Detailed reason for this moderation action..."
            rows={3}
            maxLength={2000}
            className="rounded-xl border-border bg-background text-sm text-foreground focus-visible:border-ring focus-visible:ring-2"
          />
          {errors.reason?.message && (
            <p className="text-xs font-medium text-destructive">
              {errors.reason.message}
            </p>
          )}
        </div>

        {action === "SUSPEND" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground">
                Action Expiration Date <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-1">
                {[
                  { label: "+1D", days: 1 },
                  { label: "+7D", days: 7 },
                  { label: "+30D", days: 30 },
                  { label: "+90D", days: 90 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setPresetDays(preset.days)}
                    className="px-2 py-0.5 text-xs font-bold rounded-md bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <Controller
              control={control}
              name="expiresAt"
              render={({ field }) => (
                <DateTimePicker
                  value={field.value ?? ""}
                  onChange={(val) => field.onChange(val)}
                  placeholder="Select expiration date & time"
                />
              )}
            />
            {errors.expiresAt?.message && (
              <p className="text-xs font-medium text-destructive">
                {errors.expiresAt.message}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl h-10 text-xs font-semibold border-border bg-background text-foreground cursor-pointer hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`rounded-xl h-10 text-xs font-bold cursor-pointer shadow-2xs ${getButtonBgClass(
              action
            )}`}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin mr-1.5" />
            ) : (
              getActionIcon(action)
            )}
            <span className="ml-1.5">Confirm {action}</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
