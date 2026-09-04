"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useCreateProblemDraftMutation,
  useUpdateProblemMutation,
  type ProblemResponse,
} from "@/lib/redux/services/problemsApi";
import type { CreateProblemRequest } from "@/lib/validations/problem";
import { apiErrorMessage } from "@/lib/api/error-message";

const DEBOUNCE_MS = 1500;

export interface ServerProblemDraftState {
  savedAt: string | null;
  isSaving: boolean;
  error: string | null;
  saveNow: () => Promise<boolean>;
  activeDraft: ProblemResponse | null;
  setActiveDraft: (draft: ProblemResponse | null) => void;
  clear: () => void;
}

export function useServerProblemDraft({
  values,
  enabled,
  isDirty,
  initialDraft,
}: {
  values: CreateProblemRequest;
  enabled: boolean;
  isDirty: boolean;
  initialDraft?: ProblemResponse | null;
}): ServerProblemDraftState {
  const [createDraft] = useCreateProblemDraftMutation();
  const [updateProblem] = useUpdateProblemMutation();

  const [activeDraft, setActiveDraft] = useState<ProblemResponse | null>(
    initialDraft ?? null,
  );
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const creating = useRef(false);
  const latest = useRef(values);
  latest.current = values;
  const currentDraft = useRef<ProblemResponse | null>(activeDraft);
  currentDraft.current = activeDraft;
  const lastSaved = useRef<string>("");

  const hasMinimumRequirements = useCallback((): boolean => {
    const v = latest.current;
    if (!v.title || v.title.trim().length < 10) return false;
    if (!v.categoryId) return false;
    if (!v.problemType) return false;
    if (!v.description || v.description.trim().length < 30) return false;
    return true;
  }, []);

  const persist = useCallback(async (): Promise<boolean> => {
    if (!enabled || !hasMinimumRequirements()) return false;

    const payload = JSON.stringify(latest.current);
    if (payload === lastSaved.current) return false;

    setIsSaving(true);
    setError(null);

    try {
      const existing = currentDraft.current;
      if (existing?.id) {
        const updated = await updateProblem({
          id: existing.id,
          version: existing.version ?? 0,
          body: latest.current,
        }).unwrap();
        lastSaved.current = payload;
        setActiveDraft(updated);
        setSavedAt(updated.updatedAt ?? new Date().toISOString());
        return true;
      } else if (!creating.current) {
        creating.current = true;
        try {
          const created = await createDraft(latest.current).unwrap();
          lastSaved.current = payload;
          setActiveDraft(created);
          setSavedAt(created.updatedAt ?? new Date().toISOString());
          return true;
        } finally {
          creating.current = false;
        }
      }
      return false;
    } catch (err) {
      setError(
        apiErrorMessage(err, "Could not save your draft. Retrying as you type."),
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [createDraft, enabled, hasMinimumRequirements, updateProblem]);

  const serialised = JSON.stringify(values);

  useEffect(() => {
    if (!enabled || !isDirty || !hasMinimumRequirements()) return;

    const timer = setTimeout(() => void persist(), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [serialised, enabled, isDirty, hasMinimumRequirements, persist]);

  const saveNow = useCallback(async () => {
    return persist();
  }, [persist]);

  const clear = useCallback(() => {
    setActiveDraft(null);
    setSavedAt(null);
    setError(null);
  }, []);

  return {
    savedAt,
    isSaving,
    error,
    saveNow,
    activeDraft,
    setActiveDraft,
    clear,
  };
}
