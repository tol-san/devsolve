"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";
import { useGetActiveCategoriesQuery } from "@/lib/redux/services/categoriesApi";
import {
  useCreateProblemDraftMutation,
  useCreateProblemMutation,
  useSubmitProblemMutation,
  useUploadProblemAttachmentMutation,
  useDeleteProblemAttachmentMutation,
  useUpdateProblemMutation,
  useUpdateProblemDraftMutation,
  useGetMyProblemsQuery,
  useGetProblemByIdQuery,
  useLazyGetProblemByIdQuery,
  type ProblemResponse,
} from "@/lib/redux/services/problemsApi";
import { createProblemFormSchema } from "@/lib/validations/problem";
import { parseApiError } from "@/lib/api/errors";
import {
  apiErrorMessage,
  contentScanErrorMessage,
} from "@/lib/api/error-message";
import type { AttachedFile } from "@/components/reports/FileUploadDropzone";
import {
  ProblemBanners,
  ProblemDetailsSection,
  ProblemTechnologiesSection,
  ProblemDiagnosisSection,
  ProblemAttachmentsSection,
  ProblemContextSidebar,
  ProblemTagsSidebar,
  ProblemSubmitCard,
  MAX_TAGS,
  type ProblemFormInput,
  type ProblemFormValues,
  type FieldConflict,
  type CreateProblemFormProps,
  buildProblemCreateBody,
  buildProblemPatchBody,
  getContentDifferences,
  serverFieldPath,
} from "./problem-form";

