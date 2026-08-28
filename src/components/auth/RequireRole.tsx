"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ShieldOff } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useMyMembership } from "@/hooks/useMyMembership";
import { useSidebarAuth } from "@/hooks/useSidebarAuth";
import type { OrganizationInvitationPermission } from "@/lib/redux/services/organizationsApi";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

/**
 * Keeps a dashboard screen to the roles it was built for.
 *
 * The sidebar already filters itself by role, but that only governs the links
 * it draws — a pasted URL, a bookmark or a browser going back walks straight
 * past it. This applies the same decision to the page, so a screen meant for
 * one kind of account is never rendered for another.
 *
 * It is a courtesy, not a security boundary: the backend authorizes every
 * request on its own and would refuse the data regardless. What this prevents
 * is a company landing on a researcher screen, watching it fire requests it
 * has no business making, and reading an error where an explanation belongs.
 *
 * Wrap the *content*, not the body of the page itself — the guard has to sit
 * above the component whose hooks would otherwise run, or the queries fire
 * before the role is ever looked at.
 */
export function RequireRole({
  roles,
  orPermission,
  title,
  description,
  action,
  children,
}: {
  /** Any one of these is enough. Compared case-insensitively. */
  roles: string[];
  /**
   * An organization permission that admits the account regardless of role.
   *
   * For screens a company invites people into: a member who was granted the
   * permission holds a researcher account, so the role check alone would shut
   * out exactly the person the invitation was for. Unlike
   * `useOrganizationPermission`, absence refuses here — this is the outer gate,
   * and an account on no roster at all has no business on the screen.
   */
  orPermission?: OrganizationInvitationPermission;
  title: string;
  description: string;
  /** Where this account should have gone instead. */
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  const lp = useLocalePath();
  const { user, areRolesResolved } = useSidebarAuth();
  const { member, isLoading: isMembershipLoading } = useMyMembership();

  const holdsPermission = Boolean(
    orPermission && member?.permissions?.includes(orPermission),
  );

  /* Roles arrive with the session, or from the access token a beat later, and
     the roster a beat after that. Deciding before they land would show the
     refusal to the very people the screen is for, and then swap it out under
     them. */
  if (!areRolesResolved || (orPermission && isMembershipLoading)) {
    return (
      <div
        aria-busy="true"
        aria-label="Checking your account"
        className="w-full space-y-4 pb-12 animate-pulse"
      >
        <div className="h-20 rounded-2xl border border-border bg-muted/60" />
        <div className="h-72 rounded-2xl border border-border bg-muted/60" />
      </div>
    );
  }

  /* The same reading the sidebar takes, so a link it draws always leads
     somewhere that renders. */
  const held = (
    user?.roles ?? (user?.role ? user.role.split(",") : ["USER"])
  ).map((role) => role.trim().toUpperCase());

  if (holdsPermission || roles.some((role) => held.includes(role.toUpperCase()))) {
    return <>{children}</>;
  }

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
          <ShieldOff className="size-5.5" />
        </span>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row">
          {action && (
            <Link
              href={lp(action.href)}
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-11 rounded-xl px-5 text-base font-semibold",
              )}
            >
              {action.label}
              <ArrowRight data-icon="inline-end" />
            </Link>
          )}
          <Link
            href={lp("/dashboard")}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 rounded-xl px-5 text-base font-semibold",
            )}
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default RequireRole;
