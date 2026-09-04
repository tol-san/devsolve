"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 60_000;

let current = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

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

const getServerSnapshot = () => null;

export function useNow(): number | null {
  return useSyncExternalStore<number | null>(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
}
