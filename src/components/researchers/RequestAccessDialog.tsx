"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useRequestResearcherAccessMutation } from "@/lib/redux/services/researcherAccessApi";
import {
  MOTIVATION_MAX_LENGTH,
  MOTIVATION_MIN_LENGTH,
  requestResearcherAccessSchema,
  type RequestResearcherAccessValues,
} from "@/lib/validations/researcher-access";

/**
 * Asking a company for permission to report to it.
 *
 * One field, because the upstream stores one. The company reads this next to
 * the researcher's name in its queue, and it is the only thing they have to
 * decide on — so the length floor is the upstream's own rather than something
 * softened here.
 */
export function RequestAccessDialog({
  open,
  onOpenChange,
  organizationId,
  organizationName,
  /** Bumped by the opener so each open starts from an empty textarea. */
  session,
  onRequested,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  organizationName?: string | null;
  session?: number;
  onRequested?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <RequestAccessForm
          key={session ?? 0}
          organizationId={organizationId}
          organizationName={organizationName}
          onDone={() => {
            onOpenChange(false);
            onRequested?.();
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function RequestAccessForm({
  organizationId,
  organizationName,
  onDone,
  onCancel,
}: {
  organizationId: string;
  organizationName?: string | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [requestAccess, { isLoading }] = useRequestResearcherAccessMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RequestResearcherAccessValues>({
    resolver: zodResolver(requestResearcherAccessSchema),
    defaultValues: { motivation: "" },
  });

  const typed = watch("motivation")?.length ?? 0;
  const company = organizationName?.trim() || "this organization";

  const onSubmit = async (values: RequestResearcherAccessValues) => {
    try {
      await requestAccess({
        organizationId,
        motivation: values.motivation,
      }).unwrap();
      toast.success(`Request sent to ${company}.`);
      onDone();
    } catch (error) {
      /* A 409 here means a request is already pending or already granted —
         the upstream knows which, and says so more precisely than a guess
         from the last state this screen happened to load. */
      toast.error(
        apiErrorMessage(error, "Your access request could not be sent."),
      );
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
          Request access to {company}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Approval covers every program {company} runs, not just the one you
          were looking at. You can keep writing and saving drafts while you
          wait.
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        className="space-y-5"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="access-motivation"
              className="text-sm font-semibold text-foreground"
            >
              Why you want to test their programs
            </label>
            <span
              className={
                typed > MOTIVATION_MAX_LENGTH
                  ? "text-sm font-medium text-rose-600 dark:text-rose-400"
                  : "text-sm font-medium text-muted-foreground"
              }
            >
              {typed} / {MOTIVATION_MAX_LENGTH}
            </span>
          </div>
          <Textarea
            id="access-motivation"
            rows={6}
            minLength={MOTIVATION_MIN_LENGTH}
            maxLength={MOTIVATION_MAX_LENGTH}
            placeholder="Your background, the kinds of issues you look for, and anything that helps them place you."
            {...register("motivation")}
            className="rounded-xl border-border bg-background text-sm text-foreground focus-visible:ring-2 focus-visible:ring-primary"
          />
          {errors.motivation?.message && (
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
              {errors.motivation.message}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-11 cursor-pointer rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 cursor-pointer rounded-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                Sending…
              </>
            ) : (
              "Send request"
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export default RequestAccessDialog;
