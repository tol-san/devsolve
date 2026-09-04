"use client";

import React from "react";
import { motion } from "motion/react";
import { Check, Circle, LoaderCircle, Save, Send } from "lucide-react";
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.16, ease: "easeOut" }}
    >
      <Card className={CARD_CLASS} aria-labelledby="submit-problem-heading">
        <CardHeader className="border-b border-border/70 pb-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>
              <h2
                id="submit-problem-heading"
                className="text-lg font-bold tracking-tight text-foreground"
              >
                {isPublishedEdit ? "Save changes" : "Submit problem"}
              </h2>
            </CardTitle>
            <Badge
              role="status"
              aria-live="polite"
              variant={formReady ? "secondary" : "outline"}
            >
              {formReady ? "Ready" : "In progress"}
            </Badge>
          </div>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            Your post may be held for review before it appears publicly.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 pt-6">
          <RequirementRow label="A clear title" met={titleReady} />
          <RequirementRow
            label="A useful description"
            met={descriptionReady}
          />
          <RequirementRow
            label="Category selected"
            met={hasCategory}
          />
          <RequirementRow
            label="Problem type selected"
            met={hasProblemType}
          />
          {hasTechnologies && (
            <RequirementRow
              label="Technology details complete"
              met={technologiesReady}
            />
          )}
          {hasTagsOrPending && (
            <RequirementRow label="Tag limits satisfied" met={tagsReady} />
          )}
          <RequirementRow
            label="Expected vs actual"
            met={hasDiagnosisExpectedActual}
            optional={!isBug}
          />
          <RequirementRow
            label="Steps to reproduce"
            met={hasReproductionSteps}
            optional={!isBug}
          />
          <RequirementRow
            label="Error output"
            met={hasErrorMessage}
            optional
          />
          <RequirementRow
            label="Severity set"
            met={hasSeverity}
            optional
          />
          <RequirementRow
            label="SDLC phase selected"
            met={hasSdlcPhase}
            optional
          />

          {submitError && (
            <FieldError className="pt-1">{submitError}</FieldError>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-2 border-t border-border/70 pt-4">
          {isDraftProblem && (
            <div className="w-full flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/70">
              <span>Autosave</span>
              <span className="font-medium">
                {isSavingDraft ? (
                  <span className="flex items-center gap-1.5 text-primary">
                    <LoaderCircle className="size-3 animate-spin" /> Saving draft…
                  </span>
                ) : draftSavedAt ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Check className="size-3" /> Saved at {new Date(draftSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
            whileHover={submitting ? undefined : { y: -2 }}
            whileTap={submitting ? undefined : { y: 0, scale: 0.99 }}
          >
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="h-12 w-full rounded-xl text-base font-semibold cursor-pointer"
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    data-icon="inline-start"
                    aria-hidden="true"
                    className="animate-spin motion-reduce:animate-none"
                  />
                  {isPublishedEdit ? "Saving…" : "Submitting…"}
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
              className="h-11 w-full rounded-xl font-medium border-border/80 hover:bg-muted cursor-pointer"
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
            size="lg"
            disabled={submitting}
            onClick={onCancel}
            className="h-10 w-full rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Cancel
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
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-foreground/80">
        {met ? (
          <Check className="size-4 text-primary" aria-hidden="true" />
        ) : (
          <Circle className="size-4 text-muted-foreground" aria-hidden="true" />
        )}
        <span className="sr-only">
          {met ? "Complete: " : optional ? "Not added: " : "Incomplete: "}
        </span>
        {label}
      </span>
      {optional && <Badge variant="outline">Optional</Badge>}
    </div>
  );
}
