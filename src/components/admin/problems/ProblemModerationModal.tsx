"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProblemResponse, ProblemStatus } from "@/lib/types/admin/problemAdminTypes";
import { FileText, CheckCircle2, XCircle, User, Calendar, Cpu, Tag } from "lucide-react";
import { toast } from "sonner";
import { authorNameOf } from "@/lib/discussions/format";

interface ProblemModerationModalProps {
  selectedProblem: ProblemResponse | null;
  onClose: () => void;
  onModerate: (id: string, status: ProblemStatus) => Promise<void>;
}

export const ProblemModerationModal: React.FC<ProblemModerationModalProps> = ({
  selectedProblem,
  onClose,
  onModerate,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedProblem) return null;

  const handleAction = async (status: ProblemStatus) => {
    try {
      setIsSubmitting(true);
      await onModerate(selectedProblem.id, status);
      toast.success(
        status === "PUBLISHED"
          ? `Problem "${selectedProblem.title}" approved and published!`
          : `Problem "${selectedProblem.title}" rejected.`
      );
      onClose();
    } catch (err) {
      toast.error("Failed to update problem moderation status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={!!selectedProblem} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-md text-[10px] font-bold uppercase tracking-wider">
              {selectedProblem.sdlcPhase || "SDLC Phase"}
            </Badge>
            <Badge variant="outline" className="rounded-md text-[10px] font-semibold">
              {selectedProblem.category?.name || "General"}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 pt-1">
            {selectedProblem.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            Review problem content, code context, and tags before publishing to platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 font-medium">Author:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {authorNameOf(selectedProblem.author, "Anonymous")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 font-medium">Submitted:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {selectedProblem.createdAt
                  ? new Date(selectedProblem.createdAt).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </div>

          {((selectedProblem.technologies && selectedProblem.technologies.length > 0) ||
            (selectedProblem.tags && selectedProblem.tags.length > 0)) && (
            <div className="space-y-2">
              {selectedProblem.technologies && selectedProblem.technologies.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {selectedProblem.technologies.map((t, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="rounded-lg text-[10px] font-mono border-slate-300 dark:border-slate-700"
                    >
                      {t.name} {t.version ? `v${t.version}` : ""}
                    </Badge>
                  ))}
                </div>
              )}
              {selectedProblem.tags && selectedProblem.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {selectedProblem.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      className="rounded-lg text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                    >
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Problem Description
            </h4>
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {selectedProblem.description || "No description provided."}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-2">
          <Button
            variant="destructive"
            disabled={isSubmitting}
            onClick={() => handleAction("REJECTED")}
            className="rounded-xl font-semibold h-10 cursor-pointer w-full sm:w-auto text-sm"
          >
            <XCircle className="w-4 h-4 mr-1.5" />
            Reject Problem
          </Button>

          <Button
            disabled={isSubmitting}
            onClick={() => handleAction("PUBLISHED")}
            className="rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white h-10 cursor-pointer w-full sm:w-auto text-sm shadow-2xs"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Approve & Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
