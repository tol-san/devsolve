"use client";

import { useSyncExternalStore } from "react";

/* There is no store to watch. The value changes exactly once — when React
   finishes hydrating — and swapping the server snapshot for the client one is
   precisely the transition `useSyncExternalStore` already performs, so the
   subscription is a no-op. */
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` for the server render and for the hydration pass that has to match
 * it, `true` from then on — including the very first render of anything that
 * mounts after hydration.
 *
 * Its reason for existing is markup that only means something in the HTML the
 * server sent, an inline `<script>` above all. React never executes a script
 * it creates on the client: it builds a `<div>` in its place and logs
 * *"Encountered a script tag while rendering React component"*. So a script
 * has to leave the tree once hydration is done, or every later remount
 * re-creates it for nothing and trips that warning.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
