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

export function ProfileProvisioningGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { areRolesResolved } = useSidebarAuth();
  const { error, isFetching, refetch } = useGetProfileProvisioningStatusQuery(undefined, {
    skip: !areRolesResolved,
  });
  const [syncSocialAccount, syncState] = useSyncSocialAccountMutation();

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
