import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetProgramsQuery, useGetProgramByIdQuery } from "@/lib/redux/services/program/programsApi";
import { useSubmitReportMutation } from "@/lib/redux/services/reportsApi";
import {
  submitReportSchema,
  SubmitReportFormValues,
} from "@/lib/validations/report";
import { AttachedFile } from "@/components/reports/FileUploadDropzone";
import { useServerReportDraft } from "@/components/reports/hooks/useServerReportDraft";
import type { SaveReportDraftValues } from "@/lib/validations/report-draft";

/* The draft columns are typed `uuid`; sending the empty string the form
   holds before anything is chosen would be a 400. */
const isUuid = (value?: string): value is string =>
  !!value &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export interface ReportSuccessModalData {
  isOpen: boolean;
  reportId: string;
  programName: string;
  title: string;
}

export function useSubmitReportForm() {
  const searchParams = useSearchParams();
  const preselectedProgramId = searchParams.get("programId") || "";

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [externalLinks, setExternalLinks] = useState<string[]>([""]);
  /* One empty row to write in. These used to be four sentences describing an
     invented IDOR against an invoice endpoint, which submitted as the
     reporter's own reproduction steps whenever they were not cleared out by
     hand — the examples belong in placeholders, not in the payload. */
  const [reproduceStepsList, setReproduceStepsList] = useState<string[]>([""]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDraftSaved, setIsDraftSaved] = useState<boolean>(false);
  const [successModalData, setSuccessModalData] =
    useState<ReportSuccessModalData>({
      isOpen: false,
      reportId: "",
      programName: "",
      title: "",
    });

  const { data: programsData, isLoading: isProgramsLoading } =
    useGetProgramsQuery();
  const { data: specificProgram } = useGetProgramByIdQuery(preselectedProgramId, {
    skip: !preselectedProgramId,
  });
  const [submitReport, { isLoading: isSubmitting }] = useSubmitReportMutation();

  const programs = programsData?.content || [];

  const form = useForm<SubmitReportFormValues>({
    resolver: zodResolver(submitReportSchema),
    /* Empty by design. Every text field here used to arrive filled with a
       worked example — a target URL, a CWE, a CVSS vector and score, an
       expected and actual result — and anything the reporter did not overwrite
       was submitted as their own finding. A triager had no way to tell the
       leftovers from the report. */
    defaultValues: {
      programId: preselectedProgramId,
      targetAsset: "",
      httpMethod: "GET",
      vulnerableParameter: "",
      environment: "PRODUCTION",
      discoveredAt: "",
      title: "",
      category: "",
      severity: "MEDIUM",
      cweIdentifier: "",
      cvssScore: "",
      cvssVector: "",
      summaryPoC: "",
      reproduceStepsList: [],
      impact: "",
      remediation: "",
      pocPayload: "",
      expectedResult: "",
      actualResult: "",
      externalLinks: [],
      checklistInScope: false,
      checklistNotDuplicate: false,
      checklistReproducible: false,
      checklistNoPii: false,
      checklistAgreeTerms: false,
    },
  });

  const { setValue, watch, reset, trigger } = form;

  /* What the draft endpoint models, built from what is on screen.

     The API stores the same fifteen fields a report has, so the composed
     Markdown the submit step builds is NOT what is saved — the raw values are,
     which is the only way a restore can put them back in the boxes they came
     from. Fields the draft schema has no column for (HTTP method, vulnerable
     parameter, expected/actual result, the checklist) do not survive a round
     trip; see the note in the review. */
  const watched = watch();
  const draftBody = useMemo<SaveReportDraftValues>(() => {
    const score = Number(watched.cvssScore);
    const steps = (reproduceStepsList ?? []).map((s) => s.trim()).filter(Boolean);
    const links = (externalLinks ?? []).map((l) => l.trim()).filter(Boolean);

    return {
      title: watched.title || undefined,
      vulnerabilityInformation: watched.summaryPoC || undefined,
      impact: watched.impact || undefined,
      stepsToReproduce: steps.length ? steps.join("\n") : undefined,
      proofOfConcept: watched.pocPayload || undefined,
      remediationRecommendation: watched.remediation || undefined,
      targetEndpoint: watched.targetAsset || undefined,
      environment: watched.environment || undefined,
      discoveredAt: watched.discoveredAt
        ? new Date(watched.discoveredAt).toISOString()
        : undefined,
      referenceLinks: links.length ? links.slice(0, 10) : undefined,
      /* `INFO` is the form's own tier and has no counterpart upstream; a
         draft may legitimately be undecided, so it maps to NONE. */
      reportedSeverity:
        watched.severity === "INFO" ? "NONE" : watched.severity || undefined,
      cvssVector: watched.cvssVector || undefined,
      cvssScore: Number.isFinite(score) && watched.cvssScore ? score : undefined,
      weaknessId: isUuid(watched.weaknessId) ? watched.weaknessId : undefined,
      /* `assetId` is absent until the form asks which in-scope asset was
         targeted. Submit currently derives it from the program's first
         asset, which is not something worth persisting into a draft. */
    };
  }, [watched, externalLinks, reproduceStepsList]);

  const draft = useServerReportDraft({
    programId: preselectedProgramId || watched.programId || "",
    values: draftBody,
    isDirty: form.formState.isDirty,
    enabled: !isSubmitting && !successModalData.isOpen,
  });

  /* Puts a stored draft back on screen. The inverse of the mapping above —
     replacing rather than merging, since the arrays are positional and
     interleaving them would produce steps in an order nobody wrote. */
  const restoreDraft = () => {
    const stored = draft.take();
    if (!stored) return;

    setValue("title", stored.title ?? "");
    setValue("summaryPoC", stored.vulnerabilityInformation ?? "");
    setValue("impact", stored.impact ?? "");
    setValue("pocPayload", stored.proofOfConcept ?? "");
    setValue("remediation", stored.remediationRecommendation ?? "");
    setValue("targetAsset", stored.targetEndpoint ?? "");
    if (stored.environment) setValue("environment", stored.environment);
    setValue(
      "discoveredAt",
      stored.discoveredAt ? stored.discoveredAt.slice(0, 10) : "",
    );
    if (stored.reportedSeverity && stored.reportedSeverity !== "NONE") {
      setValue("severity", stored.reportedSeverity);
    }
    setValue("cvssVector", stored.cvssVector ?? "");
    setValue("cvssScore", stored.cvssScore != null ? String(stored.cvssScore) : "");
    setValue("weaknessId", stored.weaknessId ?? "");

    setReproduceStepsList(
      stored.stepsToReproduce ? stored.stepsToReproduce.split("\n") : [""],
    );
    setExternalLinks(
      stored.referenceLinks?.length ? stored.referenceLinks : [""],
    );
  };

  const selectedProgramId = watch("programId");
  const selectedSeverity = watch("severity");

  const selectedProgram: any =
    specificProgram ||
    programs.find((p: any) => p.id === selectedProgramId) ||
    programs[0] ||
    null;

  // Synchronize preselected program ID when programs arrive asynchronously.
  useEffect(() => {
    if (preselectedProgramId) {
      setValue("programId", preselectedProgramId);
      return;
    }
    if (programs.length > 0 && !selectedProgramId) {
      setValue("programId", programs[0].id);
    }
  }, [preselectedProgramId, programs, setValue, selectedProgramId]);

  /* The affected URL is typed, not guessed. This used to be filled in from the
     program's first in-scope asset with `/v1/endpoint` appended — an address
     that generally does not exist — and it landed in `targetEndpoint`, the
     field a triager uses to find the vulnerability. The program's scope is
     already listed above the input, which is the part that was actually
     useful. */

  // Handle Step Navigation & Validation
  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof SubmitReportFormValues)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = [
        "programId",
        "targetAsset",
        "title",
        /* `category` is deliberately absent: the weakness catalogue is a
           closed vocabulary and "I'm not sure" is a valid answer, so the
           step cannot require one. */
        "severity",
      ];
    } else if (currentStep === 2) {
      fieldsToValidate = ["summaryPoC"];
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      return isValid;
    }
    return true;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCompletedSteps((prev) => Array.from(new Set([...prev, currentStep])));
      setCurrentStep((prev) => Math.min(prev + 1, 2));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 2) {
      setCurrentStep(step);
    }
  };

  // External Links Dynamic List
  const handleAddExternalLink = () => {
    setExternalLinks((prev) => [...prev, ""]);
  };

  const handleRemoveExternalLink = (index: number) => {
    setExternalLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateExternalLink = (index: number, val: string) => {
    setExternalLinks((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  // Steps to Reproduce Dynamic List
  const handleAddReproduceStep = () => {
    setReproduceStepsList((prev) => [...prev, ""]);
  };

  const handleRemoveReproduceStep = (index: number) => {
    setReproduceStepsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateReproduceStep = (index: number, val: string) => {
    setReproduceStepsList((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const handleInsertTemplate = (templateText: string) => {
    const currentPoC = watch("summaryPoC");
    if (currentPoC && currentPoC.trim() !== "") {
      setValue("summaryPoC", `${currentPoC}\n\n${templateText}`);
    } else {
      setValue("summaryPoC", templateText);
    }
  };

  const handleAddFiles = (newFiles: AttachedFile[]) => {
    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  /* Explicit save, for a reporter who wants to be told it is safe rather
     than trust that it was. Autosave has usually written it already, so this
     mostly acknowledges — but it also flushes immediately instead of waiting
     out the debounce. */
  const handleSaveDraft = () => {
    void draft.saveNow();
    setIsDraftSaved(true);
    setTimeout(() => setIsDraftSaved(false), 3000);
  };

  const handleResetForm = () => {
    reset();
    setCurrentStep(1);
    setCompletedSteps([]);
    setAttachedFiles([]);
    setExternalLinks([""]);
    setSubmitError(null);
    setSuccessModalData({
      isOpen: false,
      reportId: "",
      programName: "",
      title: "",
    });
  };

  const onSubmit = async (values: SubmitReportFormValues) => {
    setSubmitError(null);
    const selectedProg = programs.find((p: any) => p.id === values.programId);
    const programName = selectedProg
      ? selectedProg.organizationName
      : "CloudVault Security Program";
    const assetId = selectedProg?.inScopeAssets?.[0]?.id;

    try {
      const res = await submitReport({
        programId: values.programId,
        programName,
        assetId,
        targetAsset: values.targetAsset,
        httpMethod: values.httpMethod,
        vulnerableParameter: values.vulnerableParameter,
        environment: values.environment,
        discoveredAt: values.discoveredAt,
        category: values.category,
        severity: values.severity,
        cweIdentifier: values.cweIdentifier,
        cvssScore: values.cvssScore,
        cvssVector: values.cvssVector,
        title: values.title,
        summaryPoC: values.summaryPoC,
        reproduceStepsList,
        impact: values.impact,
        remediation: values.remediation,
        pocPayload: values.pocPayload,
        expectedResult: values.expectedResult,
        actualResult: values.actualResult,
        attachments: attachedFiles.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
        externalLinks: externalLinks.filter((l) => l.trim() !== ""),
        agreeTerms: values.checklistAgreeTerms,
      }).unwrap();

      if (res.success) {
        /* Submitted: the draft has served its purpose, and leaving it would
           offer the reporter their own filed report back as unfinished work. */
        void draft.clear();
        setSuccessModalData({
          isOpen: true,
          reportId: res.reportId,
          programName,
          title: values.title,
        });
      }
    } catch (err: unknown) {
      console.error("Failed to submit report:", err);
      setSubmitError(
        "Failed to submit vulnerability report. Please verify inputs and try again.",
      );
    }
  };

  return {
    ...form,
    errors: form.formState.errors,
    currentStep,
    completedSteps,
    selectedSeverity,
    selectedProgram,
    programs,
    isProgramsLoading,
    isSubmitting,
    attachedFiles,
    externalLinks,
    reproduceStepsList,
    submitError,
    isDraftSaved,
    draft,
    restoreDraft,
    successModalData,
    nextStep,
    prevStep,
    goToStep,
    handleAddFiles,
    handleRemoveFile,
    handleAddExternalLink,
    handleRemoveExternalLink,
    handleUpdateExternalLink,
    handleAddReproduceStep,
    handleRemoveReproduceStep,
    handleUpdateReproduceStep,
    handleInsertTemplate,
    handleSaveDraft,
    handleResetForm,
    onSubmit,
  };
}
