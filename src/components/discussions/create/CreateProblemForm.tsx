"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  type FieldPath,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  CheckCircle2,
  Circle,
  FileText,
  LoaderCircle,
  Plus,
  Save,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type * as z from "zod";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownEditor } from "@/components/reports/MarkdownEditor";
import { parseApiError } from "@/lib/api/errors";
import { ProblemDuplicatePanel } from "@/components/discussions/create/ProblemDuplicatePanel";
import { useGetActiveCategoriesQuery } from "@/lib/redux/services/categoriesApi";
import { authClient } from "@/lib/auth/auth-client";
import {
  useCreateProblemDraftMutation,
  useCreateProblemMutation,
  useSubmitProblemMutation,
  useUploadProblemAttachmentMutation,
  useDeleteProblemAttachmentMutation,
  useUpdateProblemMutation,
  useGetMyProblemsQuery,
  type ProblemResponse,
} from "@/lib/redux/services/problemsApi";
import {
  createProblemFormSchema,
  PROBLEM_SEVERITIES,
  PROBLEM_TYPE_DESCRIPTIONS,
  PROBLEM_TYPE_LABELS,
  PROBLEM_TYPES,
  SDLC_LABELS,
  SDLC_PHASES,
  SEVERITY_LABELS,
  type ProblemType,
} from "@/lib/validations/problem";
import { cn } from "@/lib/utils";
import { ExistingAttachments } from "@/components/discussions/create/ExistingAttachments";
import {
  FileUploadDropzone,
  type AttachedFile,
} from "@/components/reports/FileUploadDropzone";
import { ContentScanStatus } from "@/components/security/ContentScanStatus";
import {
  apiErrorMessage,
  contentScanErrorMessage,
} from "@/lib/api/error-message";

type ProblemFormInput = z.input<typeof createProblemFormSchema>;
type ProblemFormValues = z.output<typeof createProblemFormSchema>;

const MAX_TECHNOLOGIES = 20;
const MAX_ENVIRONMENTS = 20;
const MAX_REPRODUCTION_STEPS = 20;
const MAX_TAGS = 10;

const SDLC_ITEMS = SDLC_PHASES.map((value) => ({
  value,
  label: SDLC_LABELS[value],
}));

const SDLC_SELECT_ITEMS = [
  { value: null, label: "Not specified" },
  ...SDLC_ITEMS,
];

const PROBLEM_TYPE_ITEMS = PROBLEM_TYPES.map((value) => ({
  value,
  label: PROBLEM_TYPE_LABELS[value],
}));

const SEVERITY_ITEMS = PROBLEM_SEVERITIES.map((value) => ({
  value,
  label: SEVERITY_LABELS[value],
}));

const SEVERITY_SELECT_ITEMS = [
  { value: null, label: "Not specified" },
  ...SEVERITY_ITEMS,
];

const CARD_CLASS =
  "rounded-2xl border border-border bg-card shadow-xs transition-colors";

const CONTROL_CLASS =
  "h-12 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary text-base transition-colors shadow-2xs";

const SERVER_FIELDS = new Set([
  "categoryId",
  "title",
  "problemType",
  "sdlcPhase",
  "description",
  "severity",
  "expectedBehavior",
  "actualBehavior",
  "reproductionSteps",
  "environment",
  "attemptsTried",
  "errorMessage",
  "repositoryUrl",
  "technologies",
  "newTagNames",
]);

function serverFieldPath(field: string): FieldPath<ProblemFormInput> | null {
  const normalized = field.replace(/\[(\d+)\]/g, ".$1");

  if (SERVER_FIELDS.has(normalized)) {
    return normalized as FieldPath<ProblemFormInput>;
  }
  if (/^technologies\.\d+\.(name|version)$/.test(normalized)) {
    return normalized as FieldPath<ProblemFormInput>;
  }
  if (/^environment\.\d+\.(technology|version)$/.test(normalized)) {
    return normalized as FieldPath<ProblemFormInput>;
  }
  if (/^reproductionSteps\.\d+$/.test(normalized)) {
    return normalized as FieldPath<ProblemFormInput>;
  }
  if (/^newTagNames\.\d+$/.test(normalized)) {
    return "newTagNames";
  }

  return null;
}

interface CreateProblemFormProps {
  /**
   * An existing problem to revise. Its presence is what puts the form in edit
   * mode: same fields and same rules, a different verb.
   */
  problem?: ProblemResponse;
  successHref?: string;
  cancelHref?: string;
  stickyTop?: string;
}

