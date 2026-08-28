"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  FileText,
  Target,
  BookOpen,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Save,
} from "lucide-react";
import { RequireOrgPermission } from "@/components/auth/RequireOrgPermission";
import { Button } from "@/components/ui/button";
import { CreateProgramHeader } from "@/components/create-program/CreateProgramHeader";
import { CreateProgramStepper } from "@/components/create-program/CreateProgramStepper";
import { Step1BasicInfo } from "@/components/create-program/Step1BasicInfo";
import { Step2Scope } from "@/components/create-program/Step2Scope";
import { Step3Rules } from "@/components/create-program/Step3Rules";
import { Step4BountyMatrix } from "@/components/create-program/Step4BountyMatrix";
import { CreateProgramPreview } from "@/components/create-program/CreateProgramPreview";
import { CreateProgramChecklist } from "@/components/create-program/CreateProgramChecklist";
import { CreateProgramTipCard } from "@/components/create-program/CreateProgramTipCard";
import { useCreateProgramForm } from "@/components/create-program/useCreateProgramForm";

function CreateProgramContent() {
  const {
    activeTab,
    setActiveTab,
    programName,
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
    isCreating,
    isSubmitting,
    isFetchingDraft,
    isEditingDraft,
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
  } = useCreateProgramForm();

  const steps = [
    { id: 1, label: "Basic Info", icon: FileText },
    { id: 2, label: "Scope", icon: Target },
    { id: 3, label: "Rules", icon: BookOpen },
    { id: 4, label: "Bounty Matrix", icon: DollarSign },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      {/* PAGE HEADER & BREADCRUMB */}
      <CreateProgramHeader isEditing={isEditingDraft} />

      {/* A program with the reviewers is read-only until they answer: saving
          over it would change what is being reviewed underneath them. Both
          save buttons are disabled, so the reason is stated once here rather
          than left to a tooltip nobody hovers. */}
      {isUnderReview ? (
        <div className="flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/5 dark:ring-foreground/10 sm:items-center">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <Clock3 className="size-4.5" />
          </span>
          <p className="text-sm leading-6 text-muted-foreground">
            This program has been submitted and is awaiting review, so it cannot
            be edited right now.{" "}
            <Link
              href="/dashboard/program-management"
              className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Track its review
            </Link>{" "}
            in program management.
          </p>
        </div>
      ) : null}

      {/* STEPPER TABS */}
      <CreateProgramStepper
        steps={steps}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT 2 COLUMNS: FORM STEPS */}
        <div className="lg:col-span-2 p-6 sm:p-8 bg-card text-card-foreground rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs space-y-6">
          {activeTab === 1 && (
            <Step1BasicInfo
              programName={programName}
              handle={handle}
              description={description}
              programType={programType}
              visibility={visibility}
              policy={policy}
              onNameChange={handleNameChange}
              setHandle={setHandle}
              setDescription={setDescription}
              setProgramType={setProgramType}
              setVisibility={setVisibility}
              setPolicy={setPolicy}
              formatHandle={formatHandle}
            />
          )}

          {activeTab === 2 && (
            <Step2Scope
              inScopeTargets={inScopeTargets}
              outOfScopeTargets={outOfScopeTargets}
              setInScopeTargets={setInScopeTargets}
              setOutOfScopeTargets={setOutOfScopeTargets}
              addInScope={addInScope}
              removeInScope={removeInScope}
              addOutOfScope={addOutOfScope}
              removeOutOfScope={removeOutOfScope}
            />
          )}

          {activeTab === 3 && (
            <Step3Rules
              rulesOfEngagement={rulesOfEngagement}
              setRulesOfEngagement={setRulesOfEngagement}
              excludedTypes={excludedTypes}
              setExcludedTypes={setExcludedTypes}
              newExcludedInput={newExcludedInput}
              setNewExcludedInput={setNewExcludedInput}
              handleAddExcludedType={handleAddExcludedType}
              pocRequirements={pocRequirements}
              setPocRequirements={setPocRequirements}
            />
          )}

          {activeTab === 4 && (
            <Step4BountyMatrix
              programType={programType}
              offerBounties={offerBounties}
              setOfferBounties={setOfferBounties}
              bountyMatrix={bountyMatrix}
              setBountyMatrix={setBountyMatrix}
              pointsMatrix={pointsMatrix}
              setPointsMatrix={setPointsMatrix}
            />
          )}

          {/* FOOTER NAVIGATION BUTTONS */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={activeTab === 1}
              onClick={() => setActiveTab(Math.max(activeTab - 1, 1))}
              className="rounded-xl border-border bg-card text-foreground font-semibold text-sm h-11 px-5 cursor-pointer hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4 mr-1.5" />
              Previous
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                /* Saving while the program is still loading would write the
                   form's empty defaults over it. */
                disabled={isCreating || isFetchingDraft || !canSaveDraft}
                /* Disabled buttons cannot say why on their own, and there are
                   two separate reasons to be disabled here. */
                title={
                  isUnderReview
                    ? "This program is being reviewed and cannot be edited"
                    : canSaveDraft
                      ? undefined
                      : "Add a program name and handle before saving a draft"
                }
                className="rounded-xl border-border bg-card text-foreground font-semibold text-sm h-11 px-5 gap-2 cursor-pointer hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-muted-foreground" />
                {/* An approved or live program is no longer a draft, so saving
                    it is an edit and says so. */}
                {isDraftProgram ? "Save as Draft" : "Save Changes"}
              </Button>

              {activeTab < 4 ? (
                <Button
                  type="button"
                  onClick={() => setActiveTab(Math.min(activeTab + 1, 4))}
                  disabled={isNextDisabled}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm h-11 px-6 gap-1.5 cursor-pointer dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleCreateProgram}
                  disabled={
                    !isFormValid || isCreating || isFetchingDraft || isUnderReview
                  }
                  title={
                    isUnderReview
                      ? "This program is being reviewed and cannot be edited"
                      : undefined
                  }
                  size="lg"
                  className="rounded-xl"
                >
                  {isCreating
                    ? isSubmitting
                      ? "Submitting..."
                      : isEditingDraft
                        ? "Updating..."
                        : "Creating..."
                    : isExistingDraft
                      ? "Submit for Review"
                      : isEditingDraft
                        ? "Update Program"
                        : "Submit for Review"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT 1 COLUMN: LIVE PREVIEW & GUIDANCE SIDEBAR */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <CreateProgramPreview
            programName={programName}
            description={description}
            programType={programType}
            activeInScope={activeInScope}
            getRewardRange={getRewardRange}
          />

          <CreateProgramChecklist
            steps={steps}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <CreateProgramTipCard tip={getStepTip()} />
        </div>
      </div>
    </motion.div>
  );
}

export default function CreateProgramPage() {
  return (
    <RequireOrgPermission
      permission="CREATE_PROGRAM"
      title="You cannot create programs here"
      description="Opening a new bounty or disclosure program needs the “Create programs” permission in this organization. An owner or manager can grant it from team management."
      action={{ href: "/dashboard/program-management", label: "See the programs" }}
    >
      <Suspense
        fallback={
          <div className="w-full space-y-6 pb-12 animate-pulse">
            <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800" />
            <div className="h-64 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800" />
          </div>
        }
      >
        <CreateProgramContent />
      </Suspense>
    </RequireOrgPermission>
  );
}
