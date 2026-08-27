"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiErrorMessage } from "@/lib/api/error-message";
import { DECISION_DONE, DECISION_LABEL } from "@/lib/researchers/access";
import { useReviewResearcherMutation } from "@/lib/redux/services/researcherAccessApi";
import {
  MOTIVATION_MAX_LENGTH,
  type ResearcherAccessRecord,
  type ReviewDecision,
} from "@/lib/validations/researcher-access";

const BLURB: Record<ReviewDecision, string> = {
  APPROVE:
    "They will be able to file reports against every program this organization runs.",
  REJECT:
    "They keep their drafts and can ask again. Your note is the only explanation they get.",
  REVOKE:
    "They stop being able to file new reports. Reports they already filed are unaffected.",
};

/**
 * One decision on one researcher, with the note that explains it.
 *
 * The note is optional upstream and worth writing anyway: on a rejection or a
 * revocation it is the only thing the researcher is shown, and without it the
 * refusal arrives with no reason at all.
 */
export function ReviewDecisionDialog({
  organizationId,
  record,
  decision,
  onClose,
}: {
  organizationId: string;
  record: ResearcherAccessRecord | null;
  decision: ReviewDecision | null;
  onClose: () => void;
}) {
  const open = Boolean(record && decision);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        {record && decision && (
          <ReviewDecisionForm
            key={`${record.id}:${decision}`}
            organizationId={organizationId}
            record={record}
            decision={decision}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReviewDecisionForm({
  organizationId,
  record,
  decision,
  onClose,
}: {
  organizationId: string;
  record: ResearcherAccessRecord;
  decision: ReviewDecision;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [reviewResearcher, { isLoading }] = useReviewResearcherMutation();

  const who =
    record.researcherName?.trim() ||
    record.researcherEmail?.trim() ||
    "This researcher";
  const tooLong = note.length > MOTIVATION_MAX_LENGTH;

  const confirm = async () => {
    try {
      await reviewResearcher({
        organizationId,
        userId: record.researcherId,
        decision,
        note: note.trim() || undefined,
      }).unwrap();
      toast.success(`${who} ${DECISION_DONE[decision]}.`);
      onClose();
    } catch (error) {
      /* A 409 means the row was stale — someone else reviewed it first, or the
         state moved under it. The upstream names which, so it is shown as
         written rather than guessed from what this screen last loaded. */
      toast.error(apiErrorMessage(error, "The decision could not be saved."));
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
          {DECISION_LABEL[decision]} {who}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {BLURB[decision]}
        </DialogDescription>
      </DialogHeader>

      {record.motivation?.trim() && (
        <div className="rounded-xl border border-border bg-muted/40 p-3.5">
          <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            What they wrote
          </p>
          <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {record.motivation.trim()}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="review-note"
            className="text-sm font-semibold text-foreground"
          >
            Note
            <span className="ml-1.5 font-normal text-muted-foreground">
              {decision === "APPROVE" ? "optional" : "they will read this"}
            </span>
          </label>
          <span
            className={
              tooLong
                ? "text-sm font-medium text-rose-600 dark:text-rose-400"
                : "text-sm font-medium text-muted-foreground"
            }
          >
            {note.length} / {MOTIVATION_MAX_LENGTH}
          </span>
        </div>
        <Textarea
          id="review-note"
          rows={4}
          maxLength={MOTIVATION_MAX_LENGTH}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={
            decision === "APPROVE"
              ? "Anything they should know before they start testing."
              : "Why, and what would change your mind."
          }
          className="rounded-xl border-border bg-background text-sm text-foreground focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="h-11 cursor-pointer rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant={decision === "APPROVE" ? "default" : "destructive"}
          onClick={() => void confirm()}
          disabled={isLoading || tooLong}
          className="h-11 cursor-pointer rounded-xl"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
              Saving…
            </>
          ) : (
            DECISION_LABEL[decision]
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

export default ReviewDecisionDialog;
