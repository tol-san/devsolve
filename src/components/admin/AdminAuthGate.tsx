"use client";

import React from "react";
import Link from "next/link";
import { LogIn, ShieldOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";

/** Pulls an HTTP status off an RTK Query error, whatever shape it arrived in. */
export function statusOf(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }
  return undefined;
}

export function isAuthError(error: unknown): boolean {
  const status = statusOf(error);
  return status === 401 || status === 403;
}

/**
 * Admin endpoints answer 401 when signed out and 403 when the token has no
 * ADMIN realm role. Neither may render as an empty queue — "nothing to review"
 * and "you may not review" look identical and only one of them is safe.
 */
export function AdminAuthNotice({ error }: { error: unknown }) {
  const { handleLogin } = useKeycloakLogin();
  const status = statusOf(error);

  if (status === 401) {
    return (
      <Shell
        title="Your session has expired"
        body="Sign in again to keep working through the moderation queue."
      >
        <Button
          type="button"
          onClick={() =>
            void handleLogin(
              typeof window !== "undefined"
                ? `${window.location.pathname}${window.location.search}`
                : "/dashboard/content-moderation",
            )
          }
          className="cursor-pointer rounded-xl"
        >
          <LogIn aria-hidden="true" className="size-4" />
          Sign in
        </Button>
      </Shell>
    );
  }

  return (
    <Shell
      title="You do not have moderator access"
      body="This console needs the ADMIN role. Ask a platform administrator if you think that is wrong."
    >
      <Link
        href="/dashboard"
        className="inline-flex h-10 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
      >
        Back to dashboard
      </Link>
    </Shell>
  );
}

function Shell({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-2xs">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
        <ShieldOff aria-hidden="true" className="size-5" />
      </div>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
        {body}
      </p>
      <div className="mt-5 flex justify-center">{children}</div>
    </div>
  );
}
