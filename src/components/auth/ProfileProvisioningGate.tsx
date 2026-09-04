"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSyncSocialAccountMutation } from "@/lib/redux/services/authApi";
import { useGetProfileProvisioningStatusQuery } from "@/lib/redux/services/profileApi";
import { useSidebarAuth } from "@/hooks/useSidebarAuth";

function isNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: number | string }).status === 404
  );
}

/**
 * Makes sure the signed-in user has a local profile row before the app tries to
 * read one.
 *
 * Email/password sign-ups get their row from `/auth/register`. Social sign-ups
 * never touch that endpoint — the OIDC redirect is the entire flow — so the
 * backend only learns about them when `/auth/social/sync` is called. Nothing
 * was calling it, which is why a Google account could authenticate perfectly
 * and still have no profile behind it.
 *
 * So a 404 here is not necessarily a failure: for a first-time social user it
 * is the expected state, and the fix is to sync and look again. Only a 404 that
 * survives that is a real misconfiguration worth stopping for. Everything else
 * falls through to the app — a slow or briefly unreachable backend is not a
 * provisioning failure, and locking someone out of the dashboard over one is
 * worse than the pages showing their own empty states.
 */
export function ProfileProvisioningGate({
  children,
}: {
  children: React.ReactNode;
}) {
  // Wait until the Keycloak token is confirmed before firing any API calls.
  // If roles haven't resolved yet the token may not be ready, and the
  // provisioning query would race it and get a 401.
  const { areRolesResolved } = useSidebarAuth();
  const { error, isFetching, refetch } = useGetProfileProvisioningStatusQuery(undefined, {
    skip: !areRolesResolved,
  });
  const [syncSocialAccount, syncState] = useSyncSocialAccountMutation();

  // One automatic attempt per mount, so a backend that keeps answering 404
  // isn't synced again on every render. Touched only inside the effect — the
  // render below reads the mutation's own state instead.
  const hasAutoSynced = useRef(false);

  const needsProfile = isNotFound(error);

  useEffect(() => {
    if (!needsProfile || hasAutoSynced.current) return;

    hasAutoSynced.current = true;
    syncSocialAccount()
      .unwrap()
      .then(() => refetch())
      .catch(() => {
        // Leaves the query's 404 in place, which shows the state below.
      });
  }, [needsProfile, syncSocialAccount, refetch]);

  const isWorking = syncState.isLoading || isFetching;

  if (!needsProfile) {
    return <>{children}</>;
  }

  /* The sync is normal first-run setup, not an error, so it reads as setting
     up rather than failing — until it has actually run and the profile is
     still missing. `isUninitialized` covers the gap between the 404 landing
     and the effect firing. */
  if (isWorking || syncState.isUninitialized) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="size-6 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">
            Setting up your account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex min-h-[60vh] w-full items-center justify-center pb-12"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
          <AlertTriangle className="size-6" />
        </div>

        <h1 className="mt-5 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          We couldn&apos;t finish setting up your account
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-neutral-400">
          You&apos;re signed in, but your profile isn&apos;t ready yet. This is
          on our side, not yours — trying again usually sorts it out.
        </p>

        <Button
          type="button"
          onClick={() => {
            syncSocialAccount()
              .unwrap()
              .then(() => refetch())
              .catch(() => refetch());
          }}
          disabled={isWorking}
          className="mt-6 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {isWorking ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="size-4" />
              Try again
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

export default ProfileProvisioningGate;