export function CreateProblemForm({
  problem,
  successHref = "/dashboard/my-community",
  cancelHref = "/community/create",
  stickyTop = "1.5rem",
}: CreateProblemFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams?.get("draftId") || searchParams?.get("id") || undefined;

  const { data: fetchedDraftProblem } = useGetProblemByIdQuery(draftId ?? "", {
    skip: !draftId || Boolean(problem),
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const activeProblem = problem ?? fetchedDraftProblem;
  const isDraftProblem = !activeProblem || activeProblem.status === "DRAFT";
  const isPublishedEdit = Boolean(activeProblem && activeProblem.status !== "DRAFT");
  const isEdit = Boolean(activeProblem);
  const [deleteAttachment] = useDeleteProblemAttachmentMutation();

  const handleRemoveAttachment = async (attachmentId: string) => {
    const targetProblem = activeProblem ?? preparedDraft;
    if (!targetProblem?.id) return;
    try {
      await deleteAttachment({ problemId: targetProblem.id, attachmentId }).unwrap();
      toast.success("Attachment removed");
    } catch (error) {
      toast.error("That attachment could not be removed", {
        description: apiErrorMessage(
          error,
          "The problem service did not respond. Nothing was deleted.",
        ),
      });
    }
  };

  const { data: session } = authClient.useSession();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [tagDraftError, setTagDraftError] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [preparedDraft, setPreparedDraft] = useState<ProblemResponse | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [dismissedDraftBanner, setDismissedDraftBanner] = useState(false);
  const [conflictData, setConflictData] = useState<{
    fresh: ProblemResponse;
    diffs: FieldConflict[];
  } | null>(null);

  const baselineProblemRef = useRef<ProblemResponse | null>(problem ?? null);
  const hasSubmittedRef = useRef(false);

  const preparedDraftRef = useRef<ProblemResponse | null>(preparedDraft);
  useEffect(() => {
    preparedDraftRef.current = preparedDraft;
  }, [preparedDraft]);

  const [refetchProblem] = useLazyGetProblemByIdQuery();

  const statusOf = (error: unknown) =>
    typeof error === "object" && error !== null && "status" in error
      ? (error as { status?: number }).status
      : undefined;

  const activeProblemRef = useRef<ProblemResponse | undefined>(activeProblem);
  useEffect(() => {
    activeProblemRef.current = activeProblem;
  }, [activeProblem]);

  const versionForWrite = useCallback((id: string | undefined) => {
    const versions = [preparedDraftRef.current, activeProblemRef.current]
      .filter(
        (entry): entry is ProblemResponse =>
          Boolean(entry?.id) && entry?.id === id,
      )
      .map((entry) => entry.version ?? 0);
    return versions.length ? Math.max(...versions) : 0;
  }, []);

  const resyncAfterConflict = useCallback(
    async (id: string | undefined) => {
      if (!id) return;
      try {
        const fresh = await refetchProblem(id).unwrap();
        if (fresh?.id) {
          setPreparedDraft(fresh);
          preparedDraftRef.current = fresh;
        }
      } catch {
        /* Leaves the message standing; a reload is still the way out. */
      }
    },
    [refetchProblem, setPreparedDraft],
  );

  const lastSavedPayloadRef = useRef<string>("");

  const { data: myProblemsData } = useGetMyProblemsQuery(
    { size: 30 },
    {
      skip: isEdit || !session?.user,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    },
  );

  const existingDrafts = useMemo(() => {
    return (myProblemsData?.content ?? []).filter((p) => p.status === "DRAFT");
  }, [myProblemsData]);

  const latestDraft = existingDrafts[0] ?? null;

  const {
    data: categories = [],
    isLoading: loadingCategories,
    isError: categoriesFailed,
  } = useGetActiveCategoriesQuery("PROBLEM");
  const [createProblem, { isLoading: creating }] = useCreateProblemMutation();
  const [createProblemDraft, { isLoading: creatingDraft }] =
    useCreateProblemDraftMutation();
  const [updateProblem, { isLoading: saving }] = useUpdateProblemMutation();
  const [updateProblemDraft] = useUpdateProblemDraftMutation();
  const [uploadProblemAttachment, { isLoading: uploading }] =
    useUploadProblemAttachmentMutation();
  const [submitProblem, { isLoading: submittingDraft }] =
    useSubmitProblemMutation();
  const mutationLoading =
    creating || creatingDraft || saving || uploading || submittingDraft;

  const categoryItems = useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categories],
  );
  const categorySelectItems = useMemo(
    () => [
      {
        value: null,
        label: loadingCategories
          ? "Loading categories…"
          : categoryItems.length === 0
            ? "No categories available"
            : "Choose a category",
      },
      ...categoryItems,
    ],
    [categoryItems, loadingCategories],
  );

  const {
    control,
    register,
    setError,
    setValue,
    getValues,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProblemFormInput, unknown, ProblemFormValues>({
    resolver: zodResolver(createProblemFormSchema),
    mode: "onBlur",
    defaultValues: {
      title: problem?.title ?? "",
      description: problem?.description ?? "",
      categoryId: problem?.category?.id,
      problemType: problem?.problemType,
      severity: problem?.severity,
      sdlcPhase: problem?.sdlcPhase,
      expectedBehavior: problem?.expectedBehavior ?? "",
      actualBehavior: problem?.actualBehavior ?? "",
      attemptsTried: problem?.attemptsTried ?? "",
      errorMessage: problem?.errorMessage ?? "",
      repositoryUrl: problem?.repositoryUrl ?? "",
      technologies: (problem?.technologies ?? []).map((tech) => ({
        name: tech.name ?? "",
        version: tech.version ?? "",
      })),
      environment: (problem?.environment ?? []).map((entry) => ({
        technology: entry.technology ?? "",
        version: entry.version ?? "",
      })),
      reproductionSteps: [...(problem?.reproductionSteps ?? [])],
      newTagNames: (problem?.tags ?? [])
        .map((tag) => tag.name ?? "")
        .filter(Boolean),
    },
  });

  const {
    fields: technologyFields,
    append: appendTechnology,
    remove: removeTechnology,
  } = useFieldArray({ control, name: "technologies" });

  const {
    fields: environmentFields,
    append: appendEnvironment,
    remove: removeEnvironment,
  } = useFieldArray({ control, name: "environment" });

  const title = useWatch({ control, name: "title" }) ?? "";
  const description = useWatch({ control, name: "description" }) ?? "";
  const categoryId = useWatch({ control, name: "categoryId" });
  const problemType = useWatch({ control, name: "problemType" });
  const severity = useWatch({ control, name: "severity" });
  const sdlcPhase = useWatch({ control, name: "sdlcPhase" });
  const expectedBehavior = useWatch({ control, name: "expectedBehavior" }) ?? "";
  const actualBehavior = useWatch({ control, name: "actualBehavior" }) ?? "";
  const errorMessage = useWatch({ control, name: "errorMessage" }) ?? "";
  const attemptsTried = useWatch({ control, name: "attemptsTried" }) ?? "";
  const technologies = useWatch({ control, name: "technologies" }) ?? [];
  const reproductionSteps =
    useWatch({ control, name: "reproductionSteps" }) ?? [];
  const tags = useWatch({ control, name: "newTagNames" }) ?? [];

  const setSteps = (next: string[]) =>
    setValue("reproductionSteps", next, {
      shouldDirty: true,
      shouldValidate: true,
    });

  const loadDraftIntoForm = (draft: ProblemResponse) => {
    hasLoadedDraftRef.current = true;
    baselineProblemRef.current = draft;
    setPreparedDraft(draft);
    preparedDraftRef.current = draft;
    lastSavedPayloadRef.current = JSON.stringify({
      title: (draft.title ?? "").trim(),
      description: (draft.description ?? "").trim(),
      categoryId: draft.category?.id,
      problemType: draft.problemType,
    });
    reset({
      title: draft.title ?? "",
      description: draft.description ?? "",
      categoryId: draft.category?.id,
      problemType: draft.problemType,
      severity: draft.severity,
      sdlcPhase: draft.sdlcPhase,
      expectedBehavior: draft.expectedBehavior ?? "",
      actualBehavior: draft.actualBehavior ?? "",
      attemptsTried: draft.attemptsTried ?? "",
      errorMessage: draft.errorMessage ?? "",
      repositoryUrl: draft.repositoryUrl ?? "",
      technologies: (draft.technologies ?? []).map((tech) => ({
        name: tech.name ?? "",
        version: tech.version ?? "",
      })),
      environment: (draft.environment ?? []).map((entry) => ({
        technology: entry.technology ?? "",
        version: entry.version ?? "",
      })),
      reproductionSteps: [...(draft.reproductionSteps ?? [])],
      newTagNames: (draft.tags ?? []).map((t) => t.name ?? "").filter(Boolean),
    });
    toast.success("Draft loaded into editor.");
  };

  const hasLoadedDraftRef = useRef(false);
  const appliedProblemId = useRef<string | null>(null);
  useEffect(() => {
    if (!activeProblem || hasLoadedDraftRef.current) return;
    hasLoadedDraftRef.current = true;
    appliedProblemId.current = activeProblem.id ?? null;
    if (!baselineProblemRef.current) {
      baselineProblemRef.current = activeProblem;
    }
    loadDraftIntoForm(activeProblem);
    if (activeProblem.status === "DRAFT") {
      toast.success("Draft restored from link");
    }
  }, [activeProblem]);

  const handleInsertTemplate = (template: "expected" | "steps" | "logs") => {
    let snippet = "";
    if (template === "expected") {
      snippet = `\n\n### Expected Behavior\nDescribe what you expected to happen...\n\n### Actual Behavior\nDescribe what actually happened instead...\n`;
    } else if (template === "steps") {
      snippet = `\n\n### Steps to Reproduce\n1. Go to '...'\n2. Click on '...'\n3. Scroll down to '...'\n4. See error\n`;
    } else if (template === "logs") {
      snippet = `\n\n### Error / Stack Trace\n\`\`\`text\n[Paste error log or console output here]\n\`\`\`\n`;
    }
    const current = description ?? "";
    setValue(
      "description",
      current ? `${current.trimEnd()}${snippet}` : snippet.trimStart(),
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const submitting = isSubmitting || mutationLoading;
  const submittingRef = useRef(submitting);
  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);
  const titleLength = title.trim().length;
  const descriptionLength = description.trim().length;
  const titleReady = titleLength >= 10 && titleLength <= 180;
  const descriptionReady =
    descriptionLength >= 30 && descriptionLength <= 20_000;
  const technologiesReady = technologies.every(
    (technology) =>
      technology.name.trim().length >= 1 &&
      technology.name.trim().length <= 100 &&
      (technology.version?.trim().length ?? 0) <= 50,
  );
  const normalizedPendingTag = tagDraft.trim().replace(/^#+/, "");
  const pendingTagLength = normalizedPendingTag.length;
  const pendingTagAddsNewValue =
    pendingTagLength > 0 &&
    !tags.some(
      (tag) => tag.toLowerCase() === normalizedPendingTag.toLowerCase(),
    );
  const tagsReady =
    !tagDraftError &&
    pendingTagLength <= 50 &&
    tags.length + (pendingTagAddsNewValue ? 1 : 0) <= MAX_TAGS;
  const isBug = problemType === "BUG";
  const bugRequirementsMet =
    !isBug ||
    (Boolean(expectedBehavior.trim()) &&
      Boolean(actualBehavior.trim()) &&
      reproductionSteps.some((step) => step.trim()));
  const formReady =
    titleReady &&
    descriptionReady &&
    Boolean(categoryId) &&
    Boolean(problemType) &&
    technologiesReady &&
    tagsReady &&
    bugRequirementsMet;

  const addTag = () => {
    const tag = tagDraft.trim().replace(/^#+/, "");

    if (!tag) return;
    if (tags.length >= MAX_TAGS) {
      setTagDraftError(`You can add up to ${MAX_TAGS} tags.`);
      return;
    }
    if (tag.length > 50) {
      setTagDraftError("Tags must not exceed 50 characters.");
      return;
    }
    if (tags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
      setTagDraftError("That tag is already included.");
      return;
    }

    setValue("newTagNames", [...tags, tag], {
      shouldDirty: true,
      shouldValidate: true,
    });
    setTagDraft("");
    setTagDraftError(null);
  };

  const removeTag = (tag: string) => {
    setValue(
      "newTagNames",
      tags.filter((value) => value !== tag),
      { shouldDirty: true, shouldValidate: true },
    );
    setTagDraftError(null);
  };

  const handleForceOverwrite = async () => {
    if (!conflictData) return;
    const fresh = conflictData.fresh;
    baselineProblemRef.current = fresh;
    preparedDraftRef.current = fresh;
    setPreparedDraft(fresh);
    setConflictData(null);
    toast.info("Applying your changes to the latest version...");
    void handleSubmit(onSubmit)();
  };

  const handleDiscardAndReload = () => {
    if (!conflictData) return;
    loadDraftIntoForm(conflictData.fresh);
    setConflictData(null);
    toast.info("Server version reloaded into editor.");
  };

  const onSubmit = async (values: ProblemFormValues) => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    setSubmitError(null);
    setConflictData(null);

    const pendingTag = tagDraft.trim().replace(/^#+/, "");
    let submittedTags = values.newTagNames ?? [];

    if (pendingTag) {
      if (pendingTag.length > 50) {
        setTagDraftError("Tags must not exceed 50 characters.");
        return;
      }

      const alreadyIncluded = submittedTags.some(
        (tag) => tag.toLowerCase() === pendingTag.toLowerCase(),
      );
      if (!alreadyIncluded) {
        if (submittedTags.length >= MAX_TAGS) {
          setTagDraftError(`You can add up to ${MAX_TAGS} tags.`);
          return;
        }
        submittedTags = [...submittedTags, pendingTag];
      }
    }

    submittingRef.current = true;
    let releaseWriteLane: (() => void) | null = null;
    try {
      releaseWriteLane = await holdWriteLane();

      const workingProblem =
        preparedDraftRef.current ?? activeProblemRef.current ?? problem;

      if (workingProblem?.id) {
        const patchBody = buildProblemPatchBody(
          values,
          baselineProblemRef.current,
          submittedTags,
        );

        let saved = workingProblem;

        if (Object.keys(patchBody).length > 0) {
          try {
            saved = await updateProblem({
              id: workingProblem.id,
              version: versionForWrite(workingProblem.id),
              body: patchBody,
            }).unwrap();
            baselineProblemRef.current = saved;
            preparedDraftRef.current = saved;
            setPreparedDraft(saved);
          } catch (updateErr) {
            if (statusOf(updateErr) === 412) {
              const fresh = await refetchProblem(workingProblem.id).unwrap();
              const diffs = getContentDifferences(
                fresh,
                baselineProblemRef.current,
                values,
                submittedTags,
              );
              if (diffs.length === 0) {
                baselineProblemRef.current = fresh;
                preparedDraftRef.current = fresh;
                setPreparedDraft(fresh);
                saved = await updateProblem({
                  id: workingProblem.id,
                  version: fresh.version ?? 0,
                  body: patchBody,
                }).unwrap();
                baselineProblemRef.current = saved;
                preparedDraftRef.current = saved;
                setPreparedDraft(saved);
              } else {
                setConflictData({ fresh, diffs });
                setSubmitError(
                  "The problem was updated on the server while you were editing. Review the differences below before overwriting.",
                );
                return;
              }
            } else {
              throw updateErr;
            }
          }
        }

        for (const attached of attachedFiles) {
          try {
            saved = await uploadProblemAttachment({
              problemId: saved.id!,
              file: attached.file,
            }).unwrap();
            baselineProblemRef.current = saved;
            setPreparedDraft(saved);
            preparedDraftRef.current = saved;
            setAttachedFiles((current) =>
              current.filter((file) => file.id !== attached.id),
            );
          } catch (uploadError) {
            const message = contentScanErrorMessage(uploadError, attached.name);
            setSubmitError(
              `${message} Your other changes are saved; remove or replace that file and submit again.`,
            );
            toast.error("Attachment not added", { description: message });
            return;
          }
        }

        if (isDraftProblem) {
          saved = await submitProblem(saved.id!).unwrap();
        }

        hasSubmittedRef.current = true;
        setPreparedDraft(null);
        toast.success(
          isPublishedEdit ? "Problem updated." : "Problem submitted for review.",
        );
        router.push(successHref);
        return;
      }

      const createBody = buildProblemCreateBody(values, submittedTags);
      if (attachedFiles.length) {
        let draftProblem = await createProblemDraft(createBody).unwrap();
        baselineProblemRef.current = draftProblem;
        setPreparedDraft(draftProblem);
        preparedDraftRef.current = draftProblem;

        for (const attached of attachedFiles) {
          try {
            draftProblem = await uploadProblemAttachment({
              problemId: draftProblem.id!,
              file: attached.file,
            }).unwrap();
            baselineProblemRef.current = draftProblem;
            setPreparedDraft(draftProblem);
            preparedDraftRef.current = draftProblem;
            setAttachedFiles((current) =>
              current.filter((file) => file.id !== attached.id),
            );
          } catch (uploadError) {
            const message = contentScanErrorMessage(uploadError, attached.name);
            setSubmitError(
              `${message} Your problem is saved as a draft; remove or replace that file and submit again.`,
            );
            toast.error("Attachment not added", { description: message });
            return;
          }
        }

        const submitted = await submitProblem(draftProblem.id!).unwrap();
        hasSubmittedRef.current = true;
        setPreparedDraft(null);
        toast.success(
          submitted.status === "PENDING_APPROVAL"
            ? "Problem submitted. Screening content…"
            : "Problem submitted successfully.",
        );
        router.push(successHref);
        return;
      }

      const created = await createProblem(createBody).unwrap();
      hasSubmittedRef.current = true;
      toast.success(
        created.status === "PENDING_APPROVAL"
          ? "Problem submitted. Screening content…"
          : "Problem submitted successfully.",
      );
      router.push(successHref);
    } catch (error) {
      const status = statusOf(error);

      if (status === 412) {
        const conflicted = preparedDraftRef.current?.id ?? activeProblem?.id;
        await resyncAfterConflict(conflicted);
        setSubmitError(
          "The problem was updated on the server while you were editing. Review your changes and submit again.",
        );
        return;
      }

      const parsed = parseApiError(
        error,
        isPublishedEdit
          ? "Your changes could not be saved. Please try again."
          : "The problem could not be submitted. Please try again.",
      );

      for (const [field, message] of Object.entries(parsed.fieldErrors)) {
        const path = serverFieldPath(field);
        if (!path) continue;
        setError(path, {
          type: "server",
          message,
        });
      }

      if (parsed.message.includes("BUG problems require")) {
        setError("expectedBehavior", {
          type: "server",
          message: "Expected behaviour is required for bug reports",
        });
        setError("actualBehavior", {
          type: "server",
          message: "Actual behaviour is required for bug reports",
        });
        setError("reproductionSteps", {
          type: "server",
          message: "At least one reproduction step is required for bug reports",
        });
      }

      setSubmitError(parsed.message);
      toast.error(parsed.message);
    } finally {
      releaseWriteLane?.();
      submittingRef.current = false;
    }
  };

  const handleSaveDraft = async () => {
    setSubmitError(null);
    setConflictData(null);

    const values = getValues();
    const draftTitle = values.title?.trim();

    if (!draftTitle || draftTitle.length < 10) {
      toast.error("Please provide a title of at least 10 characters to save a draft.");
      setError("title", {
        type: "manual",
        message: "Title must be at least 10 characters to save a draft",
      });
      return;
    }

    if (!values.categoryId) {
      toast.error("Please select a category to save a draft.");
      setError("categoryId", {
        type: "manual",
        message: "Please select a category",
      });
      return;
    }

    if (!values.problemType) {
      toast.error("Please select a problem type to save a draft.");
      setError("problemType", {
        type: "manual",
        message: "Please select a problem type",
      });
      return;
    }

    const draftDesc = values.description?.trim();
    if (!draftDesc || draftDesc.length < 30) {
      toast.error("Please provide a description of at least 30 characters to save a draft.");
      setError("description", {
        type: "manual",
        message: "Description must be at least 30 characters",
      });
      return;
    }

    if (values.problemType === "BUG") {
      const hasExpected = Boolean(values.expectedBehavior?.trim());
      const hasActual = Boolean(values.actualBehavior?.trim());
      const hasSteps = (values.reproductionSteps ?? []).some((s) => s.trim());
      if (!hasExpected) {
        setError("expectedBehavior", {
          type: "manual",
          message: "Expected behaviour is required for bug reports",
        });
      }
      if (!hasActual) {
        setError("actualBehavior", {
          type: "manual",
          message: "Actual behaviour is required for bug reports",
        });
      }
      if (!hasSteps) {
        setError("reproductionSteps", {
          type: "manual",
          message: "At least one reproduction step is required for bug reports",
        });
      }
      if (!hasExpected || !hasActual || !hasSteps) {
        toast.error(
          "BUG problems require expected behaviour, actual behaviour, and at least one reproduction step.",
        );
        return;
      }
    }

    const pendingTag = tagDraft.trim().replace(/^#+/, "");
    let submittedTags = values.newTagNames ?? [];
    if (pendingTag && !submittedTags.includes(pendingTag)) {
      submittedTags = [...submittedTags, pendingTag];
    }

    setIsSavingDraft(true);
    let releaseWriteLane: (() => void) | null = null;
    try {
      releaseWriteLane = await holdWriteLane();

      const workingProblem =
        preparedDraftRef.current ?? activeProblemRef.current ?? problem;

      let saved: ProblemResponse;
      if (workingProblem?.id) {
        const patchBody = buildProblemPatchBody(
          values,
          baselineProblemRef.current,
          submittedTags,
        );

        if (Object.keys(patchBody).length > 0) {
          try {
            saved = await updateProblemDraft({
              id: workingProblem.id,
              version: versionForWrite(workingProblem.id),
              body: patchBody,
            }).unwrap();
            baselineProblemRef.current = saved;
            preparedDraftRef.current = saved;
            setPreparedDraft(saved);
          } catch (updateErr) {
            if (statusOf(updateErr) === 412) {
              const fresh = await refetchProblem(workingProblem.id).unwrap();
              const diffs = getContentDifferences(
                fresh,
                baselineProblemRef.current,
                values,
                submittedTags,
              );
              if (diffs.length === 0) {
                baselineProblemRef.current = fresh;
                preparedDraftRef.current = fresh;
                setPreparedDraft(fresh);
                saved = await updateProblemDraft({
                  id: workingProblem.id,
                  version: fresh.version ?? 0,
                  body: patchBody,
                }).unwrap();
                baselineProblemRef.current = saved;
                preparedDraftRef.current = saved;
                setPreparedDraft(saved);
              } else {
                setConflictData({ fresh, diffs });
                const message =
                  "The problem was updated on the server while you were editing. Review the differences below before overwriting.";
                setSubmitError(message);
                toast.error(message);
                return;
              }
            } else {
              throw updateErr;
            }
          }
        } else {
          saved = workingProblem;
        }
      } else {
        const createBody = buildProblemCreateBody(values, submittedTags);
        saved = await createProblemDraft(createBody).unwrap();
        baselineProblemRef.current = saved;
        preparedDraftRef.current = saved;
        setPreparedDraft(saved);
      }

      for (const attached of attachedFiles) {
        try {
          saved = await uploadProblemAttachment({
            problemId: saved.id!,
            file: attached.file,
          }).unwrap();
          baselineProblemRef.current = saved;
          setPreparedDraft(saved);
          preparedDraftRef.current = saved;
          setAttachedFiles((current) =>
            current.filter((file) => file.id !== attached.id),
          );
        } catch (uploadError) {
          const message = contentScanErrorMessage(uploadError, attached.name);
          toast.error("Attachment failed", { description: message });
        }
      }

      setDraftSavedAt(saved.updatedAt ?? new Date().toISOString());
      toast.success("Draft saved successfully.");
      router.push("/dashboard/saved-draft");
    } catch (error) {
      if (statusOf(error) === 412) {
        await resyncAfterConflict(
          preparedDraftRef.current?.id ?? activeProblem?.id,
        );
        const message =
          "The problem was updated on the server while you were editing. Review your changes and save again.";
        setSubmitError(message);
        toast.error(message);
        return;
      }
      const parsed = parseApiError(error, "The draft could not be saved.");
      setSubmitError(parsed.message);
      toast.error(parsed.message);
    } finally {
      releaseWriteLane?.();
      setIsSavingDraft(false);
    }
  };

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const autoSaving = useRef(false);
  const autoSaveReqSeq = useRef(0);

  const settleAutoSave = useCallback(async () => {
    for (let waited = 0; autoSaving.current && waited < 5000; waited += 100) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }, []);

  const holdWriteLane = useCallback(async () => {
    await settleAutoSave();
    autoSaving.current = true;
    return () => {
      autoSaving.current = false;
    };
  }, [settleAutoSave]);

  useEffect(() => {
    if (
      isPublishedEdit ||
      !session?.user ||
      !isDirty ||
      hasSubmittedRef.current ||
      conflictData !== null
    ) {
      return;
    }

    const currentStatus =
      preparedDraftRef.current?.status ??
      activeProblemRef.current?.status ??
      problem?.status;
    if (
      currentStatus === "PENDING_APPROVAL" ||
      currentStatus === "PUBLISHED" ||
      currentStatus === "CLOSED" ||
      currentStatus === "REJECTED"
    ) {
      return;
    }

    const canAutoSave =
      title.trim().length >= 10 &&
      Boolean(categoryId) &&
      Boolean(problemType) &&
      description.trim().length >= 30;

    if (!canAutoSave) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(async () => {
      if (
        autoSaving.current ||
        submittingRef.current ||
        hasSubmittedRef.current ||
        conflictData !== null
      ) {
        return;
      }

      const values = getValues();
      const pendingTag = tagDraft.trim().replace(/^#+/, "");
      let submittedTags = values.newTagNames ?? [];
      if (pendingTag && !submittedTags.includes(pendingTag)) {
        submittedTags = [...submittedTags, pendingTag];
      }

      const workingProblem =
        preparedDraftRef.current ?? activeProblemRef.current ?? problem;
      if (
        workingProblem?.status === "PENDING_APPROVAL" ||
        workingProblem?.status === "PUBLISHED"
      ) {
        return;
      }

      const currentSeq = ++autoSaveReqSeq.current;
      autoSaving.current = true;
      setIsSavingDraft(true);

      try {
        let saved: ProblemResponse;
        if (workingProblem?.id) {
          const patchBody = buildProblemPatchBody(
            values,
            baselineProblemRef.current,
            submittedTags,
          );

          if (Object.keys(patchBody).length === 0) {
            return;
          }

          const payloadString = JSON.stringify(patchBody);
          if (payloadString === lastSavedPayloadRef.current) {
            return;
          }

          const write = (v: number) =>
            updateProblemDraft({
              id: workingProblem.id!,
              version: v,
              body: patchBody,
            }).unwrap();

          try {
            saved = await write(versionForWrite(workingProblem.id));
          } catch (error) {
            if (statusOf(error) !== 412) throw error;
            const fresh = await refetchProblem(workingProblem.id).unwrap();
            const diffs = getContentDifferences(
              fresh,
              baselineProblemRef.current,
              values,
              submittedTags,
            );
            if (diffs.length === 0) {
              baselineProblemRef.current = fresh;
              preparedDraftRef.current = fresh;
              setPreparedDraft(fresh);
              saved = await write(fresh.version ?? 0);
            } else {
              baselineProblemRef.current = fresh;
              preparedDraftRef.current = fresh;
              setConflictData({ fresh, diffs });
              return;
            }
          }
          lastSavedPayloadRef.current = payloadString;
        } else {
          const createBody = buildProblemCreateBody(values, submittedTags);
          const payloadString = JSON.stringify(createBody);
          if (payloadString === lastSavedPayloadRef.current) {
            return;
          }
          saved = await createProblemDraft(createBody).unwrap();
          lastSavedPayloadRef.current = payloadString;
        }

        if (currentSeq !== autoSaveReqSeq.current) return;
        baselineProblemRef.current = saved;
        preparedDraftRef.current = saved;
        setPreparedDraft(saved);
        setDraftSavedAt(saved.updatedAt ?? new Date().toISOString());
      } catch {
        /* Background saves are silent to not interrupt typing */
      } finally {
        if (currentSeq === autoSaveReqSeq.current) {
          autoSaving.current = false;
          setIsSavingDraft(false);
        }
      }
    }, 1500);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [
    title,
    description,
    categoryId,
    problemType,
    severity,
    sdlcPhase,
    expectedBehavior,
    actualBehavior,
    errorMessage,
    attemptsTried,
    technologies,
    reproductionSteps,
    tags,
    tagDraft,
    isDirty,
    isPublishedEdit,
    conflictData,
    session?.user,
    createProblemDraft,
    updateProblemDraft,
    versionForWrite,
    resyncAfterConflict,
    getValues,
    problem,
    refetchProblem,
  ]);

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      className="w-full"
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ProblemBanners
            isEdit={isEdit}
            preparedDraft={preparedDraft}
            latestDraft={latestDraft}
            dismissedDraftBanner={dismissedDraftBanner}
            onDismissDraftBanner={() => setDismissedDraftBanner(true)}
            onLoadDraft={loadDraftIntoForm}
            conflictData={conflictData}
            onForceOverwrite={handleForceOverwrite}
            onDiscardAndReload={handleDiscardAndReload}
            onClearConflict={() => setConflictData(null)}
          />

          <ProblemDetailsSection
            control={control}
            register={register}
            errors={errors}
            submitting={submitting}
            title={title}
            description={description}
            errorMessage={errorMessage}
            problemId={problem?.id}
            onInsertTemplate={handleInsertTemplate}
          />

          <ProblemTechnologiesSection
            technologyFields={technologyFields}
            register={register}
            errors={errors}
            submitting={submitting}
            onAppendTechnology={appendTechnology}
            onRemoveTechnology={removeTechnology}
          />

          <ProblemDiagnosisSection
            register={register}
            errors={errors}
            submitting={submitting}
            isBug={isBug}
            expectedBehavior={expectedBehavior}
            actualBehavior={actualBehavior}
            errorMessage={errorMessage}
            attemptsTried={attemptsTried}
            reproductionSteps={reproductionSteps}
            onSetSteps={setSteps}
            environmentFields={environmentFields}
            onAppendEnvironment={appendEnvironment}
            onRemoveEnvironment={removeEnvironment}
          />

          <ProblemAttachmentsSection
            existingAttachments={(activeProblem ?? preparedDraft)?.attachments}
            onRemoveExistingAttachment={handleRemoveAttachment}
            attachedFiles={attachedFiles}
            onAddFiles={(files) =>
              setAttachedFiles((current) => [...current, ...files])
            }
            onRemoveFile={(fileId) =>
              setAttachedFiles((current) =>
                current.filter((file) => file.id !== fileId),
              )
            }
            submitting={submitting}
            uploading={uploading}
            mutationLoading={mutationLoading}
          />
        </div>

        <aside
          className="flex flex-col gap-5 lg:sticky"
          style={{ top: stickyTop } as React.CSSProperties}
        >
          <ProblemContextSidebar
            control={control}
            errors={errors}
            submitting={submitting}
            loadingCategories={loadingCategories}
            categoriesFailed={categoriesFailed}
            categoryItems={categoryItems}
            categorySelectItems={categorySelectItems}
            problemType={problemType}
          />

          <ProblemTagsSidebar
            tags={tags}
            tagDraft={tagDraft}
            tagDraftError={tagDraftError}
            serverError={errors.newTagNames?.message}
            submitting={submitting}
            onTagDraftChange={(value) => {
              setTagDraft(value);
              setTagDraftError(null);
            }}
            onAddTag={addTag}
            onRemoveTag={removeTag}
          />

          <ProblemSubmitCard
            isPublishedEdit={isPublishedEdit}
            isDraftProblem={isDraftProblem}
            submitting={submitting}
            isSavingDraft={isSavingDraft}
            draftSavedAt={draftSavedAt}
            hasPreparedDraft={Boolean(preparedDraft)}
            formReady={formReady}
            titleReady={titleReady}
            descriptionReady={descriptionReady}
            hasCategory={Boolean(categoryId)}
            hasProblemType={Boolean(problemType)}
            hasTechnologies={technologies.length > 0}
            technologiesReady={technologiesReady}
            hasTagsOrPending={tags.length > 0 || pendingTagLength > 0}
            tagsReady={tagsReady}
            isBug={isBug}
            hasDiagnosisExpectedActual={Boolean(
              expectedBehavior.trim() && actualBehavior.trim(),
            )}
            hasReproductionSteps={reproductionSteps.some((step) => step.trim())}
            hasErrorMessage={Boolean(errorMessage.trim())}
            hasSeverity={Boolean(severity)}
            hasSdlcPhase={Boolean(sdlcPhase)}
            submitError={submitError}
            onSaveDraft={handleSaveDraft}
            onCancel={() => router.push(cancelHref)}
          />
        </aside>
      </div>
    </form>
  );
}
