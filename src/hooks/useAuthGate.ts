"use client";

import { useCallback, useState } from "react";
import type React from "react";

import { authClient } from "@/lib/auth/auth-client";

export function useAuthGate() {
  const { data: session, isPending } = authClient.useSession();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const guard = useCallback(
    (event: React.MouseEvent<HTMLElement>, href: string) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (isPending || session) {
        return;
      }

      event.preventDefault();
      setPendingHref(href);
    },
    [isPending, session],
  );

  const dismiss = useCallback(() => setPendingHref(null), []);

  return {
    isAuthenticated: Boolean(session),
    isPending,
    pendingHref,
    guard,
    dismiss,
  };
}
