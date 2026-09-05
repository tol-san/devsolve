"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { AlertCircle, Check, FileText, Loader2, Save, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "@/components/reports/MarkdownEditor";
import { ImageDropField } from "./ImageDropField";
import { TechStackField } from "./TechStackField";
import { BuildStepsField, createEmptyStep } from "./BuildStepsField";
import { ProjectLinksField } from "./ProjectLinksField";
import { ResourceLinksField } from "./ResourceLinksField";
import { useGetActiveCategoriesQuery } from "@/lib/redux/services/categoriesApi";
import {
  useCreateShowcaseMutation,
  useCreateShowcaseStepMutation,
  useDeleteShowcaseStepMutation,
  useGetShowcaseByIdQuery,
  useGetShowcaseStepsQuery,
  useUpdateShowcaseMutation,
  useUpdateShowcaseStepMutation,
  useUploadShowcaseCoverMutation,
  useUploadShowcaseStepDiagramMutation,
  useUploadShowcaseStepImageMutation,
  type ShowcaseResponse,
  type ShowcaseStepResponse,
} from "@/lib/redux/services/showcasesApi";
import {
  createShowcaseSchema,
  type CreateShowcaseFormValues,
  type CreateShowcaseSubmitValues,
} from "@/lib/validations/showcase";
import { useServerShowcaseDraft } from "@/components/showcases/hooks/useServerShowcaseDraft";
import {
  useGetShowcaseDraftQuery,
  useUploadShowcaseDraftCoverImageMutation,
  useRemoveShowcaseDraftCoverImageMutation,
} from "@/lib/redux/services/showcaseDraftsApi";
import type { SaveShowcaseDraftValues } from "@/lib/validations/showcase-draft";
import { cn } from "@/lib/utils";

function messageOf(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "string" && data) return data;
    if (typeof data === "object" && data !== null && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message) return message;
    }
  }
  return fallback;
}

const CARD =
  "rounded-2xl bg-card text-card-foreground border border-border shadow-xs transition-shadow";

const CARD_ACTIVE =
  "focus-within:border-ring";

interface FormSectionProps {
  n: string;
  title: string;
  description?: string;
  done?: boolean;
  optional?: boolean;
  delay?: number;
  children: React.ReactNode;
}

function FormSection({
  n,
  title,
  description,
  done = false,
  optional = false,
  delay = 0,
  children,
}: FormSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(CARD, CARD_ACTIVE, "p-5 sm:p-6")}
    >
      <header className="mb-5 flex items-start gap-3.5 border-b border-border pb-4">
        <span
          aria-hidden
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold tabular-nums transition-colors duration-300",
            done
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {done ? <Check className="size-4.5" /> : n}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              {title}
            </h2>
            {optional && (
              <span className="rounded-full border border-border px-2 py-0.5 text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Optional
              </span>
            )}
          </div>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </header>

      {children}
    </motion.section>
  );
}

type Requirement = { label: string; done: boolean; hint?: string };

function RequirementRow({ label, done, hint }: Requirement) {
  return (
    <li className="flex items-start gap-2.5">
      <motion.span
        aria-hidden
        animate={{ scale: done ? [1, 1.18, 1] : 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "mt-px flex size-5 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
          done
            ? "bg-primary text-primary-foreground"
            : "border-2 border-dashed border-border",
        )}
      >
        {done && <Check className="size-3" strokeWidth={3.5} />}
      </motion.span>

      <span className="min-w-0">
        <span
          className={cn(
            "block text-sm font-semibold transition-colors",
            done
              ? "text-muted-foreground line-through decoration-border"
              : "text-foreground",
          )}
        >
          {label}
        </span>
        {hint && (
          <span className="block text-sm text-muted-foreground">
            {hint}
          </span>
        )}
      </span>
    </li>
  );
}

type StepProgress = { id: string; imageDone: boolean; diagramDone: boolean };

