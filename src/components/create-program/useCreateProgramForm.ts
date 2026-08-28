"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  isEditableDraft,
  isUnderReview as isProgramUnderReview,
} from "@/lib/programs/draft-status";
import {
  useCreateProgramMutation,
  useGetProgramByIdQuery,
  useGetMyCompanyProgramByIdQuery,
  useSubmitProgramMutation,
  useUpdateProgramMutation,
} from "@/lib/redux/services/program/programsApi";
import type {
  Asset,
  ProgramState,
  RewardTier,
  SeverityLevel,
} from "@/lib/types/programs/types";
import type { ScopeTarget, ProgramType, ProgramVisibility } from "./types";

type RewardLevelKey = "critical" | "high" | "medium" | "low";

const rewardLevelBySeverity: Partial<Record<SeverityLevel, RewardLevelKey>> = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

const mapAssetType = (type: string): Asset["assetType"] => {
  if (type === "MOBILE") return "MOBILE_APP";
  if (type === "IP") return "IP_RANGE";
  if (type === "API") return "API";
  if (type === "OTHER") return "OTHER";
  return "URL";
};

const scopeTypeForAsset = (type: Asset["assetType"]): string => {
  if (type === "API") return "API";
  if (type === "MOBILE_APP") return "MOBILE";
  if (type === "IP_RANGE") return "IP";
  if (type === "OTHER" || type === "SOURCE_CODE" || type === "HARDWARE") {
    return "OTHER";
  }
  return "WEB";
};

const assetTypeForTarget = (target: ScopeTarget): Asset["assetType"] => {
  if (
    target.backendAssetType &&
    scopeTypeForAsset(target.backendAssetType) === target.type
  ) {
    return target.backendAssetType;
  }
  return mapAssetType(target.type);
};

