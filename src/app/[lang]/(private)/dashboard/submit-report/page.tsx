"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Zap } from "lucide-react";

import { useSubmitReportForm } from "@/components/reports/hooks/useSubmitReportForm";
import { SubmitReportProgressNav } from "@/components/reports/SubmitReportProgressNav";
import { SubmitReportProgramCard } from "@/components/reports/SubmitReportProgramCard";
import { SubmitReportSeverityCard } from "@/components/reports/SubmitReportSeverityCard";
import { SubmitReportQuickTips } from "@/components/reports/SubmitReportQuickTips";

import { SubmitReportStep1Basics } from "@/components/reports/SubmitReportStep1Basics";
import { SubmitReportStep2Poc } from "@/components/reports/SubmitReportStep2Poc";
import { ReportSuccessModal } from "@/components/reports/ReportSuccessModal";
import {
  DraftStatus,
  ResumeDraftBanner,
} from "@/components/reports/ResumeDraftBanner";
import { ReportingAccessNotice } from "@/components/researchers/ReportingAccessNotice";

function SubmitReportContent() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    errors,
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
    handleInsertTemplate,
    handleSaveDraft,
    handleResetForm,
    onSubmit,
  } = useSubmitReportForm();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 sm:space-y-8 w-full pb-12 font-sans"
    >
      {draft.available ? (
        <ResumeDraftBanner
          draft={draft.available}
          onResume={restoreDraft}
          onDiscard={() => void draft.discard()}
        />
      ) : null}

      <div className="space-y-4">
        <nav aria-label="Back Navigation">
          <Link
            href="/dashboard/programs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Programs</span>
          </Link>
        </nav>

        <div className="bg-card rounded-2xl border border-border p-5 sm:p-7 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                Submit Vulnerability Report
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl font-medium">
              Submit structured findings, technical evidence, and reproduction steps directly to the security triage team.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <ReportingAccessNotice
            access={reportingAccess}
            isLoading={isAccessLoading}
            blockedMessage={accessBlockedMessage}
          />

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="bg-card rounded-2xl border border-border p-4 sm:p-6 md:p-8 shadow-xs"
              >
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <SubmitReportStep1Basics
                      register={register}
                      errors={errors}
                      setValue={setValue}
                      watch={watch}
                      programs={programs}
                      isLoading={isProgramsLoading}
                      selectedProgram={selectedProgram}
                    />

                    <div className="pt-4 border-t border-border flex justify-end">
                      <button
                        type="button"
                        onClick={nextStep}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 dark:hover:bg-muted transition-colors shadow-xs cursor-pointer"
                      >
                        <span>Next: PoC & Submit</span>
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <SubmitReportStep2Poc
                    register={register}
                    control={control}
                    errors={errors}
                    attachedFiles={attachedFiles}
                    externalLinks={externalLinks}
                    linkErrors={linkErrors}
                    referenceLinksError={referenceLinksError}
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                    isDraftSaved={isDraftSaved}
                    canSubmitReport={canSubmitReport}
                    draftStatus={
                      <DraftStatus
                        isSaving={draft.isSaving}
                        savedAt={draft.savedAt}
                        error={draft.error}
                      />
                    }
                    onAddFiles={handleAddFiles}
                    onRemoveFile={handleRemoveFile}
                    onAddExternalLink={handleAddExternalLink}
                    onRemoveExternalLink={handleRemoveExternalLink}
                    onUpdateExternalLink={handleUpdateExternalLink}
                    onInsertTemplate={handleInsertTemplate}
                    onPrevStep={prevStep}
                    onSaveDraft={handleSaveDraft}
                    onSubmitReport={handleSubmit(onSubmit)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </form>
        </div>

        <div className="space-y-6 lg:sticky lg:top-8">
          <SubmitReportProgressNav
            currentStep={currentStep}
            completedSteps={completedSteps}
            onSelectStep={goToStep}
          />

          <SubmitReportProgramCard program={selectedProgram} />

          <SubmitReportSeverityCard
            severity={selectedSeverity as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO"}
            program={selectedProgram}
          />

          <SubmitReportQuickTips />
        </div>
      </div>

      <ReportSuccessModal
        isOpen={successModalData.isOpen}
        reportId={successModalData.reportId}
        programName={successModalData.programName}
        title={successModalData.title}
        submittedAt={successModalData.submittedAt}
        attachmentWarning={successModalData.attachmentWarning}
        onReset={handleResetForm}
      />
    </motion.div>
  );
}

export default function SubmitReportPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-muted-foreground animate-pulse font-medium">
          Loading vulnerability submission wizard...
        </div>
      }
    >
      <SubmitReportContent />
    </Suspense>
  );
}
