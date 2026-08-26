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

const DEBOUNCE_MS = 1200;

export interface ServerDraftState {
  /** A stored draft found for this program, waiting to be resumed. */
  available: ReportDraftResponse | null;
  savedAt: string | null;
  isSaving: boolean;
  error: string | null;
  /** Takes the found draft and stops offering it. */
  take: () => ReportDraftResponse | null;
  /** Deletes it outright — the reporter said they do not want it. */
  discard: () => Promise<void>;
  /** Flushes a save immediately rather than waiting out the debounce. */
  saveNow: () => Promise<void>;
  /** Removes the draft after the report it became was accepted. */
  clear: () => Promise<void>;
  /** The draft's id once one exists, for submitting through it. */
  draftId: string | null;
}

/**
 * Autosaves the report to the server and offers back anything unfinished.
 *
 * A draft belongs to a program, so the lookup on mount is scoped to the one
 * being reported against — opening a second program must not offer the
 * first's write-up.
 *
 * The first save creates the draft and every later one overwrites it, which
 * is why the id is held in a ref rather than derived from the mutation: two
 * saves racing during the initial create would otherwise both POST and leave
 * the reporter with two drafts.
 */
export function useServerReportDraft({
  programId,
  values,
  enabled,
  isDirty,
}: {
  programId: string;
  values: SaveReportDraftValues;
  enabled: boolean;
  isDirty: boolean;
}): ServerDraftState {
  const [createDraft] = useCreateReportDraftMutation();
  const [updateDraft] = useUpdateReportDraftMutation();
  const [deleteDraft] = useDeleteReportDraftMutation();

  const { data: drafts = [] } = useGetReportDraftsQuery(
    { programId },
    { skip: !programId },
  );

  const [available, setAvailable] = useState<ReportDraftResponse | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draftId = useRef<string | null>(null);
  /* Guards the create: without it, two debounced saves landing together
     during the first write would each POST a new draft. */
  const creating = useRef(false);
  const offered = useRef<string | null>(null);
  const latest = useRef(values);
  latest.current = values;

  /* Offered once per program. Re-offering after the reporter dismissed it
     would make the banner impossible to get rid of. */
  useEffect(() => {
    if (!programId || offered.current === programId) return;
    const found = drafts[0];
    if (!found) return;
    offered.current = programId;
    /* Already resumed or already being written to — nothing to offer. */
    if (draftId.current) return;
    setAvailable(found);
  }, [drafts, programId]);

  const persist = useCallback(async () => {
    if (!programId) return;
    setIsSaving(true);
    setError(null);
    try {
      if (draftId.current) {
        const saved = await updateDraft({
          id: draftId.current,
          body: latest.current,
        }).unwrap();
        setSavedAt(saved.updatedAt ?? new Date().toISOString());
      } else if (!creating.current) {
        creating.current = true;
        try {
          const created = await createDraft({
            programId,
            body: latest.current,
          }).unwrap();
          draftId.current = created.id;
          setSavedAt(created.updatedAt ?? new Date().toISOString());
        } finally {
          creating.current = false;
        }
      }
    } catch {
      /* Kept quiet in the interface but recorded: a failed autosave must not
         interrupt someone mid-sentence, and the next keystroke retries. */
      setError("Could not save your draft. Retrying as you type.");
    } finally {
      setIsSaving(false);
    }
  }, [createDraft, programId, updateDraft]);

  const serialised = JSON.stringify(values);

  useEffect(() => {
    if (!enabled || !isDirty || !programId) return;
    /* An unresumed draft is on offer — saving now would overwrite the thing
       the reporter has not decided about yet. */
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

  const clear = useCallback(async () => {
    const id = draftId.current;
    draftId.current = null;
    setAvailable(null);
    setSavedAt(null);
    if (!id) return;
    try {
      await deleteDraft(id).unwrap();
    } catch {
      /* Submitting may already have consumed it. */
    }
  }, [deleteDraft]);

  return {
    available,
    savedAt,
    isSaving,
    error,
    take,
    discard,
    saveNow: persist,
    clear,
    draftId: draftId.current,
  };
}
