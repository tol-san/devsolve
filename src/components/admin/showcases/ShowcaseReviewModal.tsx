"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Code2,
  Video,
  Layers,
  History,
  Loader2,
  AlertCircle,
  User,
  Calendar,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import {
  useGetShowcaseReviewDetailQuery,
  useGetShowcaseReviewHistoryQuery,
  useUpdateShowcaseReviewStatusMutation,
} from "@/lib/redux/services/admin/showcaseReviewApi";

interface ShowcaseReviewModalProps {
  showcaseId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ShowcaseReviewModal({
  showcaseId,
  isOpen,
  onClose,
}: ShowcaseReviewModalProps) {
  const [activeTab, setActiveTab] = useState<"detail" | "history">("detail");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const { data: detail, isLoading: isLoadingDetail } =
    useGetShowcaseReviewDetailQuery(showcaseId ?? "", {
      skip: !showcaseId || !isOpen,
    });

  const { data: historyData, isLoading: isLoadingHistory } =
    useGetShowcaseReviewHistoryQuery(
      { id: showcaseId ?? "" },
      { skip: !showcaseId || !isOpen }
    );

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateShowcaseReviewStatusMutation();

  if (!isOpen || !showcaseId) return null;

  const handleApprove = async () => {
    try {
      await updateStatus({
        id: showcaseId,
        body: { reviewStatus: "APPROVED" },
      }).unwrap();
      toast.success("Showcase submission approved successfully!");
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to approve showcase.";
      toast.error(msg);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error("A rejection reason is required.");
      return;
    }
    try {
      await updateStatus({
        id: showcaseId,
        body: {
          reviewStatus: "REJECTED",
          rejectionReason: rejectionReason.trim(),
        },
      }).unwrap();
      toast.success("Showcase submission rejected.");
      setRejectionReason("");
      setIsRejecting(false);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to reject showcase.";
      toast.error(msg);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 text-xs font-bold">
            APPROVED
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 text-xs font-bold">
            REJECTED
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 text-xs font-bold">
            PENDING
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
        <DialogHeader className="space-y-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Submission Review
              </span>
              {detail && getStatusBadge(detail.reviewStatus)}
              {detail?.submissionType && (
                <Badge variant="outline" className="text-xs font-semibold">
                  {detail.submissionType}
                </Badge>
              )}
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {detail?.title || "Showcase Submission Review"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-4">
            {detail?.authorName && (
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <User className="size-3.5 text-slate-400" />
                Author: {detail.authorName}
              </span>
            )}
            {detail?.submittedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5 text-slate-400" />
                Submitted: {new Date(detail.submittedAt).toLocaleDateString()}
              </span>
            )}
            {detail?.categoryName && (
              <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[11px]">
                {detail.categoryName}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "detail" | "history")}
          className="w-full mt-2"
        >
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1">
            <TabsTrigger value="detail" className="text-xs font-bold rounded-lg cursor-pointer flex items-center gap-2">
              <Layers className="size-3.5" />
              Submission Details
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs font-bold rounded-lg cursor-pointer flex items-center gap-2">
              <History className="size-3.5" />
              Review History ({historyData?.content?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SUBMISSION DETAIL */}
          <TabsContent value="detail" className="space-y-4 pt-3">
            {isLoadingDetail ? (
              <div className="space-y-3 animate-pulse py-6">
                <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            ) : detail ? (
              <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                {/* Cover Image */}
                {detail.coverImageUrl && (
                  <div
                    onClick={() =>
                      setPreviewImage({
                        url: detail.coverImageUrl!,
                        title: `${detail.title} - Cover`,
                      })
                    }
                    className="group relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 cursor-pointer"
                    title="Click to view full cover image"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={detail.coverImageUrl}
                      alt={detail.title}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                    <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1 rounded-lg border border-white/20 bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100 shadow-md">
                      <ZoomIn className="size-3" />
                      <span>Preview</span>
                    </div>
                  </div>
                )}

                {/* Overview */}
                <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Overview
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {detail.overview}
                  </p>
                </div>

                {/* Links (Live, Repo, Video) */}
                <div className="flex flex-wrap items-center gap-2">
                  {detail.liveUrl && (
                    <a
                      href={detail.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline border border-blue-200 dark:border-blue-800"
                    >
                      <ExternalLink className="size-3.5" /> Live Demo
                    </a>
                  )}
                  {detail.repoUrl && (
                    <a
                      href={detail.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:underline border border-slate-200 dark:border-slate-700"
                    >
                      <Code2 className="size-3.5" /> Code Repository
                    </a>
                  )}
                  {detail.videoUrl && (
                    <a
                      href={detail.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-xs font-bold hover:underline border border-purple-200 dark:border-purple-800"
                    >
                      <Video className="size-3.5" /> Video Overview
                    </a>
                  )}
                </div>

                {/* Steps Section */}
                {detail.steps && detail.steps.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Showcase Implementation Steps ({detail.steps.length})
                    </h4>
                    <div className="space-y-3">
                      {detail.steps.map((step, idx) => (
                        <div
                          key={step.id || idx}
                          className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="size-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                              {step.stepNumber || idx + 1}
                            </span>
                            <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {step.title}
                            </h5>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-8">
                            {step.description}
                          </p>
                          {step.codeSnippet && (
                            <pre className="mt-2 p-3 rounded-lg bg-slate-900 text-slate-100 text-xs overflow-x-auto font-mono">
                              <code>{step.codeSnippet}</code>
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing Rejection Reason */}
                {detail.rejectionReason && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold text-xs">
                      <AlertCircle className="size-4" />
                      Previous Rejection Reason:
                    </div>
                    <p className="text-xs text-rose-800 dark:text-rose-200 pl-5">
                      {detail.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4">
                Unable to load showcase submission details.
              </p>
            )}
          </TabsContent>

          {/* TAB 2: REVIEW HISTORY */}
          <TabsContent value="history" className="pt-3">
            {isLoadingHistory ? (
              <div className="space-y-2 animate-pulse py-4">
                <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            ) : historyData?.content && historyData.content.length > 0 ? (
              <div className="space-y-3">
                {historyData.content.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(entry.reviewStatus)}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {entry.submissionType}
                        </span>
                      </div>
                      <span className="text-slate-400">
                        {entry.reviewedAt
                          ? new Date(entry.reviewedAt).toLocaleString()
                          : new Date(entry.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    {entry.reviewStatus === "APPROVED" && !entry.reviewedBy ? (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span>Reviewed by:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          Auto-approved
                        </span>
                      </p>
                    ) : entry.reviewedBy ? (
                      <p className="text-xs text-slate-500">
                        Reviewed by: <span className="font-semibold">{entry.reviewedBy}</span>
                      </p>
                    ) : null}
                    {entry.rejectionReason && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                        Reason: {entry.rejectionReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No past review decisions recorded for this submission.
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Rejection Form Input */}
        {isRejecting && (
          <form onSubmit={handleReject} className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-rose-600 dark:text-rose-400">
                Reason for Rejection <span className="text-rose-500">*</span>
              </Label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain clearly to the author why this showcase was rejected..."
                rows={3}
                required
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-950 border border-rose-300 dark:border-rose-900 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsRejecting(false)}
                className="h-8 text-xs rounded-xl"
              >
                Cancel Rejection
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="h-8 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                {isUpdating ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <XCircle className="size-3.5 mr-1" />}
                Confirm Rejection
              </Button>
            </div>
          </form>
        )}

        {/* Footer Actions */}
        {!isRejecting && (
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center gap-2 pt-4 border-t border-slate-200/80 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl h-9 text-xs font-semibold border-slate-300 dark:border-slate-700 cursor-pointer w-full sm:w-auto"
            >
              Close
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRejecting(true)}
                disabled={isUpdating}
                className="rounded-xl h-9 text-xs font-bold border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer flex-1 sm:flex-initial"
              >
                <XCircle className="size-4 mr-1.5" />
                Reject Submission
              </Button>
              <Button
                type="button"
                onClick={handleApprove}
                disabled={isUpdating}
                className="rounded-xl h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs flex-1 sm:flex-initial"
              >
                {isUpdating ? (
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                ) : (
                  <CheckCircle2 className="size-4 mr-1.5" />
                )}
                Approve Submission
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>

      <ImagePreviewModal
        src={previewImage?.url ?? null}
        alt={previewImage?.title ?? "Showcase image"}
        title={previewImage?.title}
        isOpen={previewImage !== null}
        onClose={() => setPreviewImage(null)}
      />
    </Dialog>
  );
}
