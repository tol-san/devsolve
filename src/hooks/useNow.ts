"use client";

import { useSyncExternalStore } from "react";

/** How often the clock is re-read. A minute is enough for a deadline. */
const TICK_MS = 60_000;

/**
 * The clock as an external store.
 *
 * It has to live outside React for two reasons. Reading `Date.now()` while
 * rendering is not something React promises to keep stable, and it produces
 * server markup the client then disagrees with. And a snapshot has to be the
 * *same value* until it genuinely changes — a `getSnapshot` that called
 * `Date.now()` itself would report a change on every read and never settle.
 *
 * So the reading is cached here and refreshed on a tick, with one interval
 * shared by every subscriber and stopped once the last one leaves.
 */
let current = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  /* The cached reading can be a tick old by the time somebody subscribes.
     React reads the snapshot again right after this returns, so refreshing it
     here is what makes the first render after mount current. */
  current = Date.now();

  timer ??= setInterval(() => {
    current = Date.now();
    for (const notify of listeners) notify();
  }, TICK_MS);

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => current;

/* Null on the server, and therefore on the hydrating render: there is no
   honest "now" to put in markup that will be read at some other time. Render
   the timestamp-free version — usually the absolute date — until it lands. */
const getServerSnapshot = () => null;

/**
 * The current time, ticking, or `null` until the page has mounted.
 *
 * Pass it to the pure formatters in `@/lib/format/datetime` rather than
 * reading the clock inside a component.
 */
export function useNow(): number | null {
  return useSyncExternalStore<number | null>(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
}
