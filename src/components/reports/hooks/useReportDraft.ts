"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Keeps an in-progress report on the device.
 *
 * A researcher can spend an hour writing reproduction steps, and the worst
 * outcome this form has is losing that to a closed tab. The draft is written
 * to `localStorage` on a debounce while they type and offered back on return.
 *
 * Scoped per program, because a report is filed against one: opening a second
 * program must not resurrect the first one's write-up into it.
 *
 * Restoration is offered, never automatic. Silently repopulating a form is
 * how someone submits a half-written draft from last week without noticing
 * that is what they are doing.
 */

const PREFIX = "devsolve.report-draft";
const DEBOUNCE_MS = 800;
/** Older than this and the draft is likelier to confuse than to help. */
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

interface Envelope<T> {
  savedAt: number;
  values: T;
}

function keyFor(programId: string) {
  return `${PREFIX}:${programId || "unscoped"}`;
}

function read<T>(programId: string): Envelope<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(keyFor(programId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Envelope<T>;
    if (typeof parsed?.savedAt !== "number" || !parsed.values) return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      window.localStorage.removeItem(keyFor(programId));
      return null;
    }
    return parsed;
  } catch {
    /* Private mode, a full quota, or something else wrote over the key. A
       draft is a convenience — never let its absence break the form. */
    return null;
  }
}

export interface ReportDraft<T> {
  /** A draft found on mount, waiting to be restored or dismissed. */
  available: { savedAt: number; values: T } | null;
  /** When the current draft was last written, for the "saved" indicator. */
  savedAt: number | null;
  isSaving: boolean;
  restore: () => T | null;
  dismiss: () => void;
  /** Called after a successful submit so the draft does not outlive the report. */
  clear: () => void;
}

export function useReportDraft<T extends object>({
  programId,
  values,
  enabled = true,
  isDirty,
}: {
  programId: string;
  values: T;
  /** Paused during submit and after success. */
  enabled?: boolean;
  /** Nothing is written until the reporter has actually typed something. */
  isDirty: boolean;
}): ReportDraft<T> {
  const [available, setAvailable] = useState<ReportDraft<T>["available"]>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  /* Checked once per program, before any autosave can overwrite it. */
  const checkedFor = useRef<string | null>(null);
  useEffect(() => {
    if (checkedFor.current === programId) return;
    checkedFor.current = programId;
    const found = read<T>(programId);
    setAvailable(found ? { savedAt: found.savedAt, values: found.values } : null);
    setSavedAt(null);
  }, [programId]);

  const serialised = JSON.stringify(values);

  useEffect(() => {
    if (!enabled || !isDirty) return;
    /* Holding an unrestored draft: writing now would overwrite the thing the
       reporter has not decided about yet. */
    if (available) return;

    setIsSaving(true);
    const timer = setTimeout(() => {
      try {
        const stamp = Date.now();
        window.localStorage.setItem(
          keyFor(programId),
          JSON.stringify({ savedAt: stamp, values: JSON.parse(serialised) }),
        );
        setSavedAt(stamp);
      } catch {
        /* Quota or private mode — the form carries on without a safety net. */
      } finally {
        setIsSaving(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [serialised, programId, enabled, isDirty, available]);

  const restore = useCallback(() => {
    const found = available;
    setAvailable(null);
    return found?.values ?? null;
  }, [available]);

  const dismiss = useCallback(() => {
    setAvailable(null);
    try {
      window.localStorage.removeItem(keyFor(programId));
    } catch {
      /* Nothing to do — it will age out. */
    }
  }, [programId]);

  const clear = useCallback(() => {
    setAvailable(null);
    setSavedAt(null);
    try {
      window.localStorage.removeItem(keyFor(programId));
    } catch {
      /* As above. */
    }
  }, [programId]);

  return { available, savedAt, isSaving, restore, dismiss, clear };
}
