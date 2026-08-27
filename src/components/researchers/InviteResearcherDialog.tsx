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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiErrorMessage } from "@/lib/api/error-message";
import { useInviteResearcherMutation } from "@/lib/redux/services/researcherAccessApi";
import {
  inviteResearcherSchema,
  MOTIVATION_MAX_LENGTH,
  type InviteResearcherInput,
  type InviteResearcherValues,
} from "@/lib/validations/researcher-access";

/**
 * Approving a researcher who never asked.
 *
 * Keyed on the user id and not an email, because that is what the upstream
 * takes: it links an account that already exists rather than sending anyone an
 * invitation, so someone who has not signed up cannot be cleared here.
 */
export function InviteResearcherDialog({
  open,
  onOpenChange,
  organizationId,
  /** Bumped by the opener so each open starts from empty fields. */
  session,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  session: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <InviteResearcherForm
          key={session}
          organizationId={organizationId}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function InviteResearcherForm({
  organizationId,
  onDone,
}: {
  organizationId: string;
  onDone: () => void;
}) {
  const [inviteResearcher, { isLoading }] = useInviteResearcherMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteResearcherInput, unknown, InviteResearcherValues>({
    resolver: zodResolver(inviteResearcherSchema),
    defaultValues: { userId: "", note: "" },
  });

  const onSubmit = async (values: InviteResearcherValues) => {
    try {
      await inviteResearcher({
        organizationId,
        userId: values.userId,
        note: values.note?.trim() || undefined,
      }).unwrap();
      toast.success("Researcher approved.");
      onDone();
    } catch (error) {
      toast.error(
        apiErrorMessage(error, "The researcher could not be approved."),
      );
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
          Approve a researcher
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Clears them for every program this organization runs, without waiting
          for them to ask. Their account has to exist already.
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        className="space-y-5"
      >
        <div className="space-y-2">
          <label
            htmlFor="invite-user-id"
            className="text-sm font-semibold text-foreground"
          >
            Researcher user id
          </label>
          <Input
            id="invite-user-id"
            placeholder="00000000-0000-0000-0000-000000000000"
            autoComplete="off"
            {...register("userId")}
            className="h-11 rounded-xl border-border bg-background font-mono text-sm text-foreground focus-visible:ring-2 focus-visible:ring-primary"
          />
          <p className="text-sm text-muted-foreground">
            Found on the researcher&apos;s profile. An email address will not
            work here.
          </p>
          {errors.userId?.message && (
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
              {errors.userId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="invite-note"
            className="text-sm font-semibold text-foreground"
          >
            Note
            <span className="ml-1.5 font-normal text-muted-foreground">
              optional
            </span>
          </label>
          <Textarea
            id="invite-note"
            rows={3}
            maxLength={MOTIVATION_MAX_LENGTH}
            placeholder="Anything they should know before they start testing."
            {...register("note")}
            className="rounded-xl border-border bg-background text-sm text-foreground focus-visible:ring-2 focus-visible:ring-primary"
          />
          {errors.note?.message && (
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
              {errors.note.message}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onDone}
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
                Approving…
              </>
            ) : (
              "Approve"
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export default InviteResearcherDialog;
