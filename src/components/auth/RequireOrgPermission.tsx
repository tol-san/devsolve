"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, KeyRound } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useOrganizationPermission } from "@/hooks/useOrganizationPermission";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import type { OrganizationInvitationPermission } from "@/lib/redux/services/organizationsApi";
import { cn } from "@/lib/utils";

/**
 * Keeps an organization screen to the members whose permissions cover it.
 *
 * The companion to `RequireRole`, one level finer: role says which *kind* of
 * account this is, a permission says what this member was given when they were
 * invited. Two people on the same team can hold the same COMPANY role and
 * still disagree about whether this screen is theirs.
 *
 * Same standing as `RequireRole`: a courtesy, not a security boundary. The
 * backend authorizes every request regardless — what this prevents is a member
 * watching a screen fire calls it has no business making and reading a 403
 * where an explanation belongs. It errs towards showing the screen when the
 * permission cannot be read at all; see `useOrganizationPermission`.
 *
 * Wrap the *content*, not the page, so the guarded component's hooks do not
 * run before the answer is in.
 */
export function RequireOrgPermission({
  permission,
  title,
  description,
  action,
  children,
}: {
  permission: OrganizationInvitationPermission;
  title: string;
  description: string;
  /** Where this member should have gone instead. */
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  const lp = useLocalePath();
  const { granted, isResolved } = useOrganizationPermission(permission);

  /* The roster arrives a beat after the session. Deciding before it lands
     would show the refusal to the very members the screen is for. */
  if (!isResolved) {
    return (
      <div
        aria-busy="true"
        aria-label="Checking your permissions"
        className="w-full space-y-4 pb-12 animate-pulse"
      >
        <div className="h-20 rounded-2xl border border-border bg-muted/60" />
        <div className="h-72 rounded-2xl border border-border bg-muted/60" />
      </div>
    );
  }

  if (granted) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full space-y-6 pb-12"
    >
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
        <span
          aria-hidden
          className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
        >
          <KeyRound className="size-5.5" />
        </span>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        {action && (
          <Link
            href={lp(action.href)}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 rounded-xl px-5 text-base font-semibold",
            )}
          >
            {action.label}
            <ArrowRight data-icon="inline-end" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export default RequireOrgPermission;