export function CreateProblemForm({
  problem,
  successHref = "/dashboard/my-community",
  cancelHref = "/community/create",
  stickyTop = "1.5rem",
}: CreateProblemFormProps) {
  const router = useRouter();
  const isEdit = Boolean(problem);
  const [deleteAttachment] = useDeleteProblemAttachmentMutation();

  /**
   * Removing a stored file. It leaves the problem immediately — the editor
   * says so before asking — and the refreshed problem arrives through the
   * invalidated tag, which is what takes the row off the list.
   */
  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!problem?.id) return;
    try {
      await deleteAttachment({ problemId: problem.id, attachmentId }).unwrap();
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

  // Fetch caller's problems (including drafts) when creating a problem
  const { data: myProblemsData } = useGetMyProblemsQuery(
    { size: 30 },
    { skip: isEdit || !session?.user },
  );

  const existingDrafts = useMemo(() => {
    return (myProblemsData?.content ?? []).filter((p) => p.status === "DRAFT");
  }, [myProblemsData]);

  // The latest draft available to resume
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
  const [uploadProblemAttachment, { isLoading: uploading }] =
    useUploadProblemAttachmentMutation();
  const [submitProblem, { isLoading: submittingDraft }] =
    useSubmitProblemMutation();
  const mutationLoading =
    creating || creatingDraft || saving || uploading || submittingDraft || isSavingDraft;

  const categoryItems = useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categories],
  );
  /* A category is required upstream, so the list offers no "none" — only the
     placeholder the trigger falls back to while nothing is chosen. */
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
    /* In edit mode the existing problem seeds the fields. Rows are copied
       rather than referenced so editing one does not mutate the cached
       response behind it. */
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
      /* Existing tags come back as objects with ids; the form edits names, and
         resending them as `newTagNames` is how the backend re-links them. */
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

  /* `reproductionSteps` is an array of bare strings, which `useFieldArray`
     cannot key on. It is driven through `setValue` instead. */
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
    setPreparedDraft(draft);
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

  useEffect(() => {
    if (typeof window === "undefined" || preparedDraft || !myProblemsData?.content) return;
    const params = new URLSearchParams(window.location.search);
    const draftId = params.get("draftId");
    if (draftId) {
      const match = myProblemsData.content.find((p) => p.id === draftId);
      if (match) {
        const timer = setTimeout(() => {
          loadDraftIntoForm(match);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [preparedDraft, myProblemsData]);

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
  /* The backend requires a category and a type as well as a title and a body.
     BUG problems also require expectedBehavior, actualBehavior, and at least one reproduction step. */
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

  const onSubmit = async (values: ProblemFormValues) => {
    setSubmitError(null);

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

    /* Blank rows and empty optional text are dropped rather than sent: the
       backend treats "" as a value, and an empty string fails its URL and
       length rules where an absent field passes. */
    const trimmedOrUndefined = (value?: string) => value?.trim() || undefined;

    const environment = (values.environment ?? [])
      .filter((entry) => entry.technology.trim())
      .map((entry) => ({
        technology: entry.technology.trim(),
        version: entry.version?.trim() || undefined,
      }));
    const steps = (values.reproductionSteps ?? [])
      .map((step) => step.trim())
      .filter(Boolean);

    /* On an edit, emptied collections are sent as `[]` rather than dropped:
       PATCH reads an absent field as "leave it alone", so omitting a list the
       author just cleared would silently restore the old rows. */
    const workingProblem = preparedDraft ?? problem;
    const updatingExisting = Boolean(workingProblem?.id);
    const listOrUndefined = <T,>(list: T[]) =>
      updatingExisting ? list : list.length ? list : undefined;

    const body = {
      ...values,
      technologies: listOrUndefined(
        (values.technologies ?? []).map((technology) => ({
          name: technology.name.trim(),
          version: technology.version?.trim() || undefined,
        })),
      ),
      environment: listOrUndefined(environment),
      reproductionSteps: listOrUndefined(steps),
      expectedBehavior: trimmedOrUndefined(values.expectedBehavior),
      actualBehavior: trimmedOrUndefined(values.actualBehavior),
      attemptsTried: trimmedOrUndefined(values.attemptsTried),
      errorMessage: trimmedOrUndefined(values.errorMessage),
      repositoryUrl: trimmedOrUndefined(values.repositoryUrl),
      newTagNames: listOrUndefined(submittedTags.map((tag) => tag.trim())),
    };

    try {
      if (workingProblem?.id) {
        let saved = await updateProblem({
          id: workingProblem.id,
          version: workingProblem.version ?? 0,
          body,
        }).unwrap();

        setPreparedDraft(saved);
        for (const attached of attachedFiles) {
          try {
            saved = await uploadProblemAttachment({
              problemId: saved.id!,
              file: attached.file,
            }).unwrap();
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

        if (!problem) {
          saved = await submitProblem(saved.id!).unwrap();
        }

        setPreparedDraft(null);
        toast.success(problem ? "Problem updated." : "Problem submitted for review.");
        router.push(successHref);
        return;
      }

      if (attachedFiles.length) {
        let draftProblem = await createProblemDraft(body).unwrap();
        setPreparedDraft(draftProblem);

        for (const attached of attachedFiles) {
          try {
            draftProblem = await uploadProblemAttachment({
              problemId: draftProblem.id!,
              file: attached.file,
            }).unwrap();
            setPreparedDraft(draftProblem);
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
        setPreparedDraft(null);
        toast.success(
          submitted.status === "PENDING_APPROVAL"
            ? "Problem submitted. Screening content…"
            : "Problem submitted successfully.",
        );
        router.push(successHref);
        return;
      }

      const created = await createProblem(body).unwrap();

      toast.success(
        created.status === "PENDING_APPROVAL"
          ? "Problem submitted. Screening content…"
          : "Problem submitted successfully.",
      );
      router.push(successHref);
    } catch (error) {
      /* A 412 is the concurrency guard, not a validation failure: someone
         saved a newer version between this form loading and submitting. */
      const status =
        typeof error === "object" && error !== null && "status" in error
          ? (error as { status?: number }).status
          : undefined;

      if (status === 412) {
        setSubmitError(
          "This problem changed since you opened it. Reload the page to pick up the newer version, then edit again.",
        );
        return;
      }

      const parsed = parseApiError(
        error,
        isEdit
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
    }
  };

  const handleSaveDraft = async () => {
    setSubmitError(null);

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

    const trimmedOrUndefined = (val?: string) => val?.trim() || undefined;
    const environment = (values.environment ?? [])
      .filter((entry) => entry.technology.trim())
      .map((entry) => ({
        technology: entry.technology.trim(),
        version: entry.version?.trim() || undefined,
      }));
    const steps = (values.reproductionSteps ?? [])
      .map((step) => step.trim())
      .filter(Boolean);

    const workingProblem = preparedDraft ?? problem;
    const updatingExisting = Boolean(workingProblem?.id);
    const listOrUndefined = <T,>(list: T[]) =>
      updatingExisting ? list : list.length ? list : undefined;

    const body = {
      ...values,
      title: draftTitle,
      description: draftDesc,
      categoryId: values.categoryId,
      problemType: values.problemType,
      technologies: listOrUndefined(
        (values.technologies ?? []).map((technology) => ({
          name: technology.name.trim(),
          version: technology.version?.trim() || undefined,
        })),
      ),
      environment: listOrUndefined(environment),
      reproductionSteps: listOrUndefined(steps),
      expectedBehavior: trimmedOrUndefined(values.expectedBehavior),
      actualBehavior: trimmedOrUndefined(values.actualBehavior),
      attemptsTried: trimmedOrUndefined(values.attemptsTried),
      errorMessage: trimmedOrUndefined(values.errorMessage),
      repositoryUrl: trimmedOrUndefined(values.repositoryUrl),
      newTagNames: listOrUndefined(submittedTags.map((tag) => tag.trim())),
    };

    setIsSavingDraft(true);
    try {
      let saved: ProblemResponse;
      if (workingProblem?.id) {
        saved = await updateProblem({
          id: workingProblem.id,
          version: workingProblem.version ?? 0,
          body,
        }).unwrap();
      } else {
        saved = await createProblemDraft(body).unwrap();
      }

      setPreparedDraft(saved);

      for (const attached of attachedFiles) {
        try {
          saved = await uploadProblemAttachment({
            problemId: saved.id!,
            file: attached.file,
          }).unwrap();
          setPreparedDraft(saved);
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
    } catch (error) {
      const parsed = parseApiError(error, "The draft could not be saved.");
      setSubmitError(parsed.message);
      toast.error(parsed.message);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const autoSaving = useRef(false);

  useEffect(() => {
    if (isEdit || !session?.user || !isDirty) return;
    const canAutoSave =
      title.trim().length >= 10 &&
      Boolean(categoryId) &&
      Boolean(problemType) &&
      description.trim().length >= 30;

    if (!canAutoSave) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(async () => {
      if (autoSaving.current || submitting) return;
      autoSaving.current = true;
      setIsSavingDraft(true);
      try {
        const values = getValues();
        const pendingTag = tagDraft.trim().replace(/^#+/, "");
        let submittedTags = values.newTagNames ?? [];
        if (pendingTag && !submittedTags.includes(pendingTag)) {
          submittedTags = [...submittedTags, pendingTag];
        }

        const trimmedOrUndefined = (val?: string) => val?.trim() || undefined;
        const environment = (values.environment ?? [])
          .filter((entry) => entry.technology.trim())
          .map((entry) => ({
            technology: entry.technology.trim(),
            version: entry.version?.trim() || undefined,
          }));
        const steps = (values.reproductionSteps ?? [])
          .map((step) => step.trim())
          .filter(Boolean);

        const workingProblem = preparedDraft ?? problem;
        const updatingExisting = Boolean(workingProblem?.id);
        const listOrUndefined = <T,>(list: T[]) =>
          updatingExisting ? list : list.length ? list : undefined;

        const body = {
          ...values,
          title: values.title.trim(),
          description: values.description.trim(),
          categoryId: values.categoryId,
          problemType: values.problemType,
          technologies: listOrUndefined(
            (values.technologies ?? []).map((technology) => ({
              name: technology.name.trim(),
              version: technology.version?.trim() || undefined,
            })),
          ),
          environment: listOrUndefined(environment),
          reproductionSteps: listOrUndefined(steps),
          expectedBehavior: trimmedOrUndefined(values.expectedBehavior),
          actualBehavior: trimmedOrUndefined(values.actualBehavior),
          attemptsTried: trimmedOrUndefined(values.attemptsTried),
          errorMessage: trimmedOrUndefined(values.errorMessage),
          repositoryUrl: trimmedOrUndefined(values.repositoryUrl),
          newTagNames: listOrUndefined(submittedTags.map((tag) => tag.trim())),
        };

        let saved: ProblemResponse;
        if (workingProblem?.id) {
          saved = await updateProblem({
            id: workingProblem.id,
            version: workingProblem.version ?? 0,
            body,
          }).unwrap();
        } else {
          saved = await createProblemDraft(body).unwrap();
        }
        setPreparedDraft(saved);
        setDraftSavedAt(saved.updatedAt ?? new Date().toISOString());
      } catch {
        // Silently ignore background autosave failures
      } finally {
        autoSaving.current = false;
        setIsSavingDraft(false);
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
    isEdit,
    session?.user,
    preparedDraft,
    problem,
    createProblemDraft,
    updateProblem,
    getValues,
    submitting,
  ]);

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      className="w-full"
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* ── Unfinished Draft Found Alert Banner ── */}
          {!isEdit && !preparedDraft && latestDraft && !dismissedDraftBanner && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 sm:px-4 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground truncate">
                    Unpublished draft found: &ldquo;{latestDraft.title}&rdquo;
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Would you like to resume where you left off?
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  onClick={() => loadDraftIntoForm(latestDraft)}
                  className="h-8 text-xs font-medium px-3 cursor-pointer"
                >
                  Resume draft
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setDismissedDraftBanner(true)}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground px-2.5 cursor-pointer"
                >
                  Dismiss
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Active Draft Indicator Banner ── */}
          {preparedDraft && !isEdit && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>
                  Editing saved draft: <strong>{preparedDraft.title || "Untitled draft"}</strong>. Changes will update this draft.
                </span>
              </div>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Card
              className={CARD_CLASS}
              aria-labelledby="problem-details-heading"
            >
              <CardHeader className="border-b border-border/70 pb-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 font-mono text-xs">
                    01
                  </Badge>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <CardTitle>
                      <h2
                        id="problem-details-heading"
                        className="text-lg font-bold tracking-tight text-foreground"
                      >
                        Problem details
                      </h2>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                      Give the community enough context to understand, diagnose, and reproduce what is going wrong.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <FieldGroup className="space-y-6">
                  {/* ── Problem Title ── */}
                  <Field
                    data-invalid={Boolean(errors.title)}
                    data-disabled={submitting || undefined}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <FieldLabel htmlFor="problem-title" className="text-sm font-semibold text-foreground">
                        Problem title
                        <span aria-hidden="true" className="text-destructive font-bold ml-0.5">
                          *
                        </span>
                        <span className="sr-only"> (required)</span>
                      </FieldLabel>

                      <span className="text-xs text-muted-foreground font-mono tabular-nums">
                        {title.length} / 180
                      </span>
                    </div>

                    <Input
                      id="problem-title"
                      maxLength={180}
                      placeholder="e.g. OAuth callback intermittently loses PKCE state during redirect"
                      aria-invalid={Boolean(errors.title)}
                      aria-describedby={
                        errors.title
                          ? "problem-title-error"
                          : "problem-title-help"
                      }
                      required
                      disabled={submitting}
                      className={CONTROL_CLASS}
                      {...register("title")}
                    />

                    <FieldDescription id="problem-title-help">
                      Use 10–180 characters. Name the specific behavior and conditions rather than only the symptom.
                    </FieldDescription>

                    {errors.title?.message && (
                      <FieldError id="problem-title-error">
                        {errors.title.message}
                      </FieldError>
                    )}

                    {/* "Has someone already asked this?" Live & AI Duplicate Panel */}
                    <ProblemDuplicatePanel
                      title={title}
                      description={description}
                      errorMessage={errorMessage}
                      excludeId={problem?.id}
                    />
                  </Field>

                  {/* ── Problem Description ── */}
                  <Field
                    data-invalid={Boolean(errors.description)}
                    data-disabled={submitting || undefined}
                    className="pt-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <FieldLabel htmlFor="problem-description" className="text-sm font-semibold text-foreground">
                        Description
                        <span aria-hidden="true" className="text-destructive font-bold ml-0.5">
                          *
                        </span>
                        <span className="sr-only"> (required)</span>
                      </FieldLabel>

                      <span className="text-xs text-muted-foreground font-mono tabular-nums">
                        {description.length.toLocaleString()} / 20,000
                      </span>
                    </div>

                    {/* Quick Template Helper Actions */}
                    <div className="flex items-center gap-2 py-0.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">Insert template:</span>
                      <button
                        type="button"
                        onClick={() => handleInsertTemplate("expected")}
                        disabled={submitting}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer hover:underline underline-offset-2"
                      >
                        Expected vs Actual
                      </button>
                      <span aria-hidden="true" className="opacity-40">·</span>
                      <button
                        type="button"
                        onClick={() => handleInsertTemplate("steps")}
                        disabled={submitting}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer hover:underline underline-offset-2"
                      >
                        Steps to Reproduce
                      </button>
                      <span aria-hidden="true" className="opacity-40">·</span>
                      <button
                        type="button"
                        onClick={() => handleInsertTemplate("logs")}
                        disabled={submitting}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer hover:underline underline-offset-2"
                      >
                        Error / Stack Trace
                      </button>
                    </div>

                    <Controller
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <MarkdownEditor
                          id="problem-description"
                          name={field.name}
                          value={field.value ?? ""}
                          onChange={(value) => field.onChange(value ?? "")}
                          onBlur={field.onBlur}
                          inputRef={field.ref}
                          placeholder="Explain what you expected, what happened instead, and the smallest set of steps that reproduces it."
                          height={380}
                          maxLength={20_000}
                          error={Boolean(errors.description)}
                          disabled={submitting}
                          required
                          ariaDescribedBy={
                            errors.description
                              ? "problem-description-error"
                              : "problem-description-help"
                          }
                        />
                      )}
                    />

                    <FieldDescription id="problem-description-help">
                      Markdown and syntax highlighting are supported (minimum 30 characters). Include error output, environment details, and reproduction steps.
                    </FieldDescription>

                    {errors.description?.message && (
                      <FieldError id="problem-description-error">
                        {errors.description.message}
                      </FieldError>
                    )}
                  </Field>
                </FieldGroup>
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
              aria-labelledby="problem-environment-heading"
            >
              <CardHeader className="border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 font-mono">
                    02
                  </Badge>
                  <div className="flex min-w-0 flex-col gap-1">
                    <CardTitle>
                      <h2
                        id="problem-environment-heading"
                        className="text-lg font-bold"
                      >
                        Technologies
                      </h2>
                    </CardTitle>
                    <CardDescription>
                      The stack this problem is about. Optional, and how people
                      filtering by technology will find it.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <FieldSet>
                  <FieldLegend className="sr-only">
                    Technologies
                  </FieldLegend>

                  {technologyFields.length === 0 ? (
                    <FieldDescription>
                      No technologies added. Add one when a runtime, framework,
                      database, or version helps reproduce the issue.
                    </FieldDescription>
                  ) : (
                    <FieldGroup className="gap-4">
                      <AnimatePresence initial={false}>
                        {technologyFields.map((technology, index) => (
                          <motion.div
                            key={technology.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.65fr)_auto]"
                          >
                            <Field
                              data-invalid={Boolean(
                                errors.technologies?.[index]?.name,
                              )}
                              data-disabled={submitting || undefined}
                            >
                              <FieldLabel
                                htmlFor={`problem-technology-${index}`}
                              >
                                Technology
                                <span
                                  aria-hidden="true"
                                  className="text-destructive"
                                >
                                  *
                                </span>
                                <span className="sr-only"> (required)</span>
                              </FieldLabel>
                              <Input
                                id={`problem-technology-${index}`}
                                maxLength={100}
                                placeholder="e.g. Next.js"
                                aria-invalid={Boolean(
                                  errors.technologies?.[index]?.name,
                                )}
                                aria-describedby={
                                  errors.technologies?.[index]?.name
                                    ? `problem-technology-${index}-error`
                                    : undefined
                                }
                                required
                                disabled={submitting}
                                className={CONTROL_CLASS}
                                {...register(`technologies.${index}.name`)}
                              />
                              <FieldError
                                id={`problem-technology-${index}-error`}
                              >
                                {errors.technologies?.[index]?.name?.message}
                              </FieldError>
                            </Field>

                            <Field
                              data-invalid={Boolean(
                                errors.technologies?.[index]?.version,
                              )}
                              data-disabled={submitting || undefined}
                            >
                              <FieldLabel
                                htmlFor={`problem-version-${index}`}
                              >
                                Version
                              </FieldLabel>
                              <Input
                                id={`problem-version-${index}`}
                                maxLength={50}
                                placeholder="e.g. 16.2.10"
                                aria-invalid={Boolean(
                                  errors.technologies?.[index]?.version,
                                )}
                                aria-describedby={
                                  errors.technologies?.[index]?.version
                                    ? `problem-version-${index}-error`
                                    : undefined
                                }
                                disabled={submitting}
                                className={CONTROL_CLASS}
                                {...register(`technologies.${index}.version`)}
                              />
                              <FieldError
                                id={`problem-version-${index}-error`}
                              >
                                {errors.technologies?.[index]?.version?.message}
                              </FieldError>
                            </Field>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-lg"
                              aria-label={`Remove technology ${index + 1}`}
                              disabled={submitting}
                              onClick={() => removeTechnology(index)}
                              className="justify-self-end rounded-xl sm:mt-7"
                            >
                              <Trash2 aria-hidden="true" />
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </FieldGroup>
                  )}

                  <FieldError>{errors.technologies?.message}</FieldError>
                </FieldSet>
              </CardContent>

              <CardFooter className="flex-col items-stretch gap-3 border-t border-slate-100 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
                <FieldDescription>
                  {technologyFields.length}/{MAX_TECHNOLOGIES} technologies
                </FieldDescription>
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    submitting ||
                    technologyFields.length >= MAX_TECHNOLOGIES
                  }
                  onClick={() => appendTechnology({ name: "", version: "" })}
                  className="w-full rounded-xl sm:w-auto"
                >
                  <Plus data-icon="inline-start" aria-hidden="true" />
                  Add technology
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* ── What is actually going wrong ──
              Every field here is optional. Together they are the difference
              between a question someone can answer and one they have to ask
              three follow-ups about first. */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12, ease: "easeOut" }}
          >
            <Card
              className={CARD_CLASS}
              aria-labelledby="problem-diagnosis-heading"
            >
              <CardHeader className="border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 font-mono">
                    03
                  </Badge>
                  <div className="flex min-w-0 flex-col gap-1">
                    <CardTitle>
                      <h2
                        id="problem-diagnosis-heading"
                        className="text-lg font-bold"
                      >
                        Diagnosis
                      </h2>
                    </CardTitle>
                    <CardDescription>
                      {isBug
                        ? "Required for Bug reports: expected behaviour, actual behaviour, and at least one reproduction step are mandatory."
                        : "Optional for general questions, but recommended: problems with clear steps and context get answered far sooner."}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <FieldGroup>
                  {/* ── Expected against actual ── */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      data-invalid={Boolean(errors.expectedBehavior)}
                      data-disabled={submitting || undefined}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <FieldLabel htmlFor="problem-expected">
                          Expected behaviour
                          {isBug && (
                            <span aria-hidden="true" className="text-destructive font-bold ml-0.5">
                              *
                            </span>
                          )}
                        </FieldLabel>
                        <Badge variant="secondary" className="tabular-nums">
                          {expectedBehavior.length}/5,000
                        </Badge>
                      </div>
                      <Textarea
                        id="problem-expected"
                        maxLength={5_000}
                        rows={4}
                        placeholder="What should have happened."
                        aria-invalid={Boolean(errors.expectedBehavior)}
                        disabled={submitting}
                        className="rounded-xl border-slate-300 bg-white text-base dark:border-neutral-700 dark:bg-neutral-900"
                        {...register("expectedBehavior")}
                      />
                      <FieldError>{errors.expectedBehavior?.message}</FieldError>
                    </Field>

                    <Field
                      data-invalid={Boolean(errors.actualBehavior)}
                      data-disabled={submitting || undefined}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <FieldLabel htmlFor="problem-actual">
                          Actual behaviour
                          {isBug && (
                            <span aria-hidden="true" className="text-destructive font-bold ml-0.5">
                              *
                            </span>
                          )}
                        </FieldLabel>
                        <Badge variant="secondary" className="tabular-nums">
                          {actualBehavior.length}/5,000
                        </Badge>
                      </div>
                      <Textarea
                        id="problem-actual"
                        maxLength={5_000}
                        rows={4}
                        placeholder="What happens instead."
                        aria-invalid={Boolean(errors.actualBehavior)}
                        disabled={submitting}
                        className="rounded-xl border-slate-300 bg-white text-base dark:border-neutral-700 dark:bg-neutral-900"
                        {...register("actualBehavior")}
                      />
                      <FieldError>{errors.actualBehavior?.message}</FieldError>
                    </Field>
                  </div>

                  {/* ── Steps to reproduce ── */}
                  <FieldSet>
                    <div className="flex items-center justify-between gap-3">
                      <FieldLegend className="text-base">
                        Steps to reproduce
                        {isBug && (
                          <span aria-hidden="true" className="text-destructive font-bold ml-0.5">
                            *
                          </span>
                        )}
                      </FieldLegend>
                      <Badge variant="secondary" className="tabular-nums">
                        {reproductionSteps.length}/{MAX_REPRODUCTION_STEPS}
                      </Badge>
                    </div>

                    {reproductionSteps.length === 0 ? (
                      <FieldDescription>
                        No steps yet. The smallest sequence that triggers it is
                        the most useful thing on this page.
                      </FieldDescription>
                    ) : (
                      <FieldGroup className="gap-3">
                        <AnimatePresence initial={false}>
                          {reproductionSteps.map((step, index) => (
                            <motion.div
                              key={index}
                              layout
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center gap-2"
                            >
                              <span
                                aria-hidden="true"
                                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold tabular-nums text-slate-600 dark:bg-neutral-800 dark:text-neutral-300"
                              >
                                {index + 1}
                              </span>
                              <Input
                                aria-label={`Step ${index + 1}`}
                                maxLength={1_000}
                                value={step}
                                placeholder="e.g. Sign in, then refresh the callback page"
                                disabled={submitting}
                                className={cn(CONTROL_CLASS, "flex-1")}
                                onChange={(event) => {
                                  const next = [...reproductionSteps];
                                  next[index] = event.target.value;
                                  setSteps(next);
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-lg"
                                aria-label={`Remove step ${index + 1}`}
                                disabled={submitting}
                                onClick={() =>
                                  setSteps(
                                    reproductionSteps.filter(
                                      (_, i) => i !== index,
                                    ),
                                  )
                                }
                                className="shrink-0 rounded-xl"
                              >
                                <Trash2 aria-hidden="true" />
                              </Button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </FieldGroup>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        submitting ||
                        reproductionSteps.length >= MAX_REPRODUCTION_STEPS
                      }
                      onClick={() => setSteps([...reproductionSteps, ""])}
                      className="w-full rounded-xl sm:w-auto sm:self-start"
                    >
                      <Plus data-icon="inline-start" aria-hidden="true" />
                      Add step
                    </Button>
                    <FieldError>{errors.reproductionSteps?.message}</FieldError>
                  </FieldSet>

                  {/* ── The error itself ── */}
                  <Field
                    data-invalid={Boolean(errors.errorMessage)}
                    data-disabled={submitting || undefined}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <FieldLabel htmlFor="problem-error">
                        Error output
                      </FieldLabel>
                      <Badge variant="secondary" className="tabular-nums">
                        {errorMessage.length.toLocaleString()}/10,000
                      </Badge>
                    </div>
                    <Textarea
                      id="problem-error"
                      maxLength={10_000}
                      rows={6}
                      spellCheck={false}
                      placeholder="Paste the stack trace or console output, unedited."
                      aria-invalid={Boolean(errors.errorMessage)}
                      disabled={submitting}
                      className="rounded-xl border-slate-300 bg-white font-mono text-sm dark:border-neutral-700 dark:bg-neutral-900"
                      {...register("errorMessage")}
                    />
                    <FieldDescription>
                      Paste it whole. The line you think is irrelevant is often
                      the one that matters.
                    </FieldDescription>
                    <FieldError>{errors.errorMessage?.message}</FieldError>
                  </Field>

                  {/* ── What has already been ruled out ── */}
                  <Field
                    data-invalid={Boolean(errors.attemptsTried)}
                    data-disabled={submitting || undefined}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <FieldLabel htmlFor="problem-attempts">
                        What you have already tried
                      </FieldLabel>
                      <Badge variant="secondary" className="tabular-nums">
                        {attemptsTried.length.toLocaleString()}/5,000
                      </Badge>
                    </div>
                    <Textarea
                      id="problem-attempts"
                      maxLength={5_000}
                      rows={4}
                      placeholder="Saves everyone from suggesting it again."
                      aria-invalid={Boolean(errors.attemptsTried)}
                      disabled={submitting}
                      className="rounded-xl border-slate-300 bg-white text-base dark:border-neutral-700 dark:bg-neutral-900"
                      {...register("attemptsTried")}
                    />
                    <FieldError>{errors.attemptsTried?.message}</FieldError>
                  </Field>

                  {/* ── Where it happens ── */}
                  <FieldSet>
                    <div className="flex items-center justify-between gap-3">
                      <FieldLegend className="text-base">
                        Where it happens
                      </FieldLegend>
                      <Badge variant="secondary" className="tabular-nums">
                        {environmentFields.length}/{MAX_ENVIRONMENTS}
                      </Badge>
                    </div>

                    {environmentFields.length === 0 ? (
                      <FieldDescription>
                        Operating system, browser, runtime — whatever the
                        problem depends on.
                      </FieldDescription>
                    ) : (
                      <FieldGroup className="gap-3">
                        <AnimatePresence initial={false}>
                          {environmentFields.map((entry, index) => (
                            <motion.div
                              key={entry.id}
                              layout
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.2 }}
                              className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.65fr)_auto]"
                            >
                              <Field
                                data-invalid={Boolean(
                                  errors.environment?.[index]?.technology,
                                )}
                                data-disabled={submitting || undefined}
                              >
                                <FieldLabel
                                  htmlFor={`problem-environment-${index}`}
                                >
                                  Name
                                </FieldLabel>
                                <Input
                                  id={`problem-environment-${index}`}
                                  maxLength={100}
                                  placeholder="e.g. macOS"
                                  disabled={submitting}
                                  className={CONTROL_CLASS}
                                  {...register(
                                    `environment.${index}.technology`,
                                  )}
                                />
                                <FieldError>
                                  {
                                    errors.environment?.[index]?.technology
                                      ?.message
                                  }
                                </FieldError>
                              </Field>

                              <Field
                                data-invalid={Boolean(
                                  errors.environment?.[index]?.version,
                                )}
                                data-disabled={submitting || undefined}
                              >
                                <FieldLabel
                                  htmlFor={`problem-environment-version-${index}`}
                                >
                                  Version
                                </FieldLabel>
                                <Input
                                  id={`problem-environment-version-${index}`}
                                  maxLength={50}
                                  placeholder="e.g. 15.2"
                                  disabled={submitting}
                                  className={CONTROL_CLASS}
                                  {...register(`environment.${index}.version`)}
                                />
                                <FieldError>
                                  {errors.environment?.[index]?.version?.message}
                                </FieldError>
                              </Field>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-lg"
                                aria-label={`Remove environment ${index + 1}`}
                                disabled={submitting}
                                onClick={() => removeEnvironment(index)}
                                className="justify-self-end rounded-xl sm:mt-7"
                              >
                                <Trash2 aria-hidden="true" />
                              </Button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </FieldGroup>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        submitting ||
                        environmentFields.length >= MAX_ENVIRONMENTS
                      }
                      onClick={() =>
                        appendEnvironment({ technology: "", version: "" })
                      }
                      className="w-full rounded-xl sm:w-auto sm:self-start"
                    >
                      <Plus data-icon="inline-start" aria-hidden="true" />
                      Add environment
                    </Button>
                  </FieldSet>

                  {/* ── Somewhere to look ── */}
                  <Field
                    data-invalid={Boolean(errors.repositoryUrl)}
                    data-disabled={submitting || undefined}
                  >
                    <FieldLabel htmlFor="problem-repository">
                      Repository URL
                    </FieldLabel>
                    <Input
                      id="problem-repository"
                      maxLength={1_000}
                      inputMode="url"
                      placeholder="https://github.com/…"
                      aria-invalid={Boolean(errors.repositoryUrl)}
                      aria-describedby={
                        errors.repositoryUrl
                          ? "problem-repository-error"
                          : "problem-repository-help"
                      }
                      disabled={submitting}
                      className={CONTROL_CLASS}
                      {...register("repositoryUrl")}
                    />
                    <FieldDescription id="problem-repository-help">
                      A public repository that reproduces it, if you have one.
                      Must start with https://.
                    </FieldDescription>
                    <FieldError id="problem-repository-error">
                      {errors.repositoryUrl?.message}
                    </FieldError>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.18, ease: "easeOut" }}
          >
            <Card className={CARD_CLASS} aria-labelledby="problem-attachments-heading">
              <CardHeader className="border-b border-slate-100 dark:border-neutral-800">
                <CardTitle>
                  <h2 id="problem-attachments-heading" className="text-lg font-bold">
                    Logs and evidence
                  </h2>
                </CardTitle>
                <CardDescription>
                  Optional files are checked against known threats before they
                  are stored. Anything new to our scanner finishes checking
                  shortly after upload.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {/* What is already stored. The dropzone below can only hold
                    files picked in this session, so without this an author
                    editing a problem saw none of their own evidence. */}
                {problem?.attachments?.length ? (
                  <ExistingAttachments
                    attachments={problem.attachments}
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
                  maxFiles={Math.max(0, 10 - (problem?.attachments?.length ?? 0))}
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

        <aside
          className="flex flex-col gap-5 lg:sticky"
          style={{ top: stickyTop } as React.CSSProperties}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.04, ease: "easeOut" }}
          >
            <Card
              className={CARD_CLASS}
              aria-labelledby="problem-context-heading"
            >
              <CardHeader className="border-b border-slate-100 dark:border-neutral-800">
                <CardTitle>
                  <h2
                    id="problem-context-heading"
                    className="text-lg font-bold"
                  >
                    Context
                  </h2>
                </CardTitle>
                <CardDescription>
                  Help the right people find and understand the problem.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <FieldGroup>
                  <Field
                    data-invalid={Boolean(errors.categoryId)}
                    data-disabled={
                      submitting ||
                      loadingCategories ||
                      categoryItems.length === 0 ||
                      undefined
                    }
                  >
                    <FieldLabel htmlFor="problem-category">
                      Category
                    </FieldLabel>
                    <Controller
                      control={control}
                      name="categoryId"
                      render={({ field }) => (
                        <Select
                          items={categorySelectItems}
                          name={field.name}
                          value={field.value ?? null}
                          onValueChange={(value) =>
                            field.onChange(value ?? undefined)
                          }
                          disabled={
                            submitting ||
                            loadingCategories ||
                            categoryItems.length === 0
                          }
                        >
                          <SelectTrigger
                            ref={field.ref}
                            id="problem-category"
                            onBlur={field.onBlur}
                            aria-invalid={Boolean(errors.categoryId)}
                            aria-describedby={
                              errors.categoryId
                                ? "problem-category-error"
                                : "problem-category-help"
                            }
                            className={cn(CONTROL_CLASS, "w-full")}
                          >
                            <SelectValue
                              placeholder={
                                loadingCategories
                                  ? "Loading categories…"
                                  : categoryItems.length === 0
                                    ? "No categories available"
                                    : "Choose a category"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent
                            alignItemWithTrigger={false}
                            className="rounded-xl"
                          >
                            <SelectGroup>
                              {categoryItems.map((item) => (
                                <SelectItem
                                  key={item.value}
                                  value={item.value}
                                >
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldDescription id="problem-category-help">
                      {categoriesFailed
                        ? "Categories could not be loaded. Reload the page to try again."
                        : "Required. This is how the problem is filed and found."}
                    </FieldDescription>
                    <FieldError id="problem-category-error">
                      {errors.categoryId?.message}
                    </FieldError>
                  </Field>

                  {/* Required upstream, so it is asked for rather than guessed. */}
                  <Field
                    data-invalid={Boolean(errors.problemType)}
                    data-disabled={submitting || undefined}
                  >
                    <FieldLabel htmlFor="problem-type">
                      Problem type
                      <span aria-hidden="true" className="text-destructive">
                        *
                      </span>
                      <span className="sr-only"> (required)</span>
                    </FieldLabel>
                    <Controller
                      control={control}
                      name="problemType"
                      render={({ field }) => (
                        <Select
                          items={PROBLEM_TYPE_ITEMS}
                          name={field.name}
                          value={field.value ?? null}
                          onValueChange={(value) =>
                            field.onChange(value ?? undefined)
                          }
                          disabled={submitting}
                        >
                          <SelectTrigger
                            ref={field.ref}
                            id="problem-type"
                            onBlur={field.onBlur}
                            aria-invalid={Boolean(errors.problemType)}
                            aria-describedby={
                              errors.problemType
                                ? "problem-type-error"
                                : "problem-type-help"
                            }
                            className={cn(CONTROL_CLASS, "w-full")}
                          >
                            <SelectValue placeholder="Choose a type" />
                          </SelectTrigger>
                          <SelectContent
                            alignItemWithTrigger={false}
                            className="rounded-xl"
                          >
                            <SelectGroup>
                              {PROBLEM_TYPE_ITEMS.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldDescription id="problem-type-help">
                      {problemType
                        ? PROBLEM_TYPE_DESCRIPTIONS[problemType as ProblemType]
                        : "What kind of problem this is."}
                    </FieldDescription>
                    <FieldError id="problem-type-error">
                      {errors.problemType?.message}
                    </FieldError>
                  </Field>

                  <Field
                    data-invalid={Boolean(errors.severity)}
                    data-disabled={submitting || undefined}
                  >
                    <FieldLabel htmlFor="problem-severity">Severity</FieldLabel>
                    <Controller
                      control={control}
                      name="severity"
                      render={({ field }) => (
                        <Select
                          items={SEVERITY_SELECT_ITEMS}
                          name={field.name}
                          value={field.value ?? null}
                          onValueChange={(value) =>
                            field.onChange(value ?? undefined)
                          }
                          disabled={submitting}
                        >
                          <SelectTrigger
                            ref={field.ref}
                            id="problem-severity"
                            onBlur={field.onBlur}
                            aria-invalid={Boolean(errors.severity)}
                            aria-describedby={
                              errors.severity
                                ? "problem-severity-error"
                                : "problem-severity-help"
                            }
                            className={cn(CONTROL_CLASS, "w-full")}
                          >
                            <SelectValue placeholder="Not specified" />
                          </SelectTrigger>
                          <SelectContent
                            alignItemWithTrigger={false}
                            className="rounded-xl"
                          >
                            <SelectGroup>
                              <SelectItem value={null}>
                                Not specified
                              </SelectItem>
                              {SEVERITY_ITEMS.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldDescription id="problem-severity-help">
                      Optional. How much this is costing you.
                    </FieldDescription>
                    <FieldError id="problem-severity-error">
                      {errors.severity?.message}
                    </FieldError>
                  </Field>

                  <Field
                    data-invalid={Boolean(errors.sdlcPhase)}
                    data-disabled={submitting || undefined}
                  >
                    <FieldLabel htmlFor="problem-sdlc-phase">
                      SDLC phase
                    </FieldLabel>
                    <Controller
                      control={control}
                      name="sdlcPhase"
                      render={({ field }) => (
                        <Select
                          items={SDLC_SELECT_ITEMS}
                          name={field.name}
                          value={field.value ?? null}
                          onValueChange={(value) =>
                            field.onChange(value ?? undefined)
                          }
                          disabled={submitting}
                        >
                          <SelectTrigger
                            ref={field.ref}
                            id="problem-sdlc-phase"
                            onBlur={field.onBlur}
                            aria-invalid={Boolean(errors.sdlcPhase)}
                            aria-describedby={
                              errors.sdlcPhase
                                ? "problem-sdlc-phase-error"
                                : "problem-sdlc-phase-help"
                            }
                            className={cn(CONTROL_CLASS, "w-full")}
                          >
                            <SelectValue placeholder="Choose a phase" />
                          </SelectTrigger>
                          <SelectContent
                            alignItemWithTrigger={false}
                            className="rounded-xl"
                          >
                            <SelectGroup>
                              <SelectItem value={null}>Not specified</SelectItem>
                              {SDLC_ITEMS.map((item) => (
                                <SelectItem
                                  key={item.value}
                                  value={item.value}
                                >
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldDescription id="problem-sdlc-phase-help">
                      Optional. Where in the software lifecycle the issue
                      appears.
                    </FieldDescription>
                    <FieldError id="problem-sdlc-phase-error">
                      {errors.sdlcPhase?.message}
                    </FieldError>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
          >
            <Card
              className={CARD_CLASS}
              aria-labelledby="problem-tags-heading"
            >
              <CardHeader className="border-b border-slate-100 dark:border-neutral-800">
                <CardTitle>
                  <h2
                    id="problem-tags-heading"
                    className="text-lg font-bold"
                  >
                    Tags
                  </h2>
                </CardTitle>
                <CardDescription>
                  Add focused keywords. Press Enter, comma, or Add after each
                  tag.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Field
                  data-invalid={Boolean(errors.newTagNames) || Boolean(tagDraftError)}
                  data-disabled={
                    submitting || tags.length >= MAX_TAGS || undefined
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <FieldLabel htmlFor="problem-tags">Keywords</FieldLabel>
                    <Badge variant="secondary" className="tabular-nums">
                      {tags.length}/{MAX_TAGS}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      id="problem-tags"
                      value={tagDraft}
                      maxLength={51}
                      placeholder="e.g. oauth"
                      aria-invalid={
                        Boolean(errors.newTagNames) || Boolean(tagDraftError)
                      }
                      aria-describedby={
                        errors.newTagNames || tagDraftError
                          ? "problem-tags-error"
                          : "problem-tags-help"
                      }
                      disabled={submitting || tags.length >= MAX_TAGS}
                      className={cn(CONTROL_CLASS, "flex-1")}
                      onChange={(event) => {
                        setTagDraft(event.target.value);
                        setTagDraftError(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === ",") {
                          event.preventDefault();
                          addTag();
                        }
                        if (
                          event.key === "Backspace" &&
                          !tagDraft &&
                          tags.length
                        ) {
                          removeTag(tags[tags.length - 1]);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        submitting ||
                        tags.length >= MAX_TAGS ||
                        pendingTagLength === 0
                      }
                      onClick={addTag}
                      className="h-12 w-full rounded-xl sm:w-auto"
                    >
                      <Plus data-icon="inline-start" aria-hidden="true" />
                      Add
                    </Button>
                  </div>
                  <FieldDescription id="problem-tags-help">
                    The leading # is optional and is removed before submission.
                  </FieldDescription>
                  <FieldError id="problem-tags-error">
                    {tagDraftError ?? errors.newTagNames?.message}
                  </FieldError>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence initial={false}>
                        {tags.map((tag) => (
                          <motion.div
                            key={tag}
                            layout
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Badge
                              variant="tag"
                              className="min-h-8 cursor-pointer px-3 hover:bg-tag/80"
                              render={
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  aria-label={`Remove ${tag} tag`}
                                  disabled={submitting}
                                />
                              }
                            >
                              {tag}
                              <X aria-hidden="true" />
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </Field>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.16, ease: "easeOut" }}
          >
            <Card
              className={CARD_CLASS}
              aria-labelledby="submit-problem-heading"
            >
              <CardHeader className="border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>
                    <h2
                      id="submit-problem-heading"
                      className="text-lg font-bold"
                    >
                      {isEdit ? "Save changes" : "Submit problem"}
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
                <CardDescription>
                  Your post may be held for review before it appears publicly.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                <RequirementRow label="A clear title" met={titleReady} />
                <RequirementRow
                  label="A useful description"
                  met={descriptionReady}
                />
                <RequirementRow
                  label="Category selected"
                  met={Boolean(categoryId)}
                />
                <RequirementRow
                  label="Problem type selected"
                  met={Boolean(problemType)}
                />
                {technologies.length > 0 && (
                  <RequirementRow
                    label="Technology details complete"
                    met={technologiesReady}
                  />
                )}
                {(tags.length > 0 || pendingTagLength > 0) && (
                  <RequirementRow label="Tag limits satisfied" met={tagsReady} />
                )}
                <RequirementRow
                  label="Expected vs actual"
                  met={Boolean(
                    expectedBehavior.trim() && actualBehavior.trim(),
                  )}
                  optional={!isBug}
                />
                <RequirementRow
                  label="Steps to reproduce"
                  met={reproductionSteps.some((step) => step.trim())}
                  optional={!isBug}
                />
                <RequirementRow
                  label="Error output"
                  met={Boolean(errorMessage.trim())}
                  optional
                />
                <RequirementRow
                  label="Severity set"
                  met={Boolean(severity)}
                  optional
                />
                <RequirementRow
                  label="SDLC phase selected"
                  met={Boolean(sdlcPhase)}
                  optional
                />

                {submitError && (
                  <FieldError className="pt-1">{submitError}</FieldError>
                )}
              </CardContent>

              <CardFooter className="flex-col gap-2 border-t border-border/70 pt-4">
                {!isEdit && (
                  <div className="w-full flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/70">
                    <span>Autosave</span>
                    <span className="font-medium">
                      {isSavingDraft ? (
                        <span className="flex items-center gap-1.5 text-primary">
                          <LoaderCircle className="size-3 animate-spin" /> Saving draft…
                        </span>
                      ) : draftSavedAt ? (
                        <span>
                          Saved at {new Date(draftSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      ) : preparedDraft ? (
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
                    className="h-12 w-full rounded-xl text-base font-semibold"
                  >
                    {submitting ? (
                      <>
                        <LoaderCircle
                          data-icon="inline-start"
                          aria-hidden="true"
                          className="animate-spin motion-reduce:animate-none"
                        />
                        {isEdit ? "Saving…" : "Submitting…"}
                      </>
                    ) : (
                      <>
                        <Send data-icon="inline-start" aria-hidden="true" />
                        {isEdit ? "Save changes" : "Submit problem"}
                      </>
                    )}
                  </Button>
                </motion.div>

                {!isEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={submitting || isSavingDraft}
                    onClick={handleSaveDraft}
                    className="h-11 w-full rounded-xl font-medium border-border/80 hover:bg-muted"
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
                  disabled={submitting || isSavingDraft}
                  onClick={() => router.push(cancelHref)}
                  className="h-10 w-full rounded-xl text-muted-foreground hover:text-foreground"
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
