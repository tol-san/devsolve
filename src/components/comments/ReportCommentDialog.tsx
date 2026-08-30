"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Flag, Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { parseApiError } from "@/lib/api/errors";
import { authClient } from "@/lib/auth/auth-client";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";
import { useCreateFlagMutation } from "@/lib/redux/services/flagsApi";
import {
  FLAG_REASONS,
  type FlaggableType,
  type FlagReason,
} from "@/lib/validations/engagement";

const REASONS: { value: FlagReason; label: string; hint: string }[] = [
  { value: "SPAM", label: "Spam", hint: "Advertising or repeated posting" },
  {
    value: "OFFENSIVE",
    label: "Offensive",
    hint: "Abuse, harassment, or hateful content",
  },
  {
    value: "OFF_TOPIC",
    label: "Off topic",
    hint: "Unrelated to the discussion or project",
  },
  {
    value: "DUPLICATE",
    label: "Duplicate",
    hint: "The same content was already posted elsewhere",
  },
  {
    value: "OTHER",
    label: "Something else",
    hint: "Add a note so the moderators know what to review",
  },
];

const reportFormSchema = z.object({
  reason: z.enum(FLAG_REASONS, { message: "Choose a reason for this report" }),
  description: z
    .string()
    .trim()
    .max(2000, "Your note must not exceed 2,000 characters"),
});

type ReportFormInput = z.input<typeof reportFormSchema>;
type ReportFormValues = z.output<typeof reportFormSchema>;

const CONTENT_LABELS: Record<FlaggableType, string> = {
  PROBLEM: "problem",
  SOLUTION: "solution",
  COMMENT: "comment",
  SHOWCASE: "showcase",
};

interface ReportContentDialogProps {
  contentId: string;
  contentType: FlaggableType;
  authorName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** A validated report form shared by every flaggable community content type. */
export function ReportContentDialog({
  contentId,
  contentType,
  authorName,
  open,
  onOpenChange,
}: ReportContentDialogProps) {
  const contentLabel = CONTENT_LABELS[contentType];
  const [createFlag, { isLoading }] = useCreateFlagMutation();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportFormInput, unknown, ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: { description: "" },
  });

  const selectedReason = useWatch({ control, name: "reason" });
  const selectedReasonHint = REASONS.find(
    (option) => option.value === selectedReason,
  )?.hint;

  const close = () => {
    onOpenChange(false);
    reset({ description: "" });
  };

  const { data: session } = authClient.useSession();
  const { handleLogin } = useKeycloakLogin();

  const submit = handleSubmit(async ({ reason, description }) => {
    if (!session?.user) {
      void handleLogin(
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/",
      );
      return;
    }
    try {
      await createFlag({
        flaggableType: contentType,
        flaggableId: contentId,
        reason,
        description: description || undefined,
      }).unwrap();

      toast.success("Report sent", {
        description: `A moderator will review this ${contentLabel}.`,
      });
      close();
    } catch (error) {
      toast.error(parseApiError(error, "Your report could not be sent.").message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="rounded-2xl border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Flag aria-hidden="true" className="text-destructive" />
            Report this {contentLabel}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {authorName
              ? `Tell the moderators what is wrong with ${authorName}'s ${contentLabel}. The author will not see who submitted the report.`
              : `Tell the moderators what is wrong with this ${contentLabel}. Its author will not see who submitted the report.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-6">
          <FieldGroup className="gap-5">
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <Field data-invalid={Boolean(errors.reason)}>
                  <FieldLabel htmlFor="report-reason" className="text-base">
                    Reason
                  </FieldLabel>
                  <Select
                    value={field.value ?? null}
                    onValueChange={(value) => field.onChange(value ?? undefined)}
                  >
                    <SelectTrigger
                      id="report-reason"
                      aria-invalid={Boolean(errors.reason)}
                      className="h-11 w-full rounded-xl border-border bg-background text-base"
                    >
                      <SelectValue placeholder="Pick a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {REASONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {selectedReasonHint && (
                    <FieldDescription>{selectedReasonHint}</FieldDescription>
                  )}
                  <FieldError errors={[errors.reason]} />
                </Field>
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Field data-invalid={Boolean(errors.description)}>
                  <FieldLabel htmlFor="report-note" className="text-base">
                    Additional context
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="report-note"
                    rows={4}
                    maxLength={2000}
                    aria-invalid={Boolean(errors.description)}
                    placeholder="What should a moderator know?"
                    className="rounded-xl border-border bg-background text-base text-foreground"
                  />
                  <FieldDescription>
                    Include only details that help a moderator assess the content.
                  </FieldDescription>
                  <FieldError errors={[errors.description]} />
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={close}
              disabled={isLoading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="lg"
              disabled={isLoading}
              className="cursor-pointer rounded-xl"
            >
              {isLoading ? (
                <Loader2
                  data-icon="inline-start"
                  className="animate-spin motion-reduce:animate-none"
                />
              ) : (
                <Flag data-icon="inline-start" />
              )}
              Send report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Compatibility wrapper for the existing comment action. */
export function ReportCommentDialog({
  commentId,
  authorName,
  open,
  onOpenChange,
}: {
  commentId: string;
  authorName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <ReportContentDialog
      contentId={commentId}
      contentType="COMMENT"
      authorName={authorName}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
