"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Check,
  CheckCircle2,
  Circle,
  LoaderCircle,
  Save,
  Send,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { CARD_CLASS } from "./types-and-constants";

interface ProblemSubmitCardProps {
  isPublishedEdit: boolean;
  isDraftProblem: boolean;
  submitting: boolean;
  isSavingDraft: boolean;
  draftSavedAt: string | null;
  hasPreparedDraft: boolean;
  formReady: boolean;
  titleReady: boolean;
  descriptionReady: boolean;
  hasCategory: boolean;
  hasProblemType: boolean;
  hasTechnologies: boolean;
  technologiesReady: boolean;
  hasTagsOrPending: boolean;
  tagsReady: boolean;
  isBug: boolean;
  hasDiagnosisExpectedActual: boolean;
  hasReproductionSteps: boolean;
  hasErrorMessage: boolean;
  hasSeverity: boolean;
  hasSdlcPhase: boolean;
  submitError: string | null;
  onSaveDraft: () => void;
  onCancel: () => void;
}

export function ProblemSubmitCard({
  isPublishedEdit,
  isDraftProblem,
  submitting,
  isSavingDraft,
  draftSavedAt,
  hasPreparedDraft,
  formReady,
  titleReady,
  descriptionReady,
  hasCategory,
  hasProblemType,
  hasTechnologies,
  technologiesReady,
  hasTagsOrPending,
  tagsReady,
  isBug,
  hasDiagnosisExpectedActual,
  hasReproductionSteps,
  hasErrorMessage,
  hasSeverity,
  hasSdlcPhase,
  submitError,
  onSaveDraft,
  onCancel,
}: ProblemSubmitCardProps) {
  const coreRequirements = [
    { label: "Clear title (min 10 chars)", met: titleReady },
    { label: "Detailed description (min 30 chars)", met: descriptionReady },
    { label: "Category selected", met: hasCategory },
    { label: "Problem type chosen", met: hasProblemType },
    ...(isBug
      ? [
          {
            label: "Expected & actual behaviour",
            met: hasDiagnosisExpectedActual,
          },
          {
            label: "Reproduction steps",
            met: hasReproductionSteps,
          },
        ]
      : []),
  ];

  const metCoreCount = coreRequirements.filter((r) => r.met).length;
  const totalCore = coreRequirements.length;
  const progressPercent = Math.min(
    100,
    Math.round((metCoreCount / totalCore) * 100),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.16, ease: "easeOut" }}
    >
      <Card
        id="section-submit"
        className={CARD_CLASS}
        aria-labelledby="submit-problem-heading"
      >
        <CardHeader className="border-b border-border/70 pb-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>
              <h2
                id="submit-problem-heading"
                className="text-base font-bold tracking-tight text-foreground"
              >
                {isPublishedEdit ? "Save Changes" : "Review & Publish"}
              </h2>
            </CardTitle>
            <Badge
              role="status"
              aria-live="polite"
              variant={formReady ? "default" : "outline"}
              className={cn(
                "text-xs font-semibold",
                formReady
                  ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                  : "text-muted-foreground",
              )}
            >
              {formReady ? "Ready to submit" : "In progress"}
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Complete the required fields below to publish to the community.
          </CardDescription>

          {/* Visual Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">
                {formReady
                  ? "All required fields satisfied"
                  : `${metCoreCount} of ${totalCore} required satisfied`}
              </span>
              <span className="font-mono text-xs font-bold text-primary">
                {progressPercent}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  formReady ? "bg-emerald-500" : "bg-primary",
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-2.5 pt-5">
          <RequirementRow label="Title (10–180 chars)" met={titleReady} />
          <RequirementRow
            label="Description (30+ chars)"
            met={descriptionReady}
          />
          <RequirementRow label="Category selected" met={hasCategory} />
          <RequirementRow label="Problem type selected" met={hasProblemType} />

          {isBug && (
            <>
              <RequirementRow
                label="Expected & actual behaviour"
                met={hasDiagnosisExpectedActual}
              />
              <RequirementRow
                label="At least 1 reproduction step"
                met={hasReproductionSteps}
              />
            </>
          )}

          {/* Optional checklist items */}
          <div className="pt-2 border-t border-border/50 flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Optional Enhancements
            </span>
            <RequirementRow
              label="Stack & technologies"
              met={hasTechnologies && technologiesReady}
              optional
            />
            <RequirementRow
              label="Tags & keywords"
              met={hasTagsOrPending && tagsReady}
              optional
            />
            <RequirementRow
              label="Console error / stack trace"
              met={hasErrorMessage}
              optional
            />
            <RequirementRow
              label="Severity level"
              met={hasSeverity}
              optional
            />
            <RequirementRow
              label="SDLC phase"
              met={hasSdlcPhase}
              optional
            />
          </div>

          {submitError && (
            <FieldError className="pt-2">{submitError}</FieldError>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-2.5 border-t border-border/70 pt-4">
          {isDraftProblem && (
            <div className="w-full flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/70">
              <span className="inline-flex items-center gap-1">
                <Sparkles className="size-3 text-primary" />
                Autosave
              </span>
              <span className="font-medium">
                {isSavingDraft ? (
                  <span className="flex items-center gap-1.5 text-primary">
                    <LoaderCircle className="size-3 animate-spin" /> Saving…
                  </span>
                ) : draftSavedAt ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Check className="size-3" /> Saved at{" "}
                    {new Date(draftSavedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                ) : hasPreparedDraft ? (
                  <span>Draft saved</span>
                ) : (
                  <span>Ready</span>
                )}
              </span>
            </div>
          )}

          <motion.div
            className="w-full"
            whileHover={submitting ? undefined : { scale: 1.01 }}
            whileTap={submitting ? undefined : { scale: 0.99 }}
          >
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="h-12 w-full rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    data-icon="inline-start"
                    aria-hidden="true"
                    className="animate-spin motion-reduce:animate-none"
                  />
                  {isPublishedEdit ? "Saving changes…" : "Submitting problem…"}
                </>
              ) : (
                <>
                  <Send data-icon="inline-start" aria-hidden="true" />
                  {isPublishedEdit ? "Save changes" : "Submit problem"}
                </>
              )}
            </Button>
          </motion.div>

          {isDraftProblem && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={submitting || isSavingDraft}
              onClick={onSaveDraft}
              className="h-11 w-full rounded-xl font-medium border-border hover:bg-muted cursor-pointer text-xs"
            >
              {isSavingDraft ? (
                <>
                  <LoaderCircle
                    data-icon="inline-start"
                    aria-hidden="true"
                    className="animate-spin motion-reduce:animate-none"
                  />
                  <span>Saving draft…</span>
                </>
              ) : (
                <>
                  <Save data-icon="inline-start" aria-hidden="true" />
                  <span>Save as draft</span>
                </>
              )}
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={submitting}
            onClick={onCancel}
            className="h-9 w-full rounded-xl text-muted-foreground hover:text-foreground cursor-pointer text-xs"
          >
            Cancel and go back
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

function RequirementRow({
  label,
  met,
  optional = false,
}: {
  label: string;
  met: boolean;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="flex items-center gap-2 text-foreground/85">
        {met ? (
          <CheckCircle2
            className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
            aria-hidden="true"
          />
        ) : (
          <Circle
            className="size-3.5 text-muted-foreground/60 shrink-0"
            aria-hidden="true"
          />
        )}
        <span className="sr-only">
          {met ? "Complete: " : optional ? "Not added: " : "Incomplete: "}
        </span>
        <span className={cn(met && "font-medium")}>{label}</span>
      </span>
      {optional ? (
        <span className="text-[10px] text-muted-foreground font-mono">
          optional
        </span>
      ) : (
        <span className="text-[10px] text-primary/80 font-mono font-medium">
          req
        </span>
      )}
    </div>
  );
}