function toFormValues(
  showcase: ShowcaseResponse,
  steps: ShowcaseStepResponse[],
): CreateShowcaseFormValues {
  const ordered = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);

  return {
    coverImageUrl: showcase.coverImageUrl ?? "",
    coverImageFile: undefined,
    title: showcase.title,
    categoryId: showcase.categoryId ?? "",
    overview: showcase.overview,
    techStack: [],
    resourceLinks: [],
    steps: ordered.length
      ? ordered.map((step) => ({
          key: `step-${step.id}`,
          serverId: step.id,
          title: step.title,
          description: step.description ?? "",
          codeSnippet: step.codeSnippet ?? "",
          codeLanguage: "typescript",
          imageUrl: step.imageUrl ?? "",
          diagramUrl: step.diagramUrl ?? "",
          imageFile: undefined,
          diagramFile: undefined,
        }))
      : [createEmptyStep()],
    repoUrl: showcase.repoUrl ?? "",
    liveUrl: showcase.liveUrl ?? "",
    videoUrl: showcase.videoUrl ?? "",
  };
}

interface CreateShowcaseFormProps {
  successHref?: string;
  cancelHref?: string;
  showcaseId?: string;
  stickyTop?: string;
}

export function CreateShowcaseForm({
  successHref = "/showcases",
  cancelHref = "/showcases",
  stickyTop = "1.5rem",
  showcaseId,
}: CreateShowcaseFormProps) {
  const router = useRouter();
  const isEdit = Boolean(showcaseId);

  const { data: categories = [], isLoading: loadingCategories } =
    useGetActiveCategoriesQuery("SHOWCASE");

  const categoryItems = React.useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categories],
  );
  const [createShowcase] = useCreateShowcaseMutation();
  const [updateShowcase] = useUpdateShowcaseMutation();
  const [createStep] = useCreateShowcaseStepMutation();
  const [updateStep] = useUpdateShowcaseStepMutation();
  const [deleteStep] = useDeleteShowcaseStepMutation();
  const [uploadCover] = useUploadShowcaseCoverMutation();
  const [uploadDraftCover] = useUploadShowcaseDraftCoverImageMutation();
  const [removeDraftCover] = useRemoveShowcaseDraftCoverImageMutation();
  const [uploadStepImage] = useUploadShowcaseStepImageMutation();
  const [uploadStepDiagram] = useUploadShowcaseStepDiagramMutation();

  const { data: existing, isLoading: loadingExisting } = useGetShowcaseByIdQuery(
    showcaseId ?? "",
    { skip: !showcaseId },
  );
  const { data: fetchedSteps } = useGetShowcaseStepsQuery(showcaseId ?? "", {
    skip: !showcaseId || (existing?.steps?.length ?? 0) > 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const progress = useRef<{
    showcaseId: string | null;
    coverDone: boolean;
    steps: Record<string, StepProgress>;
  }>({ showcaseId: null, coverDone: false, steps: {} });

  const methods = useForm<
    CreateShowcaseFormValues,
    unknown,
    CreateShowcaseSubmitValues
  >({
    resolver: zodResolver(createShowcaseSchema),
    mode: "onBlur",
    defaultValues: {
      coverImageUrl: "",
      title: "",
      categoryId: "",
      overview: "",
      techStack: [],
      steps: [createEmptyStep()],
      repoUrl: "",
      liveUrl: "",
      videoUrl: "",
      resourceLinks: [],
    },
  });

  const {
    register,
    control,
    setValue,
    reset,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = methods;

  const loadedStepIds = useRef<string[]>([]);
  const loaded = useRef(false);

  useEffect(() => {
    if (!isEdit || loaded.current || !existing) return;

    const steps = existing.steps?.length ? existing.steps : (fetchedSteps ?? []);
    if (!existing.steps?.length && !fetchedSteps) return;

    loaded.current = true;
    loadedStepIds.current = steps.map((step) => step.id);
    progress.current.showcaseId = existing.id;
    reset(toFormValues(existing, steps));
  }, [isEdit, existing, fetchedSteps, reset]);

  const title = useWatch({ control, name: "title" }) ?? "";
  const overview = useWatch({ control, name: "overview" }) ?? "";
  const coverImageUrl = useWatch({ control, name: "coverImageUrl" }) ?? "";
  const coverImageFile = useWatch({ control, name: "coverImageFile" });
  const categoryId = useWatch({ control, name: "categoryId" }) ?? "";
  const liveUrl = useWatch({ control, name: "liveUrl" }) ?? "";
  const repoUrl = useWatch({ control, name: "repoUrl" }) ?? "";
  const videoUrl = useWatch({ control, name: "videoUrl" }) ?? "";
  const techStack = useWatch({ control, name: "techStack" }) ?? [];
  const steps = useWatch({ control, name: "steps" }) ?? [];

  const searchParams = useSearchParams();
  const resumeId = searchParams?.get("draftId") ?? undefined;

  const draftValues: SaveShowcaseDraftValues = React.useMemo(
    () => ({
      title: title.trim() || undefined,
      overview: overview.trim() || undefined,
      categoryId: categoryId || undefined,
      coverImageUrl: coverImageUrl || undefined,
      liveUrl: liveUrl.trim() || undefined,
      repoUrl: repoUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      tags: techStack.length ? techStack : undefined,
    }),
    [title, overview, categoryId, coverImageUrl, liveUrl, repoUrl, videoUrl, techStack],
  );

  const { isDirty } = methods.formState;
  const {
    available: availableDraft,
    savedAt,
    isSaving: isSavingDraft,
    error: draftError,
    take: takeDraft,
    discard: discardDraft,
    saveNow: saveDraftNow,
    clear: clearDraft,
    draftId: currentDraftId,
  } = useServerShowcaseDraft({
    values: draftValues,
    enabled: !isEdit,
    isDirty,
    resumeId,
  });

  const { data: serverDraft } = useGetShowcaseDraftQuery(resumeId ?? "", {
    skip: !resumeId || isEdit,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const hasLoadedDraftRef = useRef(false);
  useEffect(() => {
    if (hasLoadedDraftRef.current || !serverDraft || isEdit) return;
    hasLoadedDraftRef.current = true;
    reset({
      title: serverDraft.title ?? "",
      overview: serverDraft.overview ?? "",
      categoryId: serverDraft.categoryId ?? "",
      coverImageUrl: serverDraft.coverImageUrl ?? "",
      liveUrl: serverDraft.liveUrl ?? "",
      repoUrl: serverDraft.repoUrl ?? "",
      videoUrl: serverDraft.videoUrl ?? "",
      techStack: serverDraft.tags ?? [],
      resourceLinks: [],
      steps: [createEmptyStep()],
    });
    toast.success("Draft restored from link");
  }, [serverDraft, isEdit, reset]);

  const readySteps = steps.filter(
    (step) => step?.title?.trim() && step?.description?.trim(),
  ).length;

  const guideDone = steps.length > 0 && readySteps === steps.length;

  const coverReady = coverImageUrl.trim().length > 0 || Boolean(coverImageFile);

  const requirements: Requirement[] = [
    { label: "Cover image", done: coverReady },
    { label: "Project title", done: title.trim().length > 0 },
    { label: "Overview", done: overview.trim().length > 0 },
    { label: "Category", done: categoryId.length > 0 },
    {
      label: "Build guide",
      done: guideDone,
      hint:
        steps.length > 0
          ? `${readySteps} of ${steps.length} ${steps.length === 1 ? "step" : "steps"} complete`
          : "Add at least one step",
    },
  ];

  const metCount = requirements.filter((r) => r.done).length;
  const ready = metCount === requirements.length;
  const projectSectionDone =
    coverReady && title.trim().length > 0 && overview.trim().length > 0;

  const blocked = isSubmitted && Object.keys(errors).length > 0;

  const onSubmit = async (values: CreateShowcaseSubmitValues) => {
    setSubmitting(true);
    setSubmitError(null);

    let stage = isEdit
      ? "Your changes could not be saved."
      : "The showcase could not be created.";

    try {
      if (isEdit && showcaseId) {
        await updateShowcase({
          id: showcaseId,
          body: {
            categoryId: values.categoryId,
            title: values.title,
            overview: values.overview,
            coverImageUrl: values.coverImageUrl || undefined,
            repoUrl: values.repoUrl || undefined,
            liveUrl: values.liveUrl || undefined,
            videoUrl: values.videoUrl || undefined,
          },
        }).unwrap();

        const kept = new Set(
          values.steps
            .map((step) => step.serverId)
            .filter((id): id is string => Boolean(id)),
        );

        for (const stepId of loadedStepIds.current) {
          if (kept.has(stepId)) continue;
          stage = "A removed step could not be deleted.";
          await deleteStep({ showcaseId, stepId }).unwrap();
        }
        loadedStepIds.current = loadedStepIds.current.filter((id) =>
          kept.has(id),
        );
      }

      if (!progress.current.showcaseId) {
        const showcase = await createShowcase({
          categoryId: values.categoryId,
          title: values.title,
          overview: values.overview,
          coverImageUrl: values.coverImageUrl || undefined,
          repoUrl: values.repoUrl || undefined,
          liveUrl: values.liveUrl || undefined,
          videoUrl: values.videoUrl || undefined,
        }).unwrap();

        progress.current.showcaseId = showcase.id;
      }

      const targetId = progress.current.showcaseId;

      if (values.coverImageFile && !progress.current.coverDone) {
        stage = isEdit
          ? "The new cover image could not be uploaded. Saving again retries just that."
          : "Your showcase was created, but the cover image could not be uploaded. Publishing again retries just that.";
        setUploadingCover(true);
        try {
          await uploadCover({
            id: targetId,
            file: values.coverImageFile,
          }).unwrap();
        } finally {
          setUploadingCover(false);
        }
        progress.current.coverDone = true;
      }

      for (let i = 0; i < values.steps.length; i++) {
        const step = values.steps[i];
        stage = isEdit
          ? `Step ${i + 1} could not be saved.`
          : `Step ${i + 1} could not be saved. Your showcase was created — publishing again resumes from there.`;

        const body = {
          stepNumber: i + 1,
          title: step.title,
          description: step.description,
          codeSnippet: step.codeSnippet || undefined,
          imageUrl: step.imageUrl || undefined,
          diagramUrl: step.diagramUrl || undefined,
        };

        let posted = progress.current.steps[step.key];

        if (!posted && step.serverId) {
          await updateStep({
            showcaseId: targetId,
            stepId: step.serverId,
            body,
          }).unwrap();

          posted = {
            id: step.serverId,
            imageDone: !step.imageFile,
            diagramDone: !step.diagramFile,
          };
          progress.current.steps[step.key] = posted;
        }

        if (!posted) {
          const created = await createStep({ showcaseId: targetId, body }).unwrap();

          posted = {
            id: created.id,
            imageDone: !step.imageFile,
            diagramDone: !step.diagramFile,
          };
          progress.current.steps[step.key] = posted;
        }

        if (step.imageFile && !posted.imageDone) {
          stage = `The screenshot on step ${i + 1} could not be uploaded. Saving again retries from there.`;
          await uploadStepImage({
            showcaseId: targetId,
            stepId: posted.id,
            file: step.imageFile,
          }).unwrap();
          posted = { ...posted, imageDone: true };
          progress.current.steps[step.key] = posted;
        }

        if (step.diagramFile && !posted.diagramDone) {
          stage = `The diagram on step ${i + 1} could not be uploaded. Saving again retries from there.`;
          await uploadStepDiagram({
            showcaseId: targetId,
            stepId: posted.id,
            file: step.diagramFile,
          }).unwrap();
          posted = { ...posted, diagramDone: true };
          progress.current.steps[step.key] = posted;
        }
      }

      if (!isEdit) {
        await clearDraft();
      }
      toast.success(isEdit ? "Showcase updated" : "Showcase published for review");
      router.push(successHref);
    } catch (error) {
      setSubmitError(messageOf(error, stage));
    } finally {
      setSubmitting(false);
    }
  };

  const guideLoaded =
    (existing?.steps?.length ?? 0) > 0 || fetchedSteps !== undefined;

  if (isEdit && (loadingExisting || !existing || !guideLoaded)) {
    return <EditFormSkeleton stickyTop={stickyTop} />;
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        className="w-full"
      >
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-6 lg:col-span-2">
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
                      You have an unfinished showcase draft
                      {availableDraft.title ? `: "${availableDraft.title}"` : ""}.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Saved {availableDraft.updatedAt ? new Date(availableDraft.updatedAt).toLocaleString() : "recently"}. Would you like to resume where you left off?
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
                        hasLoadedDraftRef.current = true;
                        reset({
                          title: draft.title ?? "",
                          overview: draft.overview ?? "",
                          categoryId: draft.categoryId ?? "",
                          coverImageUrl: draft.coverImageUrl ?? "",
                          liveUrl: draft.liveUrl ?? "",
                          repoUrl: draft.repoUrl ?? "",
                          videoUrl: draft.videoUrl ?? "",
                          techStack: draft.tags ?? [],
                          resourceLinks: [],
                          steps: [createEmptyStep()],
                        });
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

            <FormSection
              n="01"
              title="The project"
              description="What it is, and the first thing anyone will see."
              done={projectSectionDone}
            >
              <div className="space-y-6">
                <ImageDropField
                  label="Cover image"
                  hint="PNG, JPG or WebP · up to 5MB · shown at 16:9"
                  aspectClassName="aspect-video"
                  value={coverImageUrl}
                  onChange={(url) =>
                    setValue("coverImageUrl", url, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  file={coverImageFile ?? null}
                  onFileChange={(next) =>
                    setValue("coverImageFile", next ?? undefined, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  uploading={uploadingCover}
                  error={errors.coverImageUrl?.message}
                />

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <label
                      htmlFor="showcase-title"
                      className="text-base font-semibold text-foreground"
                    >
                      Project title
                    </label>
                    <span className="text-sm font-medium text-muted-foreground tabular-nums">
                      {title.length}/255
                    </span>
                  </div>
                  <Input
                    id="showcase-title"
                    maxLength={255}
                    placeholder="e.g. A self-hosted OAuth gateway with per-tenant key rotation"
                    {...register("title")}
                    className="h-12 rounded-xl border-border bg-background text-base"
                  />
                  {errors.title?.message && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <label className="text-base font-semibold text-foreground">
                      Overview
                    </label>
                    <span className="text-sm text-muted-foreground">
                      Two to four sentences reads best
                    </span>
                  </div>
                  <MarkdownEditor
                    value={overview}
                    onChange={(next) =>
                      setValue("overview", next ?? "", {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    placeholder="What the project does, why you built it, and what makes it worth a look. This doubles as the excerpt on the showcase index."
                    height={260}
                    error={Boolean(errors.overview)}
                  />
                  {errors.overview?.message && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.overview.message}
                    </p>
                  )}
                </div>
              </div>
            </FormSection>

            <FormSection
              n="02"
              title="Build guide"
              description="The part people come for. Number them by order, not by hand."
              done={guideDone}
              delay={0.08}
            >
              <BuildStepsField />
            </FormSection>

            <FormSection
              n="03"
              title="Links"
              description="Where the code, the demo, and the supporting material live."
              optional
              delay={0.16}
            >
              <div className="space-y-6">
                <ProjectLinksField />

                <div className="space-y-2 border-t border-border pt-5">
                  <h3 className="text-base font-semibold text-foreground">
                    Resource links
                  </h3>
                  <p className="pb-1 text-sm text-muted-foreground">
                    Figma files, API docs, a Postman collection — anything that
                    lives elsewhere.
                  </p>
                  <ResourceLinksField />
                </div>
              </div>
            </FormSection>
          </div>

          <aside
            className="space-y-5 lg:sticky"
            style={{ top: stickyTop } as React.CSSProperties}
          >
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(CARD, CARD_ACTIVE, "space-y-5 p-5")}
            >
              <div className="space-y-2">
                <label
                  htmlFor="showcase-category"
                  className="text-base font-semibold text-foreground"
                >
                  Category
                </label>

                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select
                      items={categoryItems}
                      value={field.value || null}
                      onValueChange={(val) => field.onChange(val ?? "")}
                      disabled={loadingCategories}
                    >
                      <SelectTrigger
                        id="showcase-category"
                        className="h-12 w-full rounded-xl border-border bg-background text-base"
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
                      <SelectContent className="rounded-xl">
                        <SelectGroup>
                          {categoryItems.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                              className="cursor-pointer rounded-lg py-2.5 text-base font-medium"
                            >
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />

                {errors.categoryId?.message && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-5">
                <Controller
                  control={control}
                  name="techStack"
                  render={({ field }) => (
                    <TechStackField
                      value={field.value ?? []}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(CARD, "p-5")}
            >
              <div className="mb-3 flex items-center gap-2.5">
                <span className="h-px w-6 bg-foreground" />
                <span className="text-sm font-bold uppercase tracking-[0.22em] text-foreground">
                  {isEdit ? "Update" : "Publish"}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {ready ? "Everything's in place." : "Still needed"}
                </p>
                <span className="text-sm font-bold text-foreground tabular-nums">
                  {metCount}/{requirements.length}
                </span>
              </div>

              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={false}
                  animate={{
                    width: `${(metCount / requirements.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>

              <ul className="mt-4 space-y-2.5">
                {requirements.map((requirement) => (
                  <RequirementRow key={requirement.label} {...requirement} />
                ))}
              </ul>

              {blocked && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex gap-2.5 rounded-xl border border-border bg-muted p-3 text-sm font-medium text-foreground"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>
                    {isEdit ? "Saving" : "Publishing"} is blocked — the
                    highlighted fields need attention.
                  </span>
                </motion.div>
              )}

              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{submitError}</span>
                </motion.div>
              )}

              {!isEdit && (
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border">
                  <span>Autosave</span>
                  <span className="font-medium">
                    {isSavingDraft ? (
                      <span className="flex items-center gap-1.5 text-primary">
                        <Loader2 className="size-3 animate-spin" /> Saving draft…
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

              <div className="mt-4 space-y-2.5 border-t border-border pt-4">
                <motion.div
                  whileHover={submitting ? undefined : { y: -2 }}
                  whileTap={submitting ? undefined : { y: 0, scale: 0.99 }}
                >
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-12 w-full rounded-full bg-primary text-base font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                  >
                    {submitting ? (
                      <>
                        <Loader2 data-icon="inline-start" className="animate-spin" />
                        {isEdit ? "Saving…" : "Publishing…"}
                      </>
                    ) : (
                      <>
                        <Send data-icon="inline-start" />
                        {isEdit ? "Save changes" : "Publish showcase"}
                      </>
                    )}
                  </Button>
                </motion.div>

                {!isEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSavingDraft || submitting}
                    onClick={async () => {
                      const res = await saveDraftNow();
                      if (res.success) {
                        const targetId = res.draftId || resumeId || currentDraftId;
                        if (targetId) {
                          if (coverImageFile) {
                            try {
                              const uploadRes = await uploadDraftCover({
                                id: targetId,
                                file: coverImageFile,
                              }).unwrap();
                              if (uploadRes.coverImageUrl) {
                                setValue("coverImageUrl", uploadRes.coverImageUrl);
                                setValue("coverImageFile", undefined);
                              }
                            } catch (err) {
                              console.error("Cover image draft upload error", err);
                            }
                          } else if (!coverImageUrl && serverDraft?.coverImageUrl) {
                            try {
                              await removeDraftCover(targetId).unwrap();
                            } catch (err) {
                              console.error("Cover image draft removal error", err);
                            }
                          }
                        }
                        toast.success("Draft saved successfully.");
                        router.push("/dashboard/saved-draft");
                      } else {
                        toast.error(
                          draftError ||
                            "Unable to save draft. Please check your details and try again.",
                        );
                      }
                    }}
                    className="h-11 w-full rounded-full text-sm font-semibold"
                  >
                    {isSavingDraft ? (
                      <>
                        <Loader2 data-icon="inline-start" className="size-4 animate-spin" />
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
                  onClick={() => router.push(cancelHref)}
                  className="h-11 w-full rounded-full text-sm font-semibold"
                >
                  Cancel
                </Button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {isEdit
                  ? "Edits to an approved showcase go back through review. What is live stays as it is until yours is approved."
                  : "Showcases are published for review before they appear on the index."}
              </p>
            </motion.section>
          </aside>
        </div>
      </form>
    </FormProvider>
  );
}

function EditFormSkeleton({ stickyTop }: { stickyTop: string }) {
  return (
    <div
      role="status"
      aria-label="Loading the showcase"
      className="grid w-full animate-pulse grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8"
    >
      <span className="sr-only">Loading the showcase…</span>

      <div className="space-y-6 lg:col-span-2">
        {[0, 1, 2].map((section) => (
          <div key={section} className={cn(CARD, "space-y-4 p-5 sm:p-6")}>
            <div className="flex items-center gap-3.5 border-b border-border pb-4">
              <div className="size-9 rounded-xl bg-muted" />
              <div className="h-6 w-40 rounded-lg bg-muted" />
            </div>
            <div className="aspect-video w-full rounded-xl bg-muted" />
            <div className="h-11 w-full rounded-xl bg-muted" />
          </div>
        ))}
      </div>

      <div
        className="space-y-5 lg:sticky"
        style={{ top: stickyTop } as React.CSSProperties}
      >
        {[0, 1].map((panel) => (
          <div key={panel} className={cn(CARD, "space-y-4 p-5")}>
            <div className="h-5 w-24 rounded bg-muted" />
            <div className="h-12 w-full rounded-xl bg-muted" />
            <div className="h-12 w-full rounded-xl bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
