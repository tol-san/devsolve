"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, Loader2, LockKeyhole, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";

interface RequireAuthProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  redirectTo?: string;
}

export function RequireAuth({
  children,
  title = "Sign in to post",
  description = "Posting to the community needs an account, so your work stays attached to your profile. It only takes a moment.",
  redirectTo,
}: RequireAuthProps) {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const { isLoggingIn, handleLogin } = useKeycloakLogin();

  if (isPending) {
    return (
      <div
        aria-busy="true"
        aria-label="Checking your session"
        className="animate-pulse space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="size-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-6 w-56 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-full max-w-md rounded-lg bg-slate-100 dark:bg-slate-800/70" />
        <div className="h-11 w-40 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (session) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900"
    >
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/25"
      >
        <LockKeyhole className="size-5.5" />
      </span>

      <div className="space-y-1.5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
          {title}
        </h2>
        <p className="max-w-xl text-base leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Button
          type="button"
          onClick={() => handleLogin(redirectTo ?? pathname)}
          disabled={isLoggingIn}
          className="h-11 rounded-xl bg-blue-600 px-5 text-base font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <LogIn className="size-4" />
              Log in
            </>
          )}
        </Button>

        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href="/account-type" />}
          className="h-11 rounded-xl border-slate-300 bg-white px-5 text-base font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          Create an account
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </motion.div>
  );
}
