"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  Circle,
  FileText,
  ListChecks,
  LoaderCircle,
  Plus,
  Save,
  Scale,
  Send,
  Trash2,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarkdownEditor } from "@/components/reports/MarkdownEditor";
import {
  useCreateSolutionMutation,
  useUploadSolutionAttachmentMutation,
  useDeleteSolutionAttachmentMutation,
  useUpdateSolutionMutation,
  type SolutionResponse,
} from "@/lib/redux/services/solutionsApi";
import type { ProblemResponse } from "@/lib/redux/services/problemsApi";
import { excerptOf } from "@/lib/markdown-excerpt";
import { authorNameOf, messageOf } from "@/lib/discussions/format";
import {
  APPROACH_DESCRIPTIONS,
  APPROACH_LABELS,
  APPROACH_TYPES,
  RESOURCE_LABELS,
  RESOURCE_TYPES,
  solutionFormSchema,
  type ApproachType,
  type SolutionFormInput,
  type SolutionFormValues,
} from "@/lib/validations/solution";
import { useServerSolutionDraft } from "@/components/discussions/hooks/useServerSolutionDraft";
import type {
  SaveSolutionDraftValues,
  SolutionDraftResponse,
} from "@/lib/validations/solution-draft";
import {
  FileUploadDropzone,
  type AttachedFile,
} from "@/components/reports/FileUploadDropzone";
import { ContentScanStatus } from "@/components/security/ContentScanStatus";
import { ExistingAttachments } from "@/components/discussions/create/ExistingAttachments";
import {
  apiErrorMessage,
  contentScanErrorMessage,
} from "@/lib/api/error-message";

/**
 * Answering a problem, on its own page.
 *
 * Laid out like `CreateProblemForm` — numbered cards on the left, a sticky
 * column on the right — because the two are the same kind of task and a writer
 * moving between them should not have to relearn the screen. The right column
 * keeps the problem itself in view, which is the thing being answered.
 *
 * The three fields the backend requires (a summary, the body, and what kind of
 * answer this is) come first; evidence — how to verify it, what it was tested
 * against, what it costs, what to read — follows in optional cards.
 */

const CARD_CLASS =
  "rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900";

const CONTROL_CLASS =
  "h-12 rounded-xl border-slate-300 bg-white text-base dark:border-neutral-700 dark:bg-neutral-900";

const MAX_SUMMARY = 250;
const MIN_SUMMARY = 10;
const MAX_BODY = 30_000;
const MIN_BODY = 30;
const MAX_TRADEOFFS = 5_000;

const MAX_VERIFICATION_STEPS = 20;
const MAX_TESTED_WITH = 20;
const MAX_RESOURCES = 10;

interface CreateSolutionFormProps {
  problemId: string;
  problem?: ProblemResponse;
  /**
   * An existing answer to revise. Its presence is what puts the form in edit
   * mode: same fields and same rules, a different verb.
   */
  solution?: SolutionResponse;
  /** Where a posted solution lands the author. Defaults to the problem. */
  successHref?: string;
  cancelHref?: string;
  stickyTop?: string;
}

