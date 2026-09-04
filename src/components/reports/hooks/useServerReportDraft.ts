"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  useCreateReportDraftMutation,
  useDeleteReportDraftMutation,
  useGetReportDraftsQuery,
  useUpdateReportDraftMutation,
} from "@/lib/redux/services/reportDraftsApi";
import type {
  ReportDraftResponse,
  SaveReportDraftValues,
} from "@/lib/validations/report-draft";
import { apiErrorMessage } from "@/lib/api/error-message";

const DEBOUNCE_MS = 1500;

export interface ServerDraftState {
  available: ReportDraftResponse | null;
  savedAt: string | null;
  isSaving: boolean;
  error: string | null;
  take: () => ReportDraftResponse | null;
  discard: () => Promise<void>;
  saveNow: () => Promise<boolean>;
  clear: () => Promise<void>;
  draftId: string | null;
}

export function useServerReportDraft({
  programId,
  values,
  enabled,
  isDirty,
  resumeId,
}: {
  programId: string;
  values: SaveReportDraftValues;
  enabled: boolean;
  isDirty: boolean;
  resumeId?: string;
}): ServerDraftState {
  const [createDraft] = useCreateReportDraftMutation();
  const [updateDraft] = useUpdateReportDraftMutation();
  const [deleteDraft] = useDeleteReportDraftMutation();

  const { data: drafts = [] } = useGetReportDraftsQuery(
    { programId },
    {
      skip: !programId,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    },
  );

  const [available, setAvailable] = useState<ReportDraftResponse | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draftId = useRef<string | null>(null);
  const creating = useRef(false);
  const offered = useRef<string | null>(null);
  const latest = useRef(values);
  latest.current = values;
  const lastSaved = useRef<string>("");
  const reqSeq = useRef(0);

  useEffect(() => {
    if (!programId || offered.current === programId) return;
    const found = drafts[0];
    if (!found) return;
    offered.current = programId;
    if (draftId.current || resumeId) return;
    setAvailable(found);
  }, [drafts, programId, resumeId]);

  const persist = useCallback(async (): Promise<boolean> => {
    if (!programId) return false;

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
            programId,
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
  }, [createDraft, programId, resumeId, updateDraft]);

  const serialised = JSON.stringify(values);

  useEffect(() => {
    if (!enabled || !isDirty || !programId) return;
    if (available) return;

    const timer = setTimeout(() => void persist(), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [serialised, enabled, isDirty, programId, available, persist]);

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
      /* Already gone, or the service is down. Either way it is no longer
         offered, and a stale row is harmless. */
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
      /* Submitting may already have consumed it. */
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
