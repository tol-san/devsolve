"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import type { ReportManagementDetail } from "@/components/report-management/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useAwardRecognitionMutation,
  useRecordRewardMutation,
} from "@/lib/redux/services/reportsApi";
import { useCreateCommentMutation } from "@/lib/redux/services/commentsApi";
import { apiErrorMessage } from "@/lib/api/error-message";
import { cn } from "@/lib/utils";

interface ThankResearcherDialogProps {
  detail: ReportManagementDetail;
  triggerClassName?: string;
  triggerLabel?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

/**
 * Maps upstream recognition API errors into clear, actionable UI messages.
 */
function mapRecognitionError(err: any): { message: string; isAlreadyThanked: boolean } {
  const status = err?.status || err?.data?.code || err?.data?.status;
  const rawMsg = (err?.data?.message || err?.message || "").toLowerCase();

  if (status === 409) {
    if (rawMsg.includes("already been recognised") || rawMsg.includes("already been recognized") || rawMsg.includes("already")) {
      return {
        message: "This report has already been thanked and recognized.",
        isAlreadyThanked: true,
      };
    }
    if (rawMsg.includes("dispute") || rawMsg.includes("unsettled") || rawMsg.includes("severity")) {
      return {
        message: "Please resolve the severity dispute first before awarding recognition.",
        isAlreadyThanked: false,
      };
    }
    if (rawMsg.includes("resolved")) {
      return {
        message: "Recognition can only be awarded for a resolved report.",
        isAlreadyThanked: false,
      };
    }
  }

  if (status === 403) {
    const errorDetails = err?.data?.errorDetails || err?.errorDetails;
    if (errorDetails?.requiredPermission === "AWARD_REWARDS" || errorDetails?.requiredPermission) {
      return {
        message: "You do not have permission to award rewards or recognition in this organization.",
        isAlreadyThanked: false,
      };
    }
    if (errorDetails?.status === "SUSPENDED" || rawMsg.includes("suspended")) {
      return {
        message: "Your organization membership is suspended.",
        isAlreadyThanked: false,
      };
    }
    return {
      message: err?.data?.message || "You do not have permission to award recognition.",
      isAlreadyThanked: false,
    };
  }

  if (status === 404) {
    console.error("[Recognition] Report not found on upstream API:", err);
    return {
      message: "Report not found.",
      isAlreadyThanked: false,
    };
  }

  return {
    message: err?.data?.message || err?.message || "Failed to award recognition.",
    isAlreadyThanked: false,
  };
}

export const ThankResearcherDialog: React.FC<ThankResearcherDialogProps> = ({
  detail,
  triggerClassName,
  triggerLabel = "Induct to Hall of Thanks",
  variant = "outline",
  size = "sm",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isThanked, setIsThanked] = useState(false);
  const [thankYouNote, setThankYouNote] = useState("");
  const [awardHallOfFame, setAwardHallOfFame] = useState(true);
  const [postAsComment, setPostAsComment] = useState(true);
  const [bonusBounty, setBonusBounty] = useState("");

  const [awardRecognition, { isLoading: isAwarding }] = useAwardRecognitionMutation();
  const [recordReward, { isLoading: isRewarding }] = useRecordRewardMutation();
  const [createComment, { isLoading: isCommenting }] = useCreateCommentMutation();

  const isSubmitting = isAwarding || isRewarding || isCommenting;

  const submitterName = detail.submitter || "Researcher";
  const targetUserId = detail.submitterId || (detail as any)?.reporterId || (detail as any)?.reporter?.id;
  const programId = detail.programId || (detail as any)?.programId || (detail as any)?.program?.id;
  const reportId = String(detail.id);

  const cleanReportId = detail.reportId?.startsWith("#")
    ? detail.reportId
    : `#${detail.reportId || "REPORT"}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const note = thankYouNote.trim();
    if (!note && !awardHallOfFame && !bonusBounty) {
      toast.error("Please provide a thank-you note or select a recognition option.");
      return;
    }

    try {
      const successes: string[] = [];
      const warnings: string[] = [];
      let alreadyThankedEncountered = false;

      // 1. Award Public Hall of Fame Recognition (POST /api/v1/recognitions)
      if (awardHallOfFame) {
        try {
          await awardRecognition({
            reportId,
            title: `Hall of Fame - ${detail.severity || "Security"} Finding`,
            description: note || `Publicly recognized for responsibly disclosing vulnerability ${cleanReportId}.`,
            userId: targetUserId ? String(targetUserId) : undefined,
            programId: programId ? String(programId) : undefined,
          }).unwrap();
          successes.push("Hall of Fame recognition awarded");
          setIsThanked(true);
        } catch (recErr: any) {
          const mapped = mapRecognitionError(recErr);
          if (mapped.isAlreadyThanked) {
            alreadyThankedEncountered = true;
            setIsThanked(true);
            successes.push("Already recognized in Hall of Fame");
          } else {
            console.warn("Public recognition award skipped or refused:", recErr);
            warnings.push(mapped.message);
          }
        }
      }

      // 2. Optional Bonus Bounty Payout (POST /api/v1/reports/{id}/rewards)
      const numericBonus = parseFloat(bonusBounty.replace(/[^0-9.]/g, ""));
      if (!isNaN(numericBonus) && numericBonus > 0) {
        try {
          await recordReward({
            id: reportId,
            amount: numericBonus,
            note: note || "Bonus appreciation reward from the security team.",
          }).unwrap();
          successes.push(`Bonus bounty of $${numericBonus} USD authorized`);
        } catch (rewErr) {
          console.error("Failed to record reward:", rewErr);
          warnings.push(apiErrorMessage(rewErr, "Could not issue bonus bounty."));
        }
      }

      // 3. Post Public Thank-You Comment in report thread (POST /api/v1/comments)
      if (postAsComment && note) {
        try {
          await createComment({
            commentableType: "REPORT",
            commentableId: reportId,
            content: note,
            internal: false,
          }).unwrap();
          successes.push("Thank-you comment posted");
        } catch (commErr: any) {
          // If already posted (409 Conflict), treat as satisfied
          if (commErr?.status === 409 || commErr?.data?.code === 409) {
            console.warn("Comment already exists in thread, skipping duplicate.");
          } else {
            console.error("Failed to post comment:", commErr);
            warnings.push(apiErrorMessage(commErr, "Could not post discussion comment."));
          }
        }
      }

      if (successes.length > 0) {
        if (alreadyThankedEncountered && successes.length === 1) {
          toast.info(`Report ${cleanReportId} has already been thanked & recognized.`);
        } else {
          toast.success(`Sent to ${submitterName}: ${successes.join(", ")}.`);
        }
        if (warnings.length > 0) {
          toast.warning(warnings.join(" "));
        }
        setIsOpen(false);
        setThankYouNote("");
        setBonusBounty("");
      } else if (warnings.length > 0) {
        toast.error(warnings[0]);
      }
    } catch (err) {
      console.error("Failed to process gratitude:", err);
      toast.error(apiErrorMessage(err, "Failed to send thank-you."));
    }
  };

  if (isThanked) {
    return (
      <Button
        type="button"
        disabled
        variant="outline"
        size={size}
        className={cn(
          "rounded-xl border border-border bg-muted/40 text-muted-foreground font-semibold text-xs h-9 px-3.5 gap-1.5 opacity-90 cursor-default shadow-2xs",
          triggerClassName,
        )}
      >
        <Check className="size-3.5 text-emerald-500" />
        <span>Thanked</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={cn(
          "rounded-xl border border-border bg-card text-foreground hover:bg-muted font-semibold text-xs h-9 px-3.5 gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95",
          triggerClassName,
        )}
      >
        <span>{triggerLabel}</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Clean Minimalist Header */}
              <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4 shrink-0">
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-foreground tracking-tight">
                    Thank & Recognize Researcher
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Report {cleanReportId} &bull; {submitterName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                >
                  <X className="size-4" />
                </Button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
                <div className="p-6 space-y-4 text-xs sm:text-sm leading-relaxed overflow-y-auto min-w-0">
                  {/* Recipient Information Row */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-muted/30 text-xs">
                    <span className="text-muted-foreground">
                      Recipient: <strong className="text-foreground font-semibold">{submitterName}</strong>
                    </span>
                    {detail.severity && (
                      <Badge variant="outline" className="text-[11px] font-semibold border-border">
                        {detail.severity} Severity
                      </Badge>
                    )}
                  </div>

                  {/* 1. Message of Gratitude */}
                  <div className="space-y-1.5">
                    <label htmlFor="modal-thank-you" className="font-semibold text-foreground text-xs sm:text-sm">
                      Message of Gratitude
                    </label>
                    <Textarea
                      id="modal-thank-you"
                      value={thankYouNote}
                      onChange={(e) => setThankYouNote(e.target.value)}
                      placeholder="e.g. Thank you for your responsible disclosure and clear proof of concept. Our engineering team has deployed a patch."
                      className="min-h-24 border border-border bg-card text-foreground text-xs sm:text-sm focus-visible:ring-1 focus-visible:ring-ring w-full"
                    />
                    <div className="flex items-center gap-2 pt-0.5">
                      <input
                        id="comment-toggle"
                        type="checkbox"
                        checked={postAsComment}
                        onChange={(e) => setPostAsComment(e.target.checked)}
                        className="size-3.5 rounded border-border text-primary focus:ring-primary/40 cursor-pointer accent-primary"
                      />
                      <label htmlFor="comment-toggle" className="text-xs text-muted-foreground cursor-pointer select-none">
                        Also post this note to the report discussion timeline
                      </label>
                    </div>
                  </div>

                  {/* 2. Hall of Fame Recognition */}
                  <div className="rounded-xl border border-border bg-muted/20 p-3.5 flex items-start justify-between gap-3 min-w-0">
                    <div className="space-y-0.5 min-w-0">
                      <label htmlFor="modal-hall-of-fame" className="text-xs sm:text-sm font-semibold text-foreground cursor-pointer select-none block">
                        Award Public Hall of Fame Credit
                      </label>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Honors <strong>{submitterName}</strong> on your company & program&apos;s public <em>Thanks & Hall of Fame</em> leaderboard.
                      </p>
                    </div>
                    <input
                      id="modal-hall-of-fame"
                      type="checkbox"
                      checked={awardHallOfFame}
                      onChange={(e) => setAwardHallOfFame(e.target.checked)}
                      className="size-4 mt-0.5 rounded border-border text-primary focus:ring-primary/40 cursor-pointer accent-primary shrink-0"
                    />
                  </div>

                  {/* 3. Optional Bonus Bounty */}
                  <div className="space-y-1.5">
                    <label htmlFor="modal-bonus-bounty" className="font-semibold text-foreground text-xs sm:text-sm">
                      Optional Bonus Bounty ($ USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">$</span>
                      <Input
                        id="modal-bonus-bounty"
                        type="number"
                        min="1"
                        step="any"
                        value={bonusBounty}
                        onChange={(e) => setBonusBounty(e.target.value)}
                        placeholder="e.g. 250 (Optional bonus)"
                        className="pl-7 bg-card text-foreground font-semibold text-xs sm:text-sm h-9 w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 border-t border-border bg-card px-6 py-3.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    className="rounded-xl text-xs h-9 px-4 cursor-pointer justify-center"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-5 cursor-pointer shadow-xs justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin mr-1.5" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Thanks & Recognition</span>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