export function CreateSolutionForm({
  problemId,
  problem,
  solution,
  successHref,
  cancelHref,
  stickyTop = "1.5rem",
}: CreateSolutionFormProps) {
  const router = useRouter();
  const [createSolution, { isLoading: creating }] = useCreateSolutionMutation();
  const [updateSolution, { isLoading: saving }] = useUpdateSolutionMutation();
  const [uploadSolutionAttachment, { isLoading: uploading }] =
    useUploadSolutionAttachmentMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  const isEdit = Boolean(solution);
  const [deleteAttachment] = useDeleteSolutionAttachmentMutation();

  /**
   * Removing a stored file from this answer.
   *
   * Sends the answer's current `version` as `If-Match`, which this endpoint
   * requires: if someone else has edited the answer since this form loaded,
   * the delete is refused with a 412 rather than applied to a stale view.
   */
  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!solution?.id) return;
    try {
      await deleteAttachment({
        solutionId: solution.id,
        version: solution.version ?? 0,
        attachmentId,
      }).unwrap();
      toast.success("Attachment removed");
    } catch (error) {
      toast.error("That attachment could not be removed", {
        description: apiErrorMessage(
          error,
          "The answer service did not respond. Nothing was deleted.",
        ),
      });
    }
  };
  const submitting = creating || saving || uploading;

  const back = cancelHref ?? `/community/${problemId}`;
  const done = successHref ?? `/community/${problemId}`;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<SolutionFormInput, unknown, SolutionFormValues>({
    resolver: zodResolver(solutionFormSchema),
    /* In edit mode the existing answer seeds the fields. Rows are copied
       rather than referenced so editing one does not mutate the cached
       response behind it. */
    defaultValues: {
      summary: solution?.summary ?? "",
      bodyMarkdown: solution?.bodyMarkdown ?? "",
      approachType: solution?.approachType ?? "FIX",
      verificationSteps: (solution?.verificationSteps ?? []).map((step) => ({
        instruction: step.instruction ?? "",
        expectedResult: step.expectedResult ?? "",
      })),
      testedWith: (solution?.testedWith ?? []).map((entry) => ({
        technology: entry.technology ?? "",
        version: entry.version ?? "",
      })),
      tradeoffs: solution?.tradeoffs ?? "",
      resources: (solution?.resources ?? []).map((item) => ({
        type: item.type ?? "DOCUMENTATION",
        label: item.label ?? "",
        url: item.url ?? "",
      })),
    },
  });

  const steps = useFieldArray({ control, name: "verificationSteps" });
  const tested = useFieldArray({ control, name: "testedWith" });
  const resources = useFieldArray({ control, name: "resources" });

  /* `useWatch` rather than `watch()`, matching `CreateProblemForm` — the
     latter returns a function the React Compiler cannot memoize safely. */
  const summary = useWatch({ control, name: "summary" }) ?? "";
  const bodyMarkdown = useWatch({ control, name: "bodyMarkdown" }) ?? "";
  const approachType = useWatch({ control, name: "approachType" }) ?? "FIX";
  const tradeoffs = useWatch({ control, name: "tradeoffs" }) ?? "";
  const watchedSteps = useWatch({ control, name: "verificationSteps" }) ?? [];
  const watchedTested = useWatch({ control, name: "testedWith" }) ?? [];
  const watchedResources = useWatch({ control, name: "resources" }) ?? [];

  const draftValues: SaveSolutionDraftValues = React.useMemo(() => {
    return {
      summary: summary.trim() || undefined,
      bodyMarkdown: bodyMarkdown.trim() || undefined,
      approachType: approachType || undefined,
      tradeoffs: tradeoffs.trim() || undefined,
      verificationSteps: watchedSteps
        .filter((s) => s.instruction?.trim() || s.expectedResult?.trim())
        .map((s) => ({
          instruction: s.instruction?.trim() || undefined,
          expectedResult: s.expectedResult?.trim() || undefined,
        })),
      testedWith: watchedTested
        .filter((t) => t.technology?.trim() || t.version?.trim())
        .map((t) => ({
          technology: t.technology?.trim() || undefined,
          version: t.version?.trim() || undefined,
        })),
      resources: watchedResources
        .filter((r) => r.label?.trim() || r.url?.trim())
        .map((r) => ({
          type: r.type,
          label: r.label?.trim() || undefined,
          url: r.url?.trim() || undefined,
        })),
    };
  }, [summary, bodyMarkdown, approachType, tradeoffs, watchedSteps, watchedTested, watchedResources]);

  const searchParams = useSearchParams();
  const resumeId = searchParams?.get("draftId") ?? undefined;

  const {
    available: availableDraft,
    savedAt,
    isSaving: isSavingDraft,
    take: takeDraft,
    discard: discardDraft,
    saveNow: saveDraftNow,
    clear: clearDraft,
  } = useServerSolutionDraft({
    problemId,
    values: draftValues,
    enabled: !isEdit,
    isDirty,
    resumeId,
  });

  const applyDraftToForm = (draft: SolutionDraftResponse) => {
    reset({
      summary: draft.summary ?? "",
      bodyMarkdown: draft.bodyMarkdown ?? "",
      approachType: draft.approachType ?? "FIX",
      tradeoffs: draft.tradeoffs ?? "",
      verificationSteps: (draft.verificationSteps ?? []).map((s) => ({
        instruction: s.instruction ?? "",
        expectedResult: s.expectedResult ?? "",
      })),
      testedWith: (draft.testedWith ?? []).map((t) => ({
        technology: t.technology ?? "",
        version: t.version ?? "",
      })),
      resources: (draft.resources ?? []).map((r) => ({
        type: r.type ?? "DOCUMENTATION",
        label: r.label ?? "",
        url: r.url ?? "",
      })),
    });
  };

  const resumedFromUrl = useRef(false);
  useEffect(() => {
    if (!resumeId || resumedFromUrl.current || isEdit) return;
    resumedFromUrl.current = true;
    const draft = takeDraft();
    if (draft) {
      applyDraftToForm(draft);
      toast.success("Draft restored from link");
    }
  }, [resumeId, isEdit, takeDraft]);

  const onSubmit = async (values: SolutionFormValues) => {
    setSubmitError(null);

    /* Half-filled rows are how a repeatable field looks while it is being
       used. They are dropped here rather than rejected mid-edit. */
    const verificationSteps = (values.verificationSteps ?? []).filter(
      (step) => step.instruction.trim() && step.expectedResult.trim(),
    );
    const testedWith = (values.testedWith ?? [])
      .filter((entry) => entry.technology.trim())
      .map((entry) => ({
        technology: entry.technology.trim(),
        version: entry.version?.trim() || undefined,
      }));
    const links = (values.resources ?? [])
      .filter((item) => item.label.trim() && item.url?.trim())
      .map((item) => ({
        type: item.type,
        label: item.label.trim(),
        url: (item.url ?? "").trim(),
      }));

    const body = {
      summary: values.summary.trim(),
      bodyMarkdown: values.bodyMarkdown,
      approachType: values.approachType,
      /* Empty collections are sent as `[]` on an edit and dropped on a create.
         The difference matters: PATCH treats an absent field as "leave it
         alone", so omitting an emptied list would silently keep the old rows
         the author just deleted. */
      verificationSteps: isEdit
        ? verificationSteps
        : verificationSteps.length
          ? verificationSteps
          : undefined,
      testedWith: isEdit
        ? testedWith
        : testedWith.length
          ? testedWith
          : undefined,
      tradeoffs: values.tradeoffs?.trim() || undefined,
      resources: isEdit ? links : links.length ? links : undefined,
    };

    try {
      let savedSolution: SolutionResponse;
      if (solution) {
        savedSolution = await updateSolution({
          id: solution.id,
          version: solution.version ?? 0,
          problemId,
          body,
        }).unwrap();
      } else {
        savedSolution = await createSolution({ problemId, body }).unwrap();
      }

      let version = savedSolution.version ?? solution?.version ?? 0;
      for (const attached of attachedFiles) {
        try {
          const uploaded = await uploadSolutionAttachment({
            solutionId: savedSolution.id,
            version,
            file: attached.file,
          }).unwrap();
          version = uploaded.version ?? version + 1;
        } catch (uploadError) {
          toast.warning(
            isEdit ? "Changes saved without one attachment" : "Solution posted without one attachment",
            { description: contentScanErrorMessage(uploadError, attached.name) },
          );
          router.push(done);
          return;
        }
      }

      if (!isEdit) {
        await clearDraft();
      }
      toast.success(isEdit ? "Solution updated" : "Solution posted", {
        description: isEdit
          ? "Your changes have been saved."
          : "Your solution is now published on this problem.",
      });
      router.push(done);
    } catch (caught) {
      /* A 412 is the concurrency guard, not a validation failure: someone
         saved a newer version between this form loading and submitting. */
      const status =
        typeof caught === "object" && caught !== null && "status" in caught
          ? (caught as { status?: number }).status
          : undefined;

      setSubmitError(
        status === 412
          ? "This answer changed since you opened it. Reload the page to pick up the newer version, then edit again."
          : messageOf(
              caught,
              isEdit
                ? "Your changes could not be saved. Try again."
                : "Your solution could not be posted. Try again.",
            ),
      );
    }
  };

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      className="w-full"
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
        {/* ── The answer ── */}
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          {availableDraft && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-foreground"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="size-5 text-blue-500 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">
                    You have an unfinished solution draft for this problem
                    {availableDraft.summary ? `: "${availableDraft.summary}"` : ""}.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Saved {availableDraft.updatedAt ? new Date(availableDraft.updatedAt).toLocaleString() : "recently"}. Would you like to resume?
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const draft = takeDraft();
                    if (draft) {
                      applyDraftToForm(draft);
                      toast.success("Draft restored");
                    }
                  }}
                  className="rounded-xl font-medium"
                >
                  Resume draft
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void discardDraft()}
                  className="rounded-xl text-muted-foreground hover:text-foreground"
                >
                  Discard
                </Button>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Card
              className={CARD_CLASS}
              aria-labelledby="solution-body-heading"
            >
              <CardHeader className="border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 font-mono">
                    01
                  </Badge>
                  <div className="space-y-1">
                    <CardTitle>
                      <h2
                        id="solution-body-heading"
                        className="text-lg font-bold"
                      >
                        Your answer
                      </h2>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      What fixes it, and why. Steps and code blocks are welcome
                      — markdown is rendered as written.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                {/* ── The one-liner ── */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <Label
                      htmlFor="solution-summary"
                      className="text-base font-semibold"
                    >
                      Summary <span className="text-rose-500">*</span>
                    </Label>
                    <span className="text-sm tabular-nums text-slate-400">
                      {summary.length}/{MAX_SUMMARY}
                    </span>
                  </div>
                  <Input
                    id="solution-summary"
                    {...register("summary")}
                    maxLength={MAX_SUMMARY}
                    placeholder="The fix in one line — e.g. “Await the client before reading its config”"
                    disabled={submitting}
                    aria-invalid={Boolean(errors.summary)}
                    className={CONTROL_CLASS}
                  />
                  <p className="text-sm text-slate-500 dark:text-neutral-400">
                    This is the line people scan to choose between answers.
                  </p>
                  {errors.summary && (
                    <p
                      role="alert"
                      className="text-sm font-medium text-rose-600"
                    >
                      {errors.summary.message}
                    </p>
                  )}
                </div>

                {/* ── What kind of answer this is ── */}
                <div className="space-y-2">
                  <Label
                    htmlFor="solution-approach"
                    className="text-base font-semibold"
                  >
                    Approach <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={approachType}
                    onValueChange={(value) =>
                      setValue("approachType", value as ApproachType, {
                        shouldValidate: true,
                      })
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger
                      id="solution-approach"
                      aria-invalid={Boolean(errors.approachType)}
                      className="h-12! w-full rounded-xl border-slate-300 bg-white text-base dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      <SelectValue placeholder="Choose an approach" />
                    </SelectTrigger>
                    <SelectContent>
                      {APPROACH_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {APPROACH_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-slate-500 dark:text-neutral-400">
                    {APPROACH_DESCRIPTIONS[approachType as ApproachType]}
                  </p>
                  {errors.approachType && (
                    <p
                      role="alert"
                      className="text-sm font-medium text-rose-600"
                    >
                      {errors.approachType.message}
                    </p>
                  )}
                </div>

                {/* ── The answer itself ── */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <Label
                      htmlFor="solution-body"
                      className="text-base font-semibold"
                    >
                      Explanation <span className="text-rose-500">*</span>
                    </Label>
                    <span className="text-sm tabular-nums text-slate-400">
                      {bodyMarkdown.length.toLocaleString()}/
                      {MAX_BODY.toLocaleString()}
                    </span>
                  </div>

                  <MarkdownEditor
                    id="solution-body"
                    value={bodyMarkdown}
                    onChange={(value) =>
                      setValue("bodyMarkdown", value ?? "", {
                        shouldValidate: true,
                      })
                    }
                    placeholder={
                      "Start with the fix, then the reasoning.\n\n```ts\n// the change that mattered\n```"
                    }
                    height={420}
                    maxLength={MAX_BODY}
                    error={Boolean(errors.bodyMarkdown)}
                    disabled={submitting}
                    required
                    ariaDescribedBy="solution-body-error"
                  />

                  {errors.bodyMarkdown && (
                    <p
                      id="solution-body-error"
                      role="alert"
                      className="text-sm font-medium text-rose-600"
                    >
                      {errors.bodyMarkdown.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Proof ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.04, ease: "easeOut" }}
          >
            <Card
              className={CARD_CLASS}
              aria-labelledby="solution-proof-heading"
            >
              <CardHeader className="border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 font-mono">
                    02
                  </Badge>
                  <div className="space-y-1">
                    <CardTitle>
                      <h2
                        id="solution-proof-heading"
                        className="text-lg font-bold"
                      >
                        Proof it works
                      </h2>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Optional, and the difference between an answer people
                      trust and one they have to test themselves.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                {/* ── How to verify ── */}
                <fieldset className="space-y-3">
                  <legend className="flex items-center gap-2 text-base font-semibold">
                    <ListChecks
                      aria-hidden="true"
                      className="size-4 text-slate-400"
                    />
                    Verification steps
                  </legend>

                  {steps.fields.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-neutral-400">
                      Add the commands to run and what each should print.
                    </p>
                  )}

                  {steps.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-xl border border-slate-200 p-3 dark:border-neutral-700"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-500 dark:text-neutral-400">
                          Step {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={submitting}
                          onClick={() => steps.remove(index)}
                          aria-label={`Remove step ${index + 1}`}
                          className="h-8 cursor-pointer text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor={`step-instruction-${index}`}
                            className="text-sm font-medium"
                          >
                            Do this
                          </Label>
                          <Input
                            id={`step-instruction-${index}`}
                            {...register(
                              `verificationSteps.${index}.instruction`,
                            )}
                            placeholder="npm run build"
                            disabled={submitting}
                            className={CONTROL_CLASS}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor={`step-expected-${index}`}
                            className="text-sm font-medium"
                          >
                            Expect this
                          </Label>
                          <Input
                            id={`step-expected-${index}`}
                            {...register(
                              `verificationSteps.${index}.expectedResult`,
                            )}
                            placeholder="Build completes with no type errors"
                            disabled={submitting}
                            className={CONTROL_CLASS}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      submitting ||
                      steps.fields.length >= MAX_VERIFICATION_STEPS
                    }
                    onClick={() =>
                      steps.append({ instruction: "", expectedResult: "" })
                    }
                    className="h-10 cursor-pointer rounded-xl"
                  >
                    <Plus data-icon="inline-start" aria-hidden="true" />
                    Add step
                  </Button>
                </fieldset>

                {/* ── What it was proven against ── */}
                <fieldset className="space-y-3 border-t border-slate-100 pt-6 dark:border-neutral-800">
                  <legend className="text-base font-semibold">
                    Tested with
                  </legend>

                  {tested.fields.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-neutral-400">
                      The versions you actually ran this against.
                    </p>
                  )}

                  {tested.fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <Label
                          htmlFor={`tested-tech-${index}`}
                          className="text-sm font-medium"
                        >
                          Technology
                        </Label>
                        <Input
                          id={`tested-tech-${index}`}
                          {...register(`testedWith.${index}.technology`)}
                          placeholder="Next.js"
                          disabled={submitting}
                          className={CONTROL_CLASS}
                        />
                      </div>
                      <div className="w-28 shrink-0 space-y-1.5 sm:w-36">
                        <Label
                          htmlFor={`tested-version-${index}`}
                          className="text-sm font-medium"
                        >
                          Version
                        </Label>
                        <Input
                          id={`tested-version-${index}`}
                          {...register(`testedWith.${index}.version`)}
                          placeholder="16.2"
                          disabled={submitting}
                          className={CONTROL_CLASS}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={submitting}
                        onClick={() => tested.remove(index)}
                        aria-label={`Remove tested-with row ${index + 1}`}
                        className="size-12 shrink-0 cursor-pointer text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      submitting || tested.fields.length >= MAX_TESTED_WITH
                    }
                    onClick={() =>
                      tested.append({ technology: "", version: "" })
                    }
                    className="h-10 cursor-pointer rounded-xl"
                  >
                    <Plus data-icon="inline-start" aria-hidden="true" />
                    Add technology
                  </Button>
                </fieldset>

                {/* ── What it costs ── */}
                <div className="space-y-2 border-t border-slate-100 pt-6 dark:border-neutral-800">
                  <div className="flex items-baseline justify-between gap-3">
                    <Label
                      htmlFor="solution-tradeoffs"
                      className="flex items-center gap-2 text-base font-semibold"
                    >
                      <Scale
                        aria-hidden="true"
                        className="size-4 text-slate-400"
                      />
                      Trade-offs
                    </Label>
                    <span className="text-sm tabular-nums text-slate-400">
                      {tradeoffs.length.toLocaleString()}/
                      {MAX_TRADEOFFS.toLocaleString()}
                    </span>
                  </div>
                  <Textarea
                    id="solution-tradeoffs"
                    {...register("tradeoffs")}
                    maxLength={MAX_TRADEOFFS}
                    rows={4}
                    placeholder="What this costs — performance, complexity, anything it gives up."
                    disabled={submitting}
                    className="rounded-xl border-slate-300 bg-white text-base dark:border-neutral-700 dark:bg-neutral-900"
                  />
                  {errors.tradeoffs && (
                    <p
                      role="alert"
                      className="text-sm font-medium text-rose-600"
                    >
                      {errors.tradeoffs.message}
                    </p>
                  )}
                </div>

                {/* ── Further reading ── */}
                <fieldset className="space-y-3 border-t border-slate-100 pt-6 dark:border-neutral-800">
                  <legend className="text-base font-semibold">Resources</legend>

                  {resources.fields.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-neutral-400">
                      Docs, a repository, a recording — anything that backs the
                      answer up.
                    </p>
                  )}

                  {resources.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-neutral-700"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-500 dark:text-neutral-400">
                          Link {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={submitting}
                          onClick={() => resources.remove(index)}
                          aria-label={`Remove link ${index + 1}`}
                          className="h-8 cursor-pointer text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </Button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor={`resource-type-${index}`}
                            className="text-sm font-medium"
                          >
                            Kind
                          </Label>
                          <ResourceTypeSelect
                            index={index}
                            control={control}
                            disabled={submitting}
                            onChange={(value) =>
                              setValue(`resources.${index}.type`, value, {
                                shouldValidate: true,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor={`resource-label-${index}`}
                            className="text-sm font-medium"
                          >
                            Label
                          </Label>
                          <Input
                            id={`resource-label-${index}`}
                            {...register(`resources.${index}.label`)}
                            placeholder="Next.js caching docs"
                            disabled={submitting}
                            className={CONTROL_CLASS}
                          />
                          {errors.resources?.[index]?.label && (
                            <p
                              role="alert"
                              className="text-sm font-medium text-rose-600"
                            >
                              {errors.resources[index]?.label?.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor={`resource-url-${index}`}
                          className="text-sm font-medium"
                        >
                          URL
                        </Label>
                        <Input
                          id={`resource-url-${index}`}
                          {...register(`resources.${index}.url`)}
                          placeholder="https://…"
                          disabled={submitting}
                          className={CONTROL_CLASS}
                        />
                        {errors.resources?.[index]?.url && (
                          <p
                            role="alert"
                            className="text-sm font-medium text-rose-600"
                          >
                            {errors.resources[index]?.url?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      submitting || resources.fields.length >= MAX_RESOURCES
                    }
                    onClick={() =>
                      resources.append({
                        type: "DOCUMENTATION",
                        label: "",
                        url: "",
                      })
                    }
                    className="h-10 cursor-pointer rounded-xl"
                  >
                    <Plus data-icon="inline-start" aria-hidden="true" />
                    Add resource
                  </Button>
                </fieldset>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
          >
            <Card className={CARD_CLASS} aria-labelledby="solution-attachments-heading">
              <CardHeader className="border-b border-slate-100 dark:border-neutral-800">
                <CardTitle>
                  <h2 id="solution-attachments-heading" className="text-lg font-bold">
                    Supporting files
                  </h2>
                </CardTitle>
                <CardDescription>
                  Optional evidence is checked against known threats before it
                  is stored. Anything new to our scanner finishes checking
                  shortly after upload.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {/* Same gap as the problem editor: the dropzone holds only
                    this session's picks, so stored evidence was invisible. */}
                {solution?.attachments?.length ? (
                  <ExistingAttachments
                    attachments={solution.attachments}
                    disabled={submitting}
                    onRemove={handleRemoveAttachment}
                  />
                ) : null}

                <FileUploadDropzone
                  files={attachedFiles}
                  onAddFiles={(files) => setAttachedFiles((current) => [...current, ...files])}
                  onRemoveFile={(fileId) =>
                    setAttachedFiles((current) => current.filter((file) => file.id !== fileId))
                  }
                  disabled={submitting}
                  maxFiles={Math.max(0, 10 - (solution?.attachments?.length ?? 0))}
                />
                <ContentScanStatus
                  active={uploading}
                  fileCount={attachedFiles.length}
                  compact
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── What is being answered, and the actions ── */}
        <aside
          className="flex flex-col gap-5 lg:sticky lg:self-start"
          style={{ top: stickyTop } as React.CSSProperties}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.04, ease: "easeOut" }}
          >
            <Card className={CARD_CLASS} aria-labelledby="answering-heading">
              <CardHeader className="border-b border-slate-100 dark:border-neutral-800">
                <CardTitle>
                  <h2 id="answering-heading" className="text-lg font-bold">
                    Answering
                  </h2>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 pt-6">
                <Link
                  href={`/community/${problemId}`}
                  className="block text-base font-bold text-slate-900 transition-colors hover:text-blue-600 dark:text-neutral-100 dark:hover:text-blue-400"
                >
                  {problem?.title ?? "This problem"}
                </Link>

                {problem?.description && (
                  <p className="line-clamp-4 text-sm leading-relaxed text-slate-500 dark:text-neutral-400">
                    {excerptOf(problem.description, 220)}
                  </p>
                )}

                <p className="text-sm text-slate-500 dark:text-neutral-400">
                  by{" "}
                  <span className="font-semibold text-slate-700 dark:text-neutral-300">
                    {authorNameOf(problem?.author)}
                  </span>
                </p>

                {Boolean(
                  problem?.technologies?.length || problem?.tags?.length,
                ) && (
                  <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-neutral-800">
                    {(problem?.technologies ?? []).map((tech, i) => (
                      <span
                        key={tech.id ?? `${tech.name}-${i}`}
                        className="rounded-lg border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:border-neutral-700 dark:text-neutral-300"
                      >
                        {tech.name}
                      </span>
                    ))}
                    {(problem?.tags ?? []).map((tag, i) => (
                      <span
                        key={tag.id ?? `${tag.name}-${i}`}
                        className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-neutral-800 dark:text-neutral-400"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
          >
            <Card
              className={CARD_CLASS}
              aria-labelledby="solution-ready-heading"
            >
              <CardHeader className="border-b border-slate-100 dark:border-neutral-800">
                <CardTitle>
                  <h2 id="solution-ready-heading" className="text-lg font-bold">
                    Before you post
                  </h2>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2.5 pt-6">
                <RequirementRow
                  label={`Summary (${MIN_SUMMARY}+ characters)`}
                  met={summary.trim().length >= MIN_SUMMARY}
                />
                <RequirementRow
                  label={`Explanation (${MIN_BODY}+ characters)`}
                  met={bodyMarkdown.trim().length >= MIN_BODY}
                />
                <RequirementRow
                  label="Approach chosen"
                  met={Boolean(approachType)}
                />
                <RequirementRow
                  label="Verification steps"
                  met={steps.fields.length > 0}
                  optional
                />
                <RequirementRow
                  label="Tested with"
                  met={tested.fields.length > 0}
                  optional
                />
                <RequirementRow
                  label="Trade-offs"
                  met={tradeoffs.trim().length > 0}
                  optional
                />
                <RequirementRow
                  label="Resources"
                  met={resources.fields.length > 0}
                  optional
                />
              </CardContent>

              <CardFooter className="flex flex-col gap-2.5">
                {submitError && (
                  <p
                    role="alert"
                    className="flex w-full items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                  >
                    <AlertCircle
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0"
                    />
                    {submitError}
                  </p>
                )}

                {!isEdit && (
                  <div className="w-full flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border">
                    <span>Autosave</span>
                    <span className="font-medium">
                      {isSavingDraft ? (
                        <span className="flex items-center gap-1.5 text-primary">
                          <LoaderCircle className="size-3 animate-spin" /> Saving draft…
                        </span>
                      ) : savedAt ? (
                        <span>
                          Saved at {new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      ) : (
                        <span>Ready</span>
                      )}
                    </span>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="h-11 w-full cursor-pointer rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle
                        data-icon="inline-start"
                        aria-hidden="true"
                        className="animate-spin motion-reduce:animate-none"
                      />
                      {isEdit ? "Saving…" : "Posting…"}
                    </>
                  ) : (
                    <>
                      <Send data-icon="inline-start" aria-hidden="true" />
                      {isEdit ? "Save changes" : "Post solution"}
                    </>
                  )}
                </Button>

                {!isEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={isSavingDraft || submitting}
                    onClick={async () => {
                      const ok = await saveDraftNow();
                      if (ok) toast.success("Draft saved to server");
                    }}
                    className="h-11 w-full cursor-pointer rounded-xl"
                  >
                    {isSavingDraft ? (
                      <>
                        <LoaderCircle data-icon="inline-start" className="size-4 animate-spin" />
                        Saving draft…
                      </>
                    ) : (
                      <>
                        <Save data-icon="inline-start" className="size-4" />
                        Save draft
                      </>
                    )}
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={submitting}
                  onClick={() => router.push(back)}
                  className="h-11 w-full cursor-pointer rounded-xl"
                >
                  Cancel
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </aside>
      </div>
    </form>
  );
}

/** The kind of link a resource row points at. Watched so the trigger shows it. */
function ResourceTypeSelect({
  index,
  control,
  disabled,
  onChange,
}: {
  index: number;
  control: ReturnType<
    typeof useForm<SolutionFormInput, unknown, SolutionFormValues>
  >["control"];
  disabled: boolean;
  onChange: (value: (typeof RESOURCE_TYPES)[number]) => void;
}) {
  const value =
    useWatch({ control, name: `resources.${index}.type` }) ?? "DOCUMENTATION";

  return (
    <Select
      value={value}
      onValueChange={(next) =>
        onChange(next as (typeof RESOURCE_TYPES)[number])
      }
      disabled={disabled}
    >
      <SelectTrigger
        id={`resource-type-${index}`}
        className="h-12! w-full rounded-xl border-slate-300 bg-white text-base dark:border-neutral-700 dark:bg-neutral-900"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {RESOURCE_TYPES.map((type) => (
          <SelectItem key={type} value={type}>
            {RESOURCE_LABELS[type]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
      <span className="flex items-center gap-2 text-slate-600 dark:text-neutral-300">
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
