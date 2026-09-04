"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, RotateCcw, Trophy, UserX, Unplug } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileNotFoundProps {
  identifier?: string;
  notFound: boolean;
  onRetry?: () => void;
  scope?: "public" | "dashboard";
}

export default function ProfileNotFound({
  identifier,
  notFound,
  onRetry,
  scope = "public",
}: ProfileNotFoundProps) {
  const browseHref =
    scope === "dashboard" ? "/dashboard/leaderboard" : "/leaderboard";
  const backHref = scope === "dashboard" ? "/dashboard" : "/community";
  const backLabel = scope === "dashboard" ? "Back to dashboard" : "Back to community";

  const Icon = notFound ? UserX : Unplug;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mx-auto flex max-w-xl flex-col items-center rounded-[24px] bg-card px-6 py-12 text-center ring-1 ring-foreground/5 sm:px-12 dark:ring-foreground/10"
      >
        <span
          aria-hidden="true"
          className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
        >
          <Icon className="size-7" />
        </span>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {notFound ? "Profile not found" : "We couldn't load this profile"}
        </h1>

        <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
          {notFound
            ? "No member is registered under this address. The account may have been removed, or the link you followed may be out of date."
            : "The profile service did not respond. Nothing is wrong with the account — this is on our side."}
        </p>

        {identifier ? (
          <p className="mt-5 max-w-full truncate rounded-lg bg-muted px-3 py-1.5 font-mono text-sm text-muted-foreground">
            {identifier}
          </p>
        ) : null}

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
          {!notFound && onRetry ? (
            <Button
              type="button"
              onClick={onRetry}
              className="h-11 rounded-xl px-5 font-semibold"
            >
              <RotateCcw data-icon="inline-start" />
              Try again
            </Button>
          ) : (
            <Link
              href={browseHref}
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-11 rounded-xl px-5 font-semibold",
              )}
            >
              <Trophy data-icon="inline-start" />
              Browse the leaderboard
            </Link>
          )}

          <Link
            href={backHref}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 rounded-xl px-5 font-semibold",
            )}
          >
            <ArrowLeft data-icon="inline-start" />
            {backLabel}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
