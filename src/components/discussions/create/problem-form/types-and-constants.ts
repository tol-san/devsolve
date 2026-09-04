import { FieldPath } from "react-hook-form";
import * as z from "zod";
import {
  createProblemFormSchema,
  PROBLEM_TYPES,
  PROBLEM_SEVERITIES,
  SDLC_PHASES,
  PROBLEM_TYPE_LABELS,
  SEVERITY_LABELS,
  SDLC_LABELS,
  type CreateProblemRequest,
  type ProblemUpdateRequest,
} from "@/lib/validations/problem";
import type { ProblemResponse } from "@/lib/redux/services/problemsApi";

export type ProblemFormInput = z.input<typeof createProblemFormSchema>;
export type ProblemFormValues = z.output<typeof createProblemFormSchema>;

export const MAX_TECHNOLOGIES = 20;
export const MAX_ENVIRONMENTS = 20;
export const MAX_REPRODUCTION_STEPS = 20;
export const MAX_TAGS = 10;

export const SDLC_ITEMS = SDLC_PHASES.map((value) => ({
  value,
  label: SDLC_LABELS[value],
}));

export const SDLC_SELECT_ITEMS = [
  { value: null, label: "Not specified" },
  ...SDLC_ITEMS,
];

export const PROBLEM_TYPE_ITEMS = PROBLEM_TYPES.map((value) => ({
  value,
  label: PROBLEM_TYPE_LABELS[value],
}));

export const SEVERITY_ITEMS = PROBLEM_SEVERITIES.map((value) => ({
  value,
  label: SEVERITY_LABELS[value],
}));

export const SEVERITY_SELECT_ITEMS = [
  { value: null, label: "Not specified" },
  ...SEVERITY_ITEMS,
];

export const CARD_CLASS =
  "rounded-2xl border border-border bg-card shadow-xs transition-colors";

export const CONTROL_CLASS =
  "h-12 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary text-base transition-colors shadow-2xs";

