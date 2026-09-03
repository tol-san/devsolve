import { useMemo, useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetProgramsQuery, useGetProgramByIdQuery } from "@/lib/redux/services/program/programsApi";
import {
  useSubmitReportMutation,
  useUploadReportAttachmentMutation,
} from "@/lib/redux/services/reportsApi";
import { useGetReportingAccessQuery } from "@/lib/redux/services/researcherAccessApi";
import type { ResearcherAccessStatus } from "@/lib/validations/researcher-access";
import {
  apiErrorMessage,
  apiErrorStatus,
  contentScanErrorMessage,
  extractScanErrorDetails,
} from "@/lib/api/error-message";
import {
  submitReportSchema,
  SubmitReportFormValues,
} from "@/lib/validations/report";
import { AttachedFile } from "@/components/reports/FileUploadDropzone";
import { useServerReportDraft } from "@/components/reports/hooks/useServerReportDraft";
import { useGetReportDraftQuery } from "@/lib/redux/services/reportDraftsApi";
import type {
  ReportDraftResponse,
  SaveReportDraftValues,
} from "@/lib/validations/report-draft";

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
  submittedAt?: string;
  attachmentWarning?: string;
}

export function useSubmitReportForm() {
  const searchParams = useSearchParams();
  const requestedProgramId = searchParams.get("programId") || "";

  /* `?id=` opens one specific saved draft — the link on a card in the
     saved-drafts list. The draft names its own program, so the form does not
     need `programId` alongside it. */
  const resumeDraftId = searchParams.get("id") || "";
  const { data: linkedDraft } = useGetReportDraftQuery(resumeDraftId, {
    skip: !isUuid(resumeDraftId),
  });

  const preselectedProgramId = requestedProgramId || linkedDraft?.programId || "";

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [externalLinks, setExternalLinks] = useState<string[]>([""]);
  const [linkErrors, setLinkErrors] = useState<Record<number, string>>({});
  const [referenceLinksError, setReferenceLinksError] = useState<string | null>(null);
  /* One empty row to write in. These used to be four sentences describing an
     invented IDOR against an invoice endpoint, which submitted as the
     reporter's own reproduction steps whenever they were not cleared out by
     hand — the examples belong in placeholders, not in the payload. */
  const [reproduceStepsList, setReproduceStepsList] = useState<string[]>([""]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  /* The upstream's own words when it refuses a submission for want of
     approval, tagged with the state it was describing.

     Kept apart from `submitError` because it is not a mistake in the report —
     nothing in the form can be corrected to fix it — and because it names the
     company and the next step, which is more than anything written here could
     say. The program and the access status travel with it so a refusal that no
     longer describes anything is simply not read: pick another program, send
     the request it asked for, get approved, and it falls away on the next
     render rather than needing an effect to clear it. */
  const [accessRefusal, setAccessRefusal] = useState<{
    programId: string;
    status: ResearcherAccessStatus | null;
    message: string;
  } | null>(null);
  const [isDraftSaved, setIsDraftSaved] = useState<boolean>(false);
  const [successModalData, setSuccessModalData] =
    useState<ReportSuccessModalData>({
      isOpen: false,
      reportId: "",
      programName: "",
      title: "",
      submittedAt: "",
    });

  const { data: programsData, isLoading: isProgramsLoading } =
    useGetProgramsQuery();
  const { data: specificProgram } = useGetProgramByIdQuery(preselectedProgramId, {
    skip: !preselectedProgramId,
  });
  const [submitReport, { isLoading: isCreatingReport }] = useSubmitReportMutation();
  const [uploadReportAttachment, { isLoading: isUploadingAttachment }] =
    useUploadReportAttachmentMutation();
  const isSubmitting = isCreatingReport || isUploadingAttachment;

  const programs = useMemo(() => programsData?.content ?? [], [programsData?.content]);

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
      weaknessId: "",
      suggestedWeakness: "",
      weaknessMode: "unsure",
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

  const { setValue, reset, trigger, getValues } = form;

  /* What the draft endpoint models, built from what is on screen.

     The API stores the same fifteen fields a report has, so the composed
     Markdown the submit step builds is NOT what is saved — the raw values are,
     which is the only way a restore can put them back in the boxes they came
     from. Fields the draft schema has no column for (HTTP method, vulnerable
     parameter, expected/actual result, the checklist) do not survive a round
     trip; see the note in the review. */
  const watched = useWatch({ control: form.control });
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
      weaknessId:
        watched.weaknessMode === "catalog" && isUuid(watched.weaknessId)
          ? watched.weaknessId
          : null,
      suggestedWeakness:
        watched.weaknessMode === "custom" && watched.suggestedWeakness && watched.suggestedWeakness.trim()
          ? watched.suggestedWeakness.trim().slice(0, 255)
          : null,
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
    /* Saves go back into the draft the link named, rather than forking a
       second copy of the same report. */
    resumeId: isUuid(resumeDraftId) ? resumeDraftId : undefined,
  });

  /* Puts a stored draft back on screen. The inverse of the mapping above —
     replacing rather than merging, since the arrays are positional and
     interleaving them would produce steps in an order nobody wrote. */
  const applyDraft = (stored: ReportDraftResponse) => {
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

    // Restore weakness mode & values
    if (stored.weaknessId) {
      setValue("weaknessMode", "catalog");
      setValue("weaknessId", stored.weaknessId);
      setValue("suggestedWeakness", "");
    } else if (stored.suggestedWeakness) {
      setValue("weaknessMode", "custom");
      setValue("weaknessId", "");
      setValue("suggestedWeakness", stored.suggestedWeakness);
    } else {
      setValue("weaknessMode", "unsure");
      setValue("weaknessId", "");
      setValue("suggestedWeakness", "");
    }

    setReproduceStepsList(
      stored.stepsToReproduce ? stored.stepsToReproduce.split("\n") : [""],
    );
    setExternalLinks(
      stored.referenceLinks?.length ? stored.referenceLinks : [""],
    );
  };

  /** Accepting the banner: the draft found for this program. */
  const restoreDraft = () => {
    const stored = draft.take();
    if (stored) applyDraft(stored);
  };

  /* Arriving from a saved-drafts card. Applied once, when the draft lands —
     the form is empty at that point, so there is nothing of the reporter to
     overwrite, and re-applying on every render would fight their typing. */
  const applied = useRef<string | null>(null);
  useEffect(() => {
    if (!linkedDraft || applied.current === linkedDraft.id) return;
    applied.current = linkedDraft.id;
    applyDraft(linkedDraft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedDraft]);

  const selectedProgramId = watched.programId ?? "";
  const selectedSeverity = watched.severity;

  const selectedProgram = specificProgram
    ? {
        ...specificProgram,
        inScopeAssets: specificProgram.inScopeAssets ?? [],
      }
    : programs.find((program) => program.id === selectedProgramId) ||
      programs[0] ||
      null;

  /* Asked up front rather than discovered on the way out.

     Reporting is gated on the *company* approving the researcher, so a
     submission from someone uncleared is refused with a 403 no matter how
     complete the report is. Asking before the form is filled in is the
     difference between a warning and a wasted afternoon — and since approval
     is per organization, the answer holds for every program that company
     runs. Drafts are untouched by it: writing and saving never needed
     approval, and the notice says so. */
  const accessProgramId = selectedProgram?.id || selectedProgramId || "";
  const {
    data: reportingAccess,
    isLoading: isAccessLoading,
  } = useGetReportingAccessQuery(accessProgramId, {
    skip: !isUuid(accessProgramId),
  });

  /* Undefined while the pre-check is loading or unavailable — treated as
     allowed, because blocking on a check that never answered would stop a
     reporter who is in fact approved. The upstream still has the final say. */
  const canSubmitReport = reportingAccess?.canSubmitReports !== false;

  const accessStatus = reportingAccess?.status ?? null;
  const accessBlockedMessage =
    accessRefusal &&
    accessRefusal.programId === accessProgramId &&
    accessRefusal.status === accessStatus
      ? accessRefusal.message
      : null;

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
    setLinkErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleUpdateExternalLink = (index: number, val: string) => {
    setExternalLinks((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
    if (linkErrors[index]) {
      setLinkErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
    setReferenceLinksError(null);
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
    const currentPoC = getValues("summaryPoC");
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
  const handleSaveDraft = async () => {
    /* Awaited, because the button used to say "Draft Saved!" the instant it
       was pressed — before the write had been attempted, let alone accepted.
       A refused save then looked exactly like a successful one, which is the
       worst thing a save button can do. The failure is left to `DraftStatus`,
       which renders the reason the upstream gave. */
    const saved = await draft.saveNow();
    if (!saved) return;

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
    setAccessRefusal(null);
    setSuccessModalData({
      isOpen: false,
      reportId: "",
      programName: "",
      title: "",
      submittedAt: "",
      attachmentWarning: undefined,
    });
  };

  const onSubmit = async (values: SubmitReportFormValues) => {
    setSubmitError(null);
    setAccessRefusal(null);
    const selectedProg = programs.find((program) => program.id === values.programId);
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
        weaknessId:
          values.weaknessMode === "catalog" && isUuid(values.weaknessId)
            ? values.weaknessId
            : null,
        suggestedWeakness:
          values.weaknessMode === "custom" && values.suggestedWeakness && values.suggestedWeakness.trim()
            ? values.suggestedWeakness.trim().slice(0, 255)
            : null,
        weaknessMode: values.weaknessMode,
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
        externalLinks: externalLinks.filter((l) => l.trim() !== ""),
        agreeTerms: values.checklistAgreeTerms,
      }).unwrap();

      if (res.success) {
        let attachmentWarning: string | undefined;
        for (const attached of attachedFiles) {
          try {
            await uploadReportAttachment({
              reportId: res.id,
              file: attached.file,
            }).unwrap();
          } catch (uploadError) {
            attachmentWarning = contentScanErrorMessage(
              uploadError,
              attached.name,
            );
            break;
          }
        }

        /* Submitted: the draft has served its purpose, and leaving it would
           offer the reporter their own filed report back as unfinished work. */
        void draft.clear();
        setSuccessModalData({
          isOpen: true,
          reportId: res.reportId,
          programName,
          title: values.title,
          submittedAt: res.createdAt || new Date().toISOString(),
          attachmentWarning,
        });
      }
    } catch (err: unknown) {
      console.error("Failed to submit report:", err);

      const status = apiErrorStatus(err);

      /* 403 is the company refusing the reporter, not the report. */
      if (status === 403) {
        setAccessRefusal({
          programId: values.programId,
          status: accessStatus,
          message: apiErrorMessage(
            err,
            "This organization has not approved you to report to its programs yet.",
          ),
        });
        return;
      }

      /* 400: Weakness mutual exclusivity error: "Choose a weakness from the catalog or name your own, not both" */
      if (status === 400) {
        const msg = apiErrorMessage(err, "");
        if (
          msg.toLowerCase().includes("choose a weakness") ||
          msg.toLowerCase().includes("not both") ||
          msg.toLowerCase().includes("catalog")
        ) {
          form.setError("suggestedWeakness", {
            type: "manual",
            message: msg || "Choose a weakness from the catalog or name your own, not both.",
          });
          form.setError("category", {
            type: "manual",
            message: msg || "Choose a weakness from the catalog or name your own, not both.",
          });
          setCurrentStep(1);
          return;
        }
      }

      /* 422: VirusTotal URL scanning refusal */
      if (status === 422) {
        const scanDetails = extractScanErrorDetails(err);
        const errData = (err as any)?.data;
        const rawDetails = errData?.errorDetails ?? errData?.details;
        const errMessage = apiErrorMessage(err, "");

        const rejectedUrl =
          typeof rawDetails?.url === "string"
            ? rawDetails.url
            : typeof rawDetails?.targetUrl === "string"
            ? rawDetails.targetUrl
            : typeof rawDetails?.link === "string"
            ? rawDetails.link
            : null;

        const maliciousCount =
          scanDetails?.malicious ??
          (typeof rawDetails?.stats?.malicious === "number" ? rawDetails.stats.malicious : undefined);
        const verdict = scanDetails?.verdict ?? rawDetails?.verdict ?? "MALICIOUS";
        const countText =
          maliciousCount !== undefined
            ? ` (${maliciousCount} malicious detection${maliciousCount === 1 ? "" : "s"})`
            : "";
        const scanReason = `VirusTotal flagged this URL as ${verdict}${countText}.`;

        let handled = false;

        // 1. Check if targetAsset matches
        if (
          rejectedUrl &&
          values.targetAsset &&
          values.targetAsset.trim().toLowerCase() === rejectedUrl.trim().toLowerCase()
        ) {
          form.setError("targetAsset", {
            type: "manual",
            message: `Target endpoint was rejected by security scanning: ${scanReason}`,
          });
          setCurrentStep(1);
          handled = true;
        } else if (
          !rejectedUrl &&
          values.targetAsset &&
          errMessage.toLowerCase().includes(values.targetAsset.toLowerCase())
        ) {
          form.setError("targetAsset", {
            type: "manual",
            message: `Target endpoint was rejected by security scanning: ${scanReason}`,
          });
          setCurrentStep(1);
          handled = true;
        }

        // 2. Check if any external reference links match
        const matchingLinkIdx = externalLinks.findIndex(
          (l) => rejectedUrl && l.trim().toLowerCase() === rejectedUrl.trim().toLowerCase()
        );

        if (matchingLinkIdx !== -1) {
          setLinkErrors((prev) => ({
            ...prev,
            [matchingLinkIdx]: `Security scanning rejected this link: ${scanReason}`,
          }));
          handled = true;
        } else if (
          !rejectedUrl &&
          externalLinks.some((l) => l.trim() && errMessage.includes(l.trim()))
        ) {
          const idx = externalLinks.findIndex((l) => l.trim() && errMessage.includes(l.trim()));
          if (idx !== -1) {
            setLinkErrors((prev) => ({
              ...prev,
              [idx]: `Security scanning rejected this link: ${scanReason}`,
            }));
            handled = true;
          }
        }

        if (!handled) {
          // If the backend didn't specify which link, surface on reference links & target endpoint
          if (externalLinks.some((l) => l.trim().length > 0)) {
            setReferenceLinksError(
              `VirusTotal rejected a submitted URL: ${scanReason} Please verify your reference links and target asset.`
            );
          }
          if (values.targetAsset) {
            form.setError("targetAsset", {
              type: "manual",
              message: `VirusTotal rejected a submitted URL: ${scanReason} Check this target endpoint.`,
            });
          }
          setSubmitError(
            contentScanErrorMessage(
              err,
              "A submitted link (target endpoint or reference link)",
            ),
          );
        }
        return;
      }

      setSubmitError(
        contentScanErrorMessage(
          err,
          "A submitted link or report field",
        ),
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
    linkErrors,
    referenceLinksError,
    reproduceStepsList,
    submitError,
    reportingAccess,
    isAccessLoading,
    canSubmitReport,
    accessBlockedMessage,
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