export function useCreateProgramForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = searchParams.get("id") || searchParams.get("draftId");

  const [activeTab, setActiveTab] = useState<number>(1);

  // Form State
  const [programName, setProgramName] = useState("");
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState("");
  const [programType, setProgramType] = useState<ProgramType>("BOUNTY");
  const [visibility, setVisibility] = useState<ProgramVisibility>("PUBLIC");
  const [policy, setPolicy] = useState("");

  // Scope State
  const [inScopeTargets, setInScopeTargets] = useState<ScopeTarget[]>([
    { id: "1", type: "WEB", target: "*.example.com", description: "" },
    { id: "2", type: "API", target: "api.example.com/v2", description: "" },
  ]);
  const [outOfScopeTargets, setOutOfScopeTargets] = useState<ScopeTarget[]>([
    { id: "1", type: "WEB", target: "", description: "" },
  ]);

  // Rules State
  const [rulesOfEngagement, setRulesOfEngagement] = useState(
    "• Automated scanning is allowed up to 5 req/sec\n• DoS attacks are strictly prohibited\n• Social engineering is not allowed\n• Test only on your own test accounts",
  );
  const [excludedTypes, setExcludedTypes] = useState<string[]>([]);
  const [newExcludedInput, setNewExcludedInput] = useState("");
  const [pocRequirements, setPocRequirements] = useState(
    "• Step-by-step reproduction guide\n• The exact HTTP request / payload\n• Screenshot or video recording",
  );

  // Bounty / Reward Matrix State
  const [offerBounties, setOfferBounties] = useState(true);
  const [bountyMatrix, setBountyMatrix] = useState({
    critical: { min: "5000", max: "15000" },
    high: { min: "1000", max: "5000" },
    medium: { min: "250", max: "1000" },
    low: { min: "50", max: "250" },
  });

  const [pointsMatrix, setPointsMatrix] = useState({
    critical: { min: "80", max: "150" },
    high: { min: "40", max: "80" },
    medium: { min: "20", max: "40" },
    low: { min: "5", max: "20" },
  });
  const [rewardIds, setRewardIds] = useState<
    Partial<Record<RewardLevelKey, string>>
  >({});

  // RTK Query hooks
  const { data: publicProgram, isLoading: isFetchingPublic } = useGetProgramByIdQuery(
    programId || "",
    { skip: !programId, refetchOnMountOrArgChange: true }
  );

  const { data: companyProgram, isLoading: isFetchingCompany } = useGetMyCompanyProgramByIdQuery(
    programId || "",
    { skip: !programId, refetchOnMountOrArgChange: true }
  );

  const existingProgram = publicProgram || companyProgram;
  const isFetchingDraft = (isFetchingPublic && isFetchingCompany) || (!existingProgram && (isFetchingPublic || isFetchingCompany));

  const [createProgram, { isLoading: isCreating }] = useCreateProgramMutation();
  const [updateProgram, { isLoading: isUpdating }] = useUpdateProgramMutation();
  const [submitProgramForReview, { isLoading: isSubmitting }] =
    useSubmitProgramMutation();
  /* What is being edited decides what every save on this screen means. The
     test lives in `@/lib/programs/draft-status` because the Saved drafts list
     has to draw exactly the same line — a program this screen treats as a
     draft and that one does not is how a save ends with the author staring at
     a list their program was never going to appear in. */
  const isUnderReview = isProgramUnderReview(existingProgram);

  /** A new program is a draft by definition; an existing one has to qualify. */
  const isDraftProgram = existingProgram
    ? isEditableDraft(existingProgram)
    : true;

  /** An existing program still awaiting its first submission. */
  const isExistingDraft = Boolean(programId) && isDraftProgram;

  // Populate form fields with existing draft data when opened via SavedDraftCard
  /* eslint-disable react-hooks/set-state-in-effect -- The controlled multi-step form must hydrate when the async draft query resolves. */
  useEffect(() => {
    if (!existingProgram) return;

    if (existingProgram.name) setProgramName(existingProgram.name);
    if (existingProgram.handle) setHandle(existingProgram.handle);
    if (existingProgram.description) setDescription(existingProgram.description);
    if (existingProgram.engagementType) {
      setProgramType(existingProgram.engagementType === "RESPONSE" ? "RESPONSE" : "BOUNTY");
    }
    if (existingProgram.visibility) setVisibility(existingProgram.visibility);
    if (existingProgram.policy) setPolicy(existingProgram.policy);
    if (existingProgram.proofOfConceptRequirements) {
      if (typeof existingProgram.proofOfConceptRequirements === "string") {
        setPocRequirements(existingProgram.proofOfConceptRequirements);
      } else if (
        typeof existingProgram.proofOfConceptRequirements === "object" &&
        Array.isArray(
          (existingProgram.proofOfConceptRequirements as unknown as { rules?: string[] }).rules
        )
      ) {
        const rules = (existingProgram.proofOfConceptRequirements as unknown as { rules: string[] }).rules;
        setPocRequirements(
          rules.map((r) => (r.startsWith("•") ? r : `• ${r}`)).join("\n")
        );
      }
    }

    if (existingProgram.rulesOfEngagement?.rules?.length) {
      setRulesOfEngagement(
        existingProgram.rulesOfEngagement.rules
          .map((r) => (r.startsWith("•") ? r : `• ${r}`))
          .join("\n")
      );
    }

    if (existingProgram.exclusions?.rules?.length) {
      setExcludedTypes(existingProgram.exclusions.rules);
    }

    /* The step 4 checkbox is read two ways: cash on a bounty program, and
       reputation points on a response one. `offersBounties` upstream only ever
       means cash, so a response program's box is restored from whether its
       reward tiers carry points — reading the cash flag there would clear the
       box, and with it hide the points matrix, on every program that pays in
       points rather than money. */
    if (existingProgram.engagementType === "RESPONSE") {
      const rewards = existingProgram.rewards ?? [];
      setOfferBounties(
        rewards.length === 0 || rewards.some((reward) => (reward.points ?? 0) > 0),
      );
    } else if (typeof existingProgram.offersBounties === "boolean") {
      setOfferBounties(existingProgram.offersBounties);
    }

    if (existingProgram.minimumBounty !== undefined || existingProgram.maximumBounty !== undefined) {
      const minStr = (existingProgram.minimumBounty ?? 50).toString();
      const maxStr = (existingProgram.maximumBounty ?? 75000).toString();
      setBountyMatrix({
        critical: { min: "5000", max: maxStr },
        high: { min: "1000", max: "5000" },
        medium: { min: "250", max: "1000" },
        low: { min: minStr, max: "250" },
      });
    }

    const rawAssets = existingProgram.assets || existingProgram.inScopeAssets || [];
    if (rawAssets.length > 0) {
      const inScope: ScopeTarget[] = rawAssets
        .filter((a) => a.isInScope !== false)
        .map((a, i) => ({
          id: a.id || `in-${i}`,
          backendId: a.id,
          backendAssetType: a.assetType,
          type: scopeTypeForAsset(a.assetType),
          target: a.identifier || (a as { target?: string }).target || "",
          description: a.description || "",
          maxSeverity: a.maxSeverity,
        }));
      const outScope: ScopeTarget[] = rawAssets
        .filter((a) => a.isInScope === false)
        .map((a, i) => ({
          id: a.id || `out-${i}`,
          backendId: a.id,
          backendAssetType: a.assetType,
          type: scopeTypeForAsset(a.assetType),
          target: a.identifier || (a as { target?: string }).target || "",
          description: a.description || "",
          maxSeverity: a.maxSeverity,
        }));

      if (inScope.length > 0) setInScopeTargets(inScope);
      if (outScope.length > 0) setOutOfScopeTargets(outScope);
    }

    if (existingProgram.rewards?.length) {
      const nextRewardIds: Partial<Record<RewardLevelKey, string>> = {};

      setBountyMatrix((current) => {
        const next = { ...current };
        for (const reward of existingProgram.rewards) {
          const key = rewardLevelBySeverity[reward.severity];
          if (!key) continue;
          next[key] = {
            min: String(reward.minAmount ?? 0),
            max: String(reward.maxAmount ?? 0),
          };
          if (reward.id) nextRewardIds[key] = reward.id;
        }
        return next;
      });

      setPointsMatrix((current) => {
        const next = { ...current };
        for (const reward of existingProgram.rewards) {
          const key = rewardLevelBySeverity[reward.severity];
          if (!key) continue;
          next[key] = {
            ...next[key],
            max: String(reward.points ?? 0),
          };
        }
        return next;
      });

      setRewardIds(nextRewardIds);
    }

    // Auto-navigate to the last tab (Tab 4) so user can directly click Create Program
    setActiveTab(4);
  }, [existingProgram]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const formatHandle = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100);
  };

  const handleNameChange = (val: string) => {
    setProgramName(val);
    setHandle(formatHandle(val));
  };

  /**
   * Whether this program pays money.
   *
   * `offersBounties` upstream means cash and nothing else, but the step 4
   * checkbox it was wired to reads "offer reputation points" on a response
   * program, whose amounts are carried by `rewards[].points` instead. Sending
   * the checkbox straight through therefore declared that a response program
   * paid bounties while every cash figure in the payload was 0 — a combination
   * the backend has never stored, and the one it answered with a 500.
   */
  const paysCashBounties = programType !== "RESPONSE" && offerBounties;

  /**
   * A guideline block, or nothing at all.
   *
   * The upstream used to require every section on any save, so a draft had to
   * carry a description the author never wrote — and that invented text became
   * the policy researchers were bound by if they submitted without going back.
   * Absence is allowed now, so an unanswered section is omitted rather than
   * filled in on the author's behalf.
   */
  const buildRuleSection = (text: string, description: string) => {
    const rules = text
      .split(/\r?\n/)
      .map((line) => line.replace(/^[•\-\s]+/, "").trim())
      .filter(Boolean);

    if (rules.length === 0) return undefined;

    return { description, rules };
  };

  const buildAssets = useCallback((): Asset[] => {
    const inScopeAssets: Asset[] = inScopeTargets
      .filter((item) => item.target.trim() !== "")
      .map((item) => ({
        ...(item.backendId ? { id: item.backendId } : {}),
        assetType: assetTypeForTarget(item),
        identifier: item.target.trim(),
        description: item.description.trim() || item.target.trim(),
        isInScope: true,
        maxSeverity: item.maxSeverity ?? "MEDIUM",
      }));

    const outOfScopeAssets: Asset[] = outOfScopeTargets
      .filter((item) => item.target.trim() !== "")
      .map((item) => ({
        ...(item.backendId ? { id: item.backendId } : {}),
        assetType: assetTypeForTarget(item),
        identifier: item.target.trim(),
        description: item.description.trim() || item.target.trim(),
        isInScope: false,
        maxSeverity: item.maxSeverity ?? "LOW",
      }));

    return [...inScopeAssets, ...outOfScopeAssets];
  }, [inScopeTargets, outOfScopeTargets]);

  const buildRewards = (): RewardTier[] => {
    const levels: Array<{
      key: RewardLevelKey;
      severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    }> = [
      { key: "critical", severity: "CRITICAL" },
      { key: "high", severity: "HIGH" },
      { key: "medium", severity: "MEDIUM" },
      { key: "low", severity: "LOW" },
    ];

    return levels.map(({ key, severity }) => ({
      ...(rewardIds[key] ? { id: rewardIds[key] } : {}),
      severity,
      /* Gated on the same flag as the program-level figures: a response
         program that was started as a bounty one would otherwise keep the cash
         typed into the matrix before the switch. */
      minAmount: paysCashBounties ? parseInt(bountyMatrix[key].min || "0", 10) : 0,
      maxAmount: paysCashBounties ? parseInt(bountyMatrix[key].max || "0", 10) : 0,
      points: parseInt(pointsMatrix[key].max || "0", 10),
    }));
  };

  // Scope Handlers
  const addInScope = () => {
    setInScopeTargets([
      ...inScopeTargets,
      { id: Date.now().toString(), type: "WEB", target: "", description: "" },
    ]);
  };
  const removeInScope = (id: string) => {
    setInScopeTargets(inScopeTargets.filter((item) => item.id !== id));
  };

  const addOutOfScope = () => {
    setOutOfScopeTargets([
      ...outOfScopeTargets,
      { id: Date.now().toString(), type: "WEB", target: "", description: "" },
    ]);
  };
  const removeOutOfScope = (id: string) => {
    setOutOfScopeTargets(outOfScopeTargets.filter((item) => item.id !== id));
  };

  const handleAddExcludedType = () => {
    if (newExcludedInput.trim()) {
      setExcludedTypes([...excludedTypes, newExcludedInput.trim()]);
      setNewExcludedInput("");
    }
  };

  // Pre-flight reactive form validation checks
  const isHandleValid = useMemo(() => {
    const h = formatHandle(handle);
    return h.length >= 2 && h.length <= 100 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(h);
  }, [handle]);

  const isStep1Valid = useMemo(() => {
    const nameValid = programName.trim().length >= 2 && programName.trim().length <= 255;
    const descValid = description.trim().length >= 1;
    return nameValid && isHandleValid && descValid;
  }, [programName, isHandleValid, description]);

  /**
   * The least a draft needs to exist.
   *
   * Everything else on this form can be finished later, but a name and a
   * handle cannot: the name is the only thing distinguishing one row from
   * another under Saved drafts, and the handle becomes the program's URL for
   * the rest of its life. Saving without them used to substitute
   * "Untitled Draft Program" and the handle "draft-program", which claimed
   * that name for the first draft saved and then collided on the next.
   */
  const canSaveDraft = useMemo(
    () =>
      !isUnderReview &&
      programName.trim().length >= 2 &&
      programName.trim().length <= 255 &&
      isHandleValid,
    [isUnderReview, programName, isHandleValid],
  );

  const isStep2Valid = useMemo(() => {
    return buildAssets().length > 0;
  }, [buildAssets]);

  const isStep3Valid = useMemo(() => {
    const hasRules = rulesOfEngagement.trim().length >= 1;
    const hasExclusions = excludedTypes.length > 0 || newExcludedInput.trim().length > 0;
    return hasRules && hasExclusions;
  }, [rulesOfEngagement, excludedTypes, newExcludedInput]);

  const isFormValid = useMemo(() => {
    return isStep1Valid && isStep2Valid && isStep3Valid;
  }, [isStep1Valid, isStep2Valid, isStep3Valid]);

  const isNextDisabled = useMemo(() => {
    if (activeTab === 1) return !isStep1Valid;
    if (activeTab === 2) return !isStep2Valid;
    if (activeTab === 3) return !isStep3Valid;
    return false;
  }, [activeTab, isStep1Valid, isStep2Valid, isStep3Valid]);

  const submitProgram = async (isDraft = false) => {
    const trimmedName = programName.trim();
    const formattedHandle = formatHandle(handle);

    /* Nothing is saved while the reviewers hold it. Both buttons are disabled
       in that state, so this catches the paths that do not go through them —
       and it is the rule the rest of the screen is built on, which makes it
       worth stating once here rather than trusting the UI to enforce it. */
    if (isUnderReview) {
      toast.error(
        "This program is being reviewed. You can edit it again once the review is decided.",
      );
      return;
    }

    /* Identity first, and for a draft too — see `canSaveDraft`. The button is
       disabled without these, so reaching them means the form was submitted
       some other way. */
    if (trimmedName.length < 2 || trimmedName.length > 255) {
      toast.error("Program name must be between 2 and 255 characters.");
      setActiveTab(1);
      return;
    }

    /* The handle's length and pattern are the upstream's rules, checked live in
       step 1 and again on the write, which answers with the rule that refused
       it. A copy of the regex here only drifts the day the rule changes. */
    if (!formattedHandle) {
      toast.error("A program handle is required.");
      setActiveTab(1);
      return;
    }

    if (!isDraft) {
      if (!description.trim()) {
        toast.error("Program description is required.");
        setActiveTab(1);
        return;
      }

      const effectiveExcludedTypes = newExcludedInput.trim()
        ? [...excludedTypes, newExcludedInput.trim()]
        : excludedTypes;

      if (effectiveExcludedTypes.length === 0) {
        toast.error("Please add at least one exclusion rule.");
        setActiveTab(3);
        return;
      }

      if (buildAssets().length === 0) {
        toast.error("Please add at least one in-scope or out-of-scope asset.");
        setActiveTab(2);
        return;
      }
    }

    const effectiveExcludedTypes = newExcludedInput.trim()
      ? [...excludedTypes, newExcludedInput.trim()]
      : excludedTypes;

    const minimumBounty = paysCashBounties
      ? parseInt(bountyMatrix.low.min || "0", 10)
      : 0;
    const maximumBounty = paysCashBounties
      ? parseInt(bountyMatrix.critical.max || "0", 10)
      : 0;

    /* Claiming bounties while naming no amount is the same contradiction the
       response programs hit, so a finished submission is stopped here with the
       step to fix rather than sent for the backend to fail on. A draft is left
       alone — `offersBounties` below simply follows the numbers until the
       matrix is filled in. */
    if (!isDraft && paysCashBounties && maximumBounty <= 0) {
      toast.error(
        "Add a maximum bounty amount, or turn off financial bounties for this program.",
      );
      setActiveTab(4);
      return;
    }

    try {
      /* Only `handle` and `name` are required now, and the rest is sent only
         when the author actually wrote it. What used to sit here instead —
         a stand-in description, a paragraph of sandbox policy, `["DoS"]` as
         the exclusions — was fiction that persisted and could reach
         researchers as the real terms. An unanswered section is omitted; the
         submit call is what checks completeness. */
      const payload = {
        handle: formattedHandle,
        name: trimmedName,
        description: description.trim() || undefined,
        engagementType:
          programType === "RESPONSE" ? ("RESPONSE" as const) : ("BOUNTY" as const),
        visibility,
        policy: policy.trim() || undefined,
        proofOfConceptRequirements: buildRuleSection(
          pocRequirements,
          "Reports must contain complete details to allow our engineering team to quickly validate the issue."
        ),
        rulesOfEngagement: buildRuleSection(
          rulesOfEngagement,
          "Researchers must follow these operational guidelines during testing activities:"
        ),
        exclusions:
          effectiveExcludedTypes.length > 0
            ? {
                description:
                  "The following issue types are considered out-of-scope and non-rewardable:",
                rules: effectiveExcludedTypes,
              }
            : undefined,
        offersBounties: paysCashBounties && maximumBounty > 0,
        minimumBounty,
        maximumBounty,
        assets: buildAssets(),
        rewards: buildRewards(),
      };

      if (programId) {
        await updateProgram({ id: programId, body: payload }).unwrap();

        if (!isDraft && isExistingDraft) {
          await submitProgramForReview(programId).unwrap();
          toast.success("Program submitted for review!");
        } else {
          /* Only a program that is still a draft can be saved as one. On an
             approved or live program the same button is an ordinary edit, and
             saying "draft saved" there described something that had not
             happened — the update carries no state change with it. */
          toast.success(
            isDraft && isDraftProgram
              ? "Draft saved successfully!"
              : "Program updated successfully!",
          );
        }
      } else {
        /* `?submit=true` creates and enters review in one transaction. The old
           create-then-submit pair could fail on the second call and leave a
           draft the author was told had been submitted. */
        await createProgram({
          ...payload,
          ...(isDraft ? { state: "DRAFT" as ProgramState } : {}),
          submit: !isDraft,
        }).unwrap();

        toast.success(
          isDraft ? "Draft saved successfully!" : "Program submitted for review!",
        );
      }

      /* Land on the screen that actually lists what was just saved. Saved
         drafts only shows unsubmitted drafts, so sending an edit of a live or
         approved program there left the author staring at a list their program
         was never going to appear in. */
      if (isDraft && isDraftProgram) {
        router.push("/dashboard/saved-draft");
      } else {
        router.push("/dashboard/program-management");
      }
    } catch (error) {
      console.error("Save program failed", error);

      const apiError = error as FetchBaseQueryError & { data?: unknown };

      const parseValidationMessage = (): string => {
        if (typeof apiError.data === "string") return apiError.data;

        const dataObj = apiError.data as Record<string, unknown> | undefined;
        if (!dataObj) return "Unable to save program. Please try again.";

        const details = (dataObj.details ?? dataObj) as Record<string, unknown>;

        /* `violations` carries the constraint that refused the value and its
           parameters, so its wording is the rule itself rather than our
           paraphrase of it. Preferred over `errorDetails`, which is the same
           failures flattened to a field/message map. */
        const violations = (details?.violations ?? dataObj.violations) as
          | { field?: string; message?: string }[]
          | undefined;

        if (Array.isArray(violations) && violations.length > 0) {
          const spoken = violations
            .map((violation) => violation.message)
            .filter((message): message is string => Boolean(message));

          if (spoken.length > 0) return spoken.join(" ");
        }

        const errorDetails =
          (details?.errorDetails as Record<string, string> | undefined) ??
          (dataObj.errorDetails as Record<string, string> | undefined);

        if (errorDetails && typeof errorDetails === "object") {
          const detailMessages = Object.entries(errorDetails)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(" | ");
          if (detailMessages) return detailMessages;
        }

        const msg =
          typeof details?.message === "string"
            ? details.message
            : typeof dataObj.message === "string"
              ? dataObj.message
              : undefined;

        return (
          msg ||
          "Unable to save program. Please check your inputs and try again."
        );
      };

      const rawMessage = parseValidationMessage();
      toast.error(rawMessage);
    }
  };

  const handleCreateProgram = () => submitProgram(false);
  const handleSaveDraft = () => submitProgram(true);

  const getStepTip = () => {
    switch (activeTab) {
      case 1:
        return {
          title: "Crafting a Clear Title",
          text: "Choose a program name that clearly indicates the scope. Handles should be clean, unique, and lowercase.",
        };
      case 2:
        return {
          title: "Defining Scope Accurately",
          text: "Be explicit about wildcards (*.domain.com). Clearly state out-of-scope services to prevent invalid reports.",
        };
      case 3:
        return {
          title: "Clear Rules Build Trust",
          text: "Mention maximum request rates and forbidden test types clearly. Well-defined PoC requirements lead to better submissions.",
        };
      case 4:
        return {
          title: "Rewards Strategy",
          text:
            programType === "BOUNTY"
              ? "Competitive cash bounties attract top researchers. You can adjust your range anytime."
              : "Points-based programs track reputation for researchers on vulnerability disclosure programs.",
        };
      default:
        return { title: "", text: "" };
    }
  };

  const getRewardRange = () => {
    if (programType === "BOUNTY") {
      const minVal = parseInt(bountyMatrix.low.min || "0").toLocaleString();
      const maxVal = parseInt(
        bountyMatrix.critical.max || "0",
      ).toLocaleString();
      return `$${minVal} - $${maxVal}`;
    } else {
      const minVal = pointsMatrix.low.min || "0";
      const maxVal = pointsMatrix.critical.max || "0";
      return `${minVal} - ${maxVal} pts`;
    }
  };

  const activeInScope = useMemo(
    () => inScopeTargets.filter((t) => t.target.trim() !== ""),
    [inScopeTargets],
  );

  return {
    activeTab,
    setActiveTab,
    programName,
    setProgramName,
    handle,
    setHandle,
    description,
    setDescription,
    programType,
    setProgramType,
    visibility,
    setVisibility,
    policy,
    setPolicy,
    inScopeTargets,
    setInScopeTargets,
    outOfScopeTargets,
    setOutOfScopeTargets,
    rulesOfEngagement,
    setRulesOfEngagement,
    excludedTypes,
    setExcludedTypes,
    newExcludedInput,
    setNewExcludedInput,
    pocRequirements,
    setPocRequirements,
    offerBounties,
    setOfferBounties,
    bountyMatrix,
    setBountyMatrix,
    pointsMatrix,
    setPointsMatrix,
    isCreating:
      isCreating || isUpdating || isSubmitting || isFetchingDraft,
    isSubmitting,
    isFetchingDraft,
    isEditingDraft: Boolean(programId),
    /* The handle check needs it: editing a program must not report that
       program's own handle as taken. */
    programId,
    isExistingDraft,
    isFormValid,
    isNextDisabled,
    canSaveDraft,
    isDraftProgram,
    isUnderReview,
    formatHandle,
    handleNameChange,
    addInScope,
    removeInScope,
    addOutOfScope,
    removeOutOfScope,
    handleAddExcludedType,
    handleCreateProgram,
    handleSaveDraft,
    getStepTip,
    getRewardRange,
    activeInScope,
  };
}