export const SERVER_FIELDS = new Set([
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

export function serverFieldPath(field: string): FieldPath<ProblemFormInput> | null {
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

export interface FieldConflict {
  field: string;
  label: string;
  serverValue: string;
  authorValue: string;
}

export function getContentDifferences(
  fresh: ProblemResponse,
  baseline: ProblemResponse | null,
  currentValues: ProblemFormValues,
  submittedTags: string[],
): FieldConflict[] {
  if (!baseline) return [];
  const diffs: FieldConflict[] = [];

  const check = (
    field: string,
    label: string,
    serverVal: string | undefined | null,
    baseVal: string | undefined | null,
    authorVal: string | undefined | null,
  ) => {
    const s = (serverVal ?? "").trim();
    const b = (baseVal ?? "").trim();
    const a = (authorVal ?? "").trim();
    if (s !== b && s !== a) {
      diffs.push({
        field,
        label,
        serverValue: s || "(empty)",
        authorValue: a || "(empty)",
      });
    }
  };

  check("title", "Title", fresh.title, baseline.title, currentValues.title);
  check(
    "description",
    "Description",
    fresh.description,
    baseline.description,
    currentValues.description,
  );
  check(
    "problemType",
    "Problem Type",
    fresh.problemType,
    baseline.problemType,
    currentValues.problemType,
  );
  check(
    "severity",
    "Severity",
    fresh.severity,
    baseline.severity,
    currentValues.severity,
  );
  check(
    "sdlcPhase",
    "SDLC Phase",
    fresh.sdlcPhase,
    baseline.sdlcPhase,
    currentValues.sdlcPhase,
  );
  check(
    "expectedBehavior",
    "Expected Behavior",
    fresh.expectedBehavior,
    baseline.expectedBehavior,
    currentValues.expectedBehavior,
  );
  check(
    "actualBehavior",
    "Actual Behavior",
    fresh.actualBehavior,
    baseline.actualBehavior,
    currentValues.actualBehavior,
  );
  check(
    "attemptsTried",
    "Attempts Tried",
    fresh.attemptsTried,
    baseline.attemptsTried,
    currentValues.attemptsTried,
  );
  check(
    "errorMessage",
    "Error Output",
    fresh.errorMessage,
    baseline.errorMessage,
    currentValues.errorMessage,
  );
  check(
    "repositoryUrl",
    "Repository URL",
    fresh.repositoryUrl,
    baseline.repositoryUrl,
    currentValues.repositoryUrl,
  );

  if (
    fresh.category?.id !== baseline.category?.id &&
    fresh.category?.id !== currentValues.categoryId
  ) {
    diffs.push({
      field: "categoryId",
      label: "Category",
      serverValue: fresh.category?.name || "(unknown)",
      authorValue: "(selected category)",
    });
  }

  const serverTech = (fresh.technologies ?? [])
    .map((t) => (t.name ?? "").trim())
    .filter(Boolean)
    .sort()
    .join(", ");
  const baseTech = (baseline.technologies ?? [])
    .map((t) => (t.name ?? "").trim())
    .filter(Boolean)
    .sort()
    .join(", ");
  const authorTech = (currentValues.technologies ?? [])
    .map((t) => (t.name ?? "").trim())
    .filter(Boolean)
    .sort()
    .join(", ");
  if (serverTech !== baseTech && serverTech !== authorTech) {
    diffs.push({
      field: "technologies",
      label: "Technologies",
      serverValue: serverTech || "(none)",
      authorValue: authorTech || "(none)",
    });
  }

  const serverEnv = (fresh.environment ?? [])
    .map((e) => `${e.technology ?? ""} ${e.version ?? ""}`.trim())
    .filter(Boolean)
    .sort()
    .join(", ");
  const baseEnv = (baseline.environment ?? [])
    .map((e) => `${e.technology ?? ""} ${e.version ?? ""}`.trim())
    .filter(Boolean)
    .sort()
    .join(", ");
  const authorEnv = (currentValues.environment ?? [])
    .map((e) => `${e.technology ?? ""} ${e.version ?? ""}`.trim())
    .filter(Boolean)
    .sort()
    .join(", ");
  if (serverEnv !== baseEnv && serverEnv !== authorEnv) {
    diffs.push({
      field: "environment",
      label: "Environment",
      serverValue: serverEnv || "(none)",
      authorValue: authorEnv || "(none)",
    });
  }

  const serverSteps = (fresh.reproductionSteps ?? [])
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" -> ");
  const baseSteps = (baseline.reproductionSteps ?? [])
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" -> ");
  const authorSteps = (currentValues.reproductionSteps ?? [])
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" -> ");
  if (serverSteps !== baseSteps && serverSteps !== authorSteps) {
    diffs.push({
      field: "reproductionSteps",
      label: "Reproduction Steps",
      serverValue: serverSteps || "(none)",
      authorValue: authorSteps || "(none)",
    });
  }

  const serverTags = (fresh.tags ?? [])
    .map((t) => (t.name ?? "").trim())
    .filter(Boolean)
    .sort()
    .join(", ");
  const baseTags = (baseline.tags ?? [])
    .map((t) => (t.name ?? "").trim())
    .filter(Boolean)
    .sort()
    .join(", ");
  const authorTags = submittedTags
    .map((t) => t.trim())
    .filter(Boolean)
    .sort()
    .join(", ");
  if (serverTags !== baseTags && serverTags !== authorTags) {
    diffs.push({
      field: "tags",
      label: "Tags",
      serverValue: serverTags || "(none)",
      authorValue: authorTags || "(none)",
    });
  }

  return diffs;
}

export function buildProblemCreateBody(
  values: ProblemFormValues,
  submittedTags: string[],
): CreateProblemRequest {
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
  const tech = (values.technologies ?? [])
    .filter((t) => t.name.trim())
    .map((t) => ({
      name: t.name.trim(),
      version: t.version?.trim() || undefined,
    }));
  const normalizedTags = Array.from(
    new Set(submittedTags.map((tag) => tag.trim()).filter(Boolean)),
  );

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    categoryId: values.categoryId,
    problemType: values.problemType,
    severity: values.severity ?? undefined,
    sdlcPhase: values.sdlcPhase ?? undefined,
    expectedBehavior: trimmedOrUndefined(values.expectedBehavior),
    actualBehavior: trimmedOrUndefined(values.actualBehavior),
    attemptsTried: trimmedOrUndefined(values.attemptsTried),
    errorMessage: trimmedOrUndefined(values.errorMessage),
    repositoryUrl: trimmedOrUndefined(values.repositoryUrl),
    technologies: tech.length ? tech : undefined,
    environment: environment.length ? environment : undefined,
    reproductionSteps: steps.length ? steps : undefined,
    newTagNames: normalizedTags.length ? normalizedTags : undefined,
  };
}

