"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  useCreateShowcaseDraftMutation,
  useDeleteShowcaseDraftMutation,
  useGetShowcaseDraftsQuery,
  useUpdateShowcaseDraftMutation,
} from "@/lib/redux/services/showcaseDraftsApi";
import type {
  ShowcaseDraftResponse,
  SaveShowcaseDraftValues,
} from "@/lib/validations/showcase-draft";
import { apiErrorMessage } from "@/lib/api/error-message";

const DEBOUNCE_MS = 1500;

export interface ServerShowcaseDraftState {
  available: ShowcaseDraftResponse | null;
  savedAt: string | null;
  isSaving: boolean;
  error: string | null;
  take: () => ShowcaseDraftResponse | null;
  discard: () => Promise<void>;
  saveNow: () => Promise<{ success: boolean; draftId?: string }>;
  clear: () => Promise<void>;
  draftId: string | null;
}

export function useServerShowcaseDraft({
  values,
  enabled,
  isDirty,
  resumeId,
}: {
  values: SaveShowcaseDraftValues;
  enabled: boolean;
  isDirty: boolean;
  resumeId?: string;
}): ServerShowcaseDraftState {
  const [createDraft] = useCreateShowcaseDraftMutation();
  const [updateDraft] = useUpdateShowcaseDraftMutation();
  const [deleteDraft] = useDeleteShowcaseDraftMutation();

  const { data: drafts = [] } = useGetShowcaseDraftsQuery(undefined, {
    skip: !enabled,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const [available, setAvailable] = useState<ShowcaseDraftResponse | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draftId = useRef<string | null>(resumeId ?? null);
  const creating = useRef(false);
  const offered = useRef(false);
  const latest = useRef(values);
  latest.current = values;
  const lastSaved = useRef<string>("");
  const reqSeq = useRef(0);

  useEffect(() => {
    if (!enabled || offered.current) return;
    const found = drafts[0];
    if (!found) return;
    offered.current = true;
    if (draftId.current || resumeId) return;
    setAvailable(found);
  }, [drafts, enabled, resumeId]);

  const persist = useCallback(
    async (force = false): Promise<boolean> => {
      if (!enabled) return false;

      const hasAnyContent = Boolean(
        latest.current.title?.trim() ||
          latest.current.overview?.trim() ||
          latest.current.categoryId ||
          latest.current.coverImageUrl ||
          latest.current.liveUrl ||
          latest.current.repoUrl ||
          latest.current.videoUrl ||
          (latest.current.tags && latest.current.tags.length > 0) ||
          draftId.current ||
          resumeId,
      );

      if (!hasAnyContent) {
        if (!force) return false;
        latest.current = {
          ...latest.current,
          title: "Untitled draft",
        };
      }

      const payload = JSON.stringify(latest.current);
      if (payload === lastSaved.current) {
        return true;
      }

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
            const created = await createDraft(latest.current).unwrap();
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
    },
    [createDraft, enabled, resumeId, updateDraft],
  );

  const serialised = JSON.stringify(values);

  useEffect(() => {
    if (!enabled) return;
    if (available) return;

    const hasAnyContent = Boolean(
      latest.current.title?.trim() ||
        latest.current.overview?.trim() ||
        latest.current.categoryId ||
        latest.current.coverImageUrl ||
        latest.current.liveUrl ||
        latest.current.repoUrl ||
        latest.current.videoUrl ||
        (latest.current.tags && latest.current.tags.length > 0),
    );
    if (!hasAnyContent && !draftId.current && !resumeId) return;

    const timer = setTimeout(() => void persist(false), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [serialised, enabled, available, persist, resumeId]);

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

  const saveNow = useCallback(async (): Promise<{
    success: boolean;
    draftId?: string;
  }> => {
    setAvailable(null);
    const success = await persist(true);
    return {
      success,
      draftId: draftId.current ?? undefined,
    };
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
      // Submitting may have consumed it
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
