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
import type { SaveShowcaseDraftValues } from "@/lib/validations/showcase-draft";
import { cn } from "@/lib/utils";

/** Pulls something readable out of an RTK Query error. */
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

/* ─── Surface ────────────────────────────────────────────────────────────
   The landing sections carry their cards on a hairline ring plus a low
   shadow rather than a border, and lift both toward brand blue on hover.
   Reusing that treatment is most of what ties this form to the home page;
   here the lift is on `focus-within`, so the card being typed into is the
   one that stands up. */
const CARD =
  "rounded-2xl bg-card text-card-foreground border border-border shadow-xs transition-shadow";

const CARD_ACTIVE =
  "focus-within:border-ring";

interface FormSectionProps {
  n: string;
  title: string;
  description?: string;
  /** Ticks the step marker once everything required in the section is filled. */
  done?: boolean;
  /** Nothing in the section is required, so it never shows an unfilled marker. */
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

/* ─── Readiness ──────────────────────────────────────────────────────────
   A long form hides how much of it is actually required. This says so up
   front and keeps saying it while you type, so nobody discovers the missing
   cover image by pressing Publish. */

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

/** What one step of a publish attempt got through, for resuming after a failure. */
type StepProgress = { id: string; imageDone: boolean; diagramDone: boolean };

/** An existing showcase and its guide, as the form's fields hold them. */
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
    /* The backend stores no tech stack or resource links for a showcase, so
       there is nothing to load back into those fields. */
    techStack: [],
    resourceLinks: [],
    steps: ordered.length
      ? ordered.map((step) => ({
          key: `step-${step.id}`,
          serverId: step.id,
          title: step.title,
          description: step.description,
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
  /** Where to land after a successful publish. */
  successHref?: string;
  cancelHref?: string;
  /**
   * Edit an existing showcase rather than create one. The same fields, loaded
   * with what is stored: on save the showcase is patched, its steps are
   * reconciled against the guide on screen, and new images are uploaded.
   */
  showcaseId?: string;
  /**
   * Offset the sticky sidebar parks at, which depends on what it sticks
   * against. The dashboard scrolls inside a `<main>` that already starts
   * below its header, so the default is a plain gap; a public page sticks
   * against the viewport and has to clear the fixed navbar itself.
   */
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
  const [uploadStepImage] = useUploadShowcaseStepImageMutation();
  const [uploadStepDiagram] = useUploadShowcaseStepDiagramMutation();

  /* Only fetched when editing; the create form asks for nothing. */
  const { data: existing, isLoading: loadingExisting } = useGetShowcaseByIdQuery(
    showcaseId ?? "",
    { skip: !showcaseId },
  );
  const { data: fetchedSteps } = useGetShowcaseStepsQuery(showcaseId ?? "", {
    skip: !showcaseId || (existing?.steps?.length ?? 0) > 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  /** Drives the cover field's own overlay, which `submitting` is too coarse for. */
  const [uploadingCover, setUploadingCover] = useState(false);

  /**
   * Publishing is a sequence, not one request: the showcase, its cover image,
   * then each step followed by that step's own images. Every image route is
   * scoped to a row that has to exist first, and the API offers no bulk
   * variant or transaction.
   *
   * This remembers exactly what landed, so retrying after a failure resumes
   * rather than creating a second showcase or a duplicate step. Steps are keyed
   * by their stable form key rather than by position: an author who reorders or
   * deletes a step between attempts would otherwise have the next attempt
   * attach an image to whichever step slid into that slot.
   */
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

  /**
   * The step ids the server had when the form was loaded. What is missing from
   * the guide at save time is what the author deleted, and gets deleted
   * upstream — the API has no bulk replace.
   */
  const loadedStepIds = useRef<string[]>([]);
  const loaded = useRef(false);

  /* Loading an existing showcase happens once. A later refetch — after the
     save invalidates its cache — must not overwrite what is being typed. */
  useEffect(() => {
    if (!isEdit || loaded.current || !existing) return;

    const steps = existing.steps?.length ? existing.steps : (fetchedSteps ?? []);
    /* Wait for the guide: resetting without it would show an empty step and
       then delete every real one on save. */
    if (!existing.steps?.length && !fetchedSteps) return;

    loaded.current = true;
    loadedStepIds.current = steps.map((step) => step.id);
    progress.current.showcaseId = existing.id;
    reset(toFormValues(existing, steps));
  }, [isEdit, existing, fetchedSteps, reset]);

  /* `useWatch` rather than `watch`: the latter returns a fresh function every
     render, which the React Compiler cannot memoize around. */
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
    take: takeDraft,
    discard: discardDraft,
    saveNow: saveDraftNow,
    clear: clearDraft,
  } = useServerShowcaseDraft({
    values: draftValues,
    enabled: !isEdit,
    isDirty,
    resumeId,
  });

  const resumedFromUrl = useRef(false);
  useEffect(() => {
    if (!resumeId || resumedFromUrl.current || isEdit) return;
    resumedFromUrl.current = true;
    const draft = takeDraft();
    if (draft) {
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
      toast.success("Draft restored from link");
    }
  }, [resumeId, isEdit, takeDraft, reset]);

  /* A step only counts once it carries both of the fields the schema demands
     — a titled step with an empty body would fail validation at submit.
     Left unmemoized on purpose: a guide is a handful of entries, and the
     `?? []` above hands `useMemo` a fresh array every render anyway. */
  const readySteps = steps.filter(
    (step) => step?.title?.trim() && step?.description?.trim(),
  ).length;

  /* Every step has to be complete, not just one: the schema validates each
     entry in the array, so a half-filled step 3 fails the publish exactly
     the way an empty guide would. */
  const guideDone = steps.length > 0 && readySteps === steps.length;

  /* Either half of the cover control satisfies the requirement — see the
     schema's refine, which is what actually gates the publish. */
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

  /* Only after a submit attempt — nagging about incomplete fields on a form
     nobody has tried to send yet is noise. */
  const blocked = isSubmitted && Object.keys(errors).length > 0;

  const onSubmit = async (values: CreateShowcaseSubmitValues) => {
    setSubmitting(true);
    setSubmitError(null);

    /* Named so a failure can say which request it was, since the sequence
       below spans several of them. */
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

        /* Steps the author removed from the guide. Deleted first, so a step
           renumbered into a freed position cannot collide with one on its way
           out. */
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
          /* A pasted URL travels in the body; a chosen file goes to the
             cover-image route below, once there is an id to put it against. */
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

      /* Sequential, not Promise.all: `stepNumber` carries the order, and each
         step's images can only be sent after that step exists. */
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
          /* A step that already exists upstream — patched in place, and
             renumbered by its position the same way a new one is. */
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

        /* Each upload is recorded by replacing the entry rather than mutating
           it, so a retry reads the same progress the last attempt wrote. */
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

  /* An edit form with nothing in it yet would read as a showcase whose fields
     were wiped, so the shape of the page is shown until the values land — the
     guide included, since that is what the save reconciles against. */
  const guideLoaded =
    (existing?.steps?.length ?? 0) > 0 || fetchedSteps !== undefined;

  if (isEdit && (loadingExisting || !existing || !guideLoaded)) {
    return <EditFormSkeleton stickyTop={stickyTop} />;
  }

  return (
    <FormProvider {...methods}>
      {/* `handleSubmit` is bound inside the event handler rather than during
          render, so the resume ref `onSubmit` closes over is only ever read
          on submit. */}
      <form
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        className="w-full"
      >
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
          {/* ── Main column ── */}
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
                {/* Two fields behind one control: a pasted URL lands in
                    `coverImageUrl`, a chosen file waits in `coverImageFile`
                    until the showcase exists to hang it off. */}
                <ImageDropField
                  label="Cover image"
                  hint="PNG, JPG or WebP · up to 5MB · shown at 16:9"
                  aspectClassName="aspect-video"
                  value={coverImageUrl}
                  onChange={(url) =>
                    setValue("coverImageUrl", url, { shouldValidate: true })
                  }
                  file={coverImageFile ?? null}
                  onFileChange={(next) =>
                    setValue("coverImageFile", next ?? undefined, {
                      shouldValidate: true,
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
                      setValue("overview", next ?? "", { shouldValidate: true })
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

          {/* ── Sidebar ──
              Category sits above Publish deliberately: it is a required field
              that lives out here, and burying it under the button is how it
              gets missed. */}
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
                          {/* The value is the id, not the name: `categoryId` is
                              a UUID upstream and the proxy rejects anything
                              else. */}
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
              {/* The landing page's eyebrow rule, so the panel reads as part
                  of the same system as the sections behind it. */}
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

              {/* Blue→green, the same ramp the landing page's lifecycle rail
                  runs on: in progress on the left, done on the right. */}
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
                {/* The hero's pill and its brand glow. Never disabled on an
                    incomplete form — the field-level errors are what explain
                    the problem, and a dead button explains nothing. */}
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
                      const ok = await saveDraftNow();
                      if (ok) toast.success("Draft saved to server");
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

/** The page's own shape while an existing showcase is being fetched. */
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