export function buildProblemPatchBody(
  values: ProblemFormValues,
  baseline: ProblemResponse | null | undefined,
  submittedTags: string[],
): ProblemUpdateRequest {
  if (!baseline) {
    return buildProblemCreateBody(values, submittedTags) as ProblemUpdateRequest;
  }

  const patch: Record<string, unknown> = {};

  const curTitle = values.title?.trim();
  const baseTitle = baseline.title?.trim() ?? "";
  if (curTitle && curTitle !== baseTitle) {
    patch.title = curTitle;
  }

  const curDesc = values.description?.trim();
  const baseDesc = baseline.description?.trim() ?? "";
  if (curDesc && curDesc !== baseDesc) {
    patch.description = curDesc;
  }

  if (values.categoryId && values.categoryId !== baseline.category?.id) {
    patch.categoryId = values.categoryId;
  }

  if (values.problemType && values.problemType !== baseline.problemType) {
    patch.problemType = values.problemType;
  }

  const curSeverity = values.severity ?? undefined;
  const baseSeverity = baseline.severity ?? undefined;
  if (curSeverity !== baseSeverity) {
    patch.severity = curSeverity;
  }

  const curSdlc = values.sdlcPhase ?? undefined;
  const baseSdlc = baseline.sdlcPhase ?? undefined;
  if (curSdlc !== baseSdlc) {
    patch.sdlcPhase = curSdlc;
  }

  const curExpected = values.expectedBehavior?.trim() || undefined;
  const baseExpected = baseline.expectedBehavior?.trim() || undefined;
  if (curExpected !== baseExpected) {
    patch.expectedBehavior = curExpected;
  }

  const curActual = values.actualBehavior?.trim() || undefined;
  const baseActual = baseline.actualBehavior?.trim() || undefined;
  if (curActual !== baseActual) {
    patch.actualBehavior = curActual;
  }

  const curAttempts = values.attemptsTried?.trim() || undefined;
  const baseAttempts = baseline.attemptsTried?.trim() || undefined;
  if (curAttempts !== baseAttempts) {
    patch.attemptsTried = curAttempts;
  }

  const curError = values.errorMessage?.trim() || undefined;
  const baseError = baseline.errorMessage?.trim() || undefined;
  if (curError !== baseError) {
    patch.errorMessage = curError;
  }

  const curRepo = values.repositoryUrl?.trim() || undefined;
  const baseRepo = baseline.repositoryUrl?.trim() || undefined;
  if (curRepo !== baseRepo) {
    patch.repositoryUrl = curRepo;
  }

  const curTech = (values.technologies ?? [])
    .filter((t) => t.name.trim())
    .map((t) => ({
      name: t.name.trim(),
      version: t.version?.trim() || undefined,
    }));
  const baseTech = (baseline.technologies ?? []).map((t) => ({
    name: (t.name ?? "").trim(),
    version: t.version?.trim() || undefined,
  }));
  if (JSON.stringify(curTech) !== JSON.stringify(baseTech)) {
    patch.technologies = curTech;
  }

  const curEnv = (values.environment ?? [])
    .filter((e) => e.technology.trim())
    .map((e) => ({
      technology: e.technology.trim(),
      version: e.version?.trim() || undefined,
    }));
  const baseEnv = (baseline.environment ?? []).map((e) => ({
    technology: (e.technology ?? "").trim(),
    version: e.version?.trim() || undefined,
  }));
  if (JSON.stringify(curEnv) !== JSON.stringify(baseEnv)) {
    patch.environment = curEnv;
  }

  const curSteps = (values.reproductionSteps ?? [])
    .map((step) => step.trim())
    .filter(Boolean);
  const baseSteps = (baseline.reproductionSteps ?? [])
    .map((step) => step.trim())
    .filter(Boolean);
  if (JSON.stringify(curSteps) !== JSON.stringify(baseSteps)) {
    patch.reproductionSteps = curSteps;
  }

  const normalizedTags = Array.from(
    new Set(submittedTags.map((tag) => tag.trim()).filter(Boolean)),
  );
  const baseTags = Array.from(
    new Set((baseline.tags ?? []).map((tag) => (tag.name ?? "").trim()).filter(Boolean)),
  );
  if (
    normalizedTags.slice().sort().join(",") !==
    baseTags.slice().sort().join(",")
  ) {
    patch.newTagNames = normalizedTags;
  }

  return patch as ProblemUpdateRequest;
}

export interface CreateProblemFormProps {
  problem?: ProblemResponse;
  successHref?: string;
  cancelHref?: string;
  stickyTop?: string;
}
