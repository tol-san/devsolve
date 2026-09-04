"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  useCreateSolutionDraftMutation,
  useDeleteSolutionDraftMutation,
  useGetSolutionDraftsQuery,
  useUpdateSolutionDraftMutation,
} from "@/lib/redux/services/solutionDraftsApi";
import type {
  SolutionDraftResponse,
  SaveSolutionDraftValues,
} from "@/lib/validations/solution-draft";
import { apiErrorMessage } from "@/lib/api/error-message";

const DEBOUNCE_MS = 1500;

export interface ServerSolutionDraftState {
  available: SolutionDraftResponse | null;
  savedAt: string | null;
  isSaving: boolean;
  error: string | null;
  take: () => SolutionDraftResponse | null;
  discard: () => Promise<void>;
  saveNow: () => Promise<boolean>;
  clear: () => Promise<void>;
  draftId: string | null;
}

/**
 * Autosaves a problem's solution draft to the server and offers back anything unfinished.
 */
export function useServerSolutionDraft({
  problemId,
  values,
  enabled,
  isDirty,
  resumeId,
}: {
  problemId: string;
  values: SaveSolutionDraftValues;
  enabled: boolean;
  isDirty: boolean;
  resumeId?: string;
}): ServerSolutionDraftState {
  const [createDraft] = useCreateSolutionDraftMutation();
  const [updateDraft] = useUpdateSolutionDraftMutation();
  const [deleteDraft] = useDeleteSolutionDraftMutation();

  const { data: drafts = [] } = useGetSolutionDraftsQuery(
    { problemId },
    {
      skip: !problemId || !enabled,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    },
  );

  const [available, setAvailable] = useState<SolutionDraftResponse | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draftId = useRef<string | null>(resumeId ?? null);
  const creating = useRef(false);
  const offered = useRef<string | null>(null);
  const latest = useRef(values);
  latest.current = values;
  const lastSaved = useRef<string>("");
  const reqSeq = useRef(0);

  useEffect(() => {
    if (!problemId || !enabled || offered.current === problemId) return;
    const found = drafts[0];
    if (!found) return;
    offered.current = problemId;
    if (draftId.current || resumeId) return;
    setAvailable(found);
  }, [drafts, problemId, enabled, resumeId]);

  const persist = useCallback(async (): Promise<boolean> => {
    if (!problemId || !enabled) return false;
    const hasAnyContent = Boolean(
      latest.current.summary?.trim() ||
        latest.current.bodyMarkdown?.trim() ||
        latest.current.approachType ||
        latest.current.tradeoffs?.trim() ||
        (latest.current.verificationSteps && latest.current.verificationSteps.length > 0) ||
        (latest.current.testedWith && latest.current.testedWith.length > 0) ||
        (latest.current.resources && latest.current.resources.length > 0),
    );
    if (!hasAnyContent && !draftId.current && !resumeId) return false;

    const payload = JSON.stringify(latest.current);
    if (payload === lastSaved.current) return false;

    const currentSeq = ++reqSeq.current;
    setIsSaving(true);
    setError(null);
    const existing = draftId.current || resumeId || null;

    try {
      if (existing) {
        const saved = await updateDraft({
          id: existing,
          body: latest.current,
        }).unwrap();
        if (currentSeq !== reqSeq.current) return false;
        draftId.current = existing;
        lastSaved.current = payload;
        setSavedAt(saved.updatedAt ?? new Date().toISOString());
        return true;
      } else if (!creating.current) {
        creating.current = true;
        try {
          const created = await createDraft({
            problemId,
            body: latest.current,
          }).unwrap();
          if (currentSeq !== reqSeq.current) return false;
          draftId.current = created.id;
          lastSaved.current = payload;
          setSavedAt(created.updatedAt ?? new Date().toISOString());
          return true;
        } finally {
          creating.current = false;
        }
      }
      return false;
    } catch (err) {
      if (currentSeq !== reqSeq.current) return false;
      setError(
        apiErrorMessage(err, "Could not save your draft. Retrying as you type."),
      );
      return false;
    } finally {
      if (currentSeq === reqSeq.current) {
        setIsSaving(false);
      }
    }
  }, [createDraft, enabled, problemId, resumeId, updateDraft]);

  const serialised = JSON.stringify(values);

  useEffect(() => {
    if (!enabled || !isDirty || !problemId) return;
    if (available) return;

    const timer = setTimeout(() => void persist(), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [serialised, enabled, isDirty, problemId, available, persist]);

  const take = useCallback(() => {
    const found = available;
    if (found) draftId.current = found.id;
    setAvailable(null);
    return found;
  }, [available]);

  const discard = useCallback(async () => {
    const found = available;
    setAvailable(null);
    if (!found) return;
    try {
      await deleteDraft(found.id).unwrap();
    } catch {
      // Harmless if already gone
    }
  }, [available, deleteDraft]);

  const saveNow = useCallback(async () => {
    setAvailable(null);
    return persist();
  }, [persist]);

  const clear = useCallback(async () => {
    const id = draftId.current || resumeId || null;
    draftId.current = null;
    setAvailable(null);
    setSavedAt(null);
    if (!id) return;
    try {
      await deleteDraft(id).unwrap();
    } catch {
      // Submitting may already have consumed it
    }
  }, [deleteDraft, resumeId]);

  return {
    available,
    savedAt,
    isSaving,
    error,
    take,
    discard,
    saveNow,
    clear,
    draftId: draftId.current,
  };
}
