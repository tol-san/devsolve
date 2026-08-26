"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Loader2,
  MailCheck,
  ShieldAlert,
  UserRoundPlus,
} from "lucide-react";
import { motion } from "motion/react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import {
  INVITE_PERMISSION_OPTIONS,
  INVITE_ROLE_OPTIONS,
} from "@/components/teams/invite-member/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import {
  useAcceptOrganizationInvitationMutation,
  type OrganizationInvitationMember,
  type OrganizationInvitationPermission,
  type OrganizationInvitationRole,
} from "@/lib/redux/services/organizationsApi";

const CARD =
  "rounded-2xl bg-card p-6 text-card-foreground shadow-xs ring-1 ring-foreground/5 sm:p-8 dark:ring-foreground/10";

function roleTitle(role?: OrganizationInvitationRole): string {
  return (
    INVITE_ROLE_OPTIONS.find((option) => option.role === role)?.title ??
    "Member"
  );
}

function permissionTitle(value: OrganizationInvitationPermission): string {
  return (
    INVITE_PERMISSION_OPTIONS.find((option) => option.value === value)?.title ??
    value
  );
}

/**
 * Why an accept failed, in the invitee's terms.
 *
 * The distinctions that matter to them are: the link is spent, the link has
 * aged out, they are already in, or they are holding the wrong account. Each
 * one has a different next step, so a single "something went wrong" would
 * leave them with nothing to do.
 */
function getErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return "Unable to accept the invitation. Please try again.";
  }

  const apiError = error as FetchBaseQueryError & {
    data?: { message?: string; error?: string; details?: string };
  };

  const raw =
    apiError.data?.message ??
    apiError.data?.error ??
    apiError.data?.details ??
    "";
  const normalized = raw.toLowerCase();

  if (normalized.includes("expire")) {
    return "This invitation has expired. Ask the organization to send you a new one.";
  }

  if (normalized.includes("already") && normalized.includes("member")) {
    return "You are already a member of this organization.";
  }

  if (apiError.status === 404) {
    return "This invitation link is not valid. It may have already been used, or the link may be incomplete.";
  }

  if (apiError.status === 410) {
    return "This invitation has expired. Ask the organization to send you a new one.";
  }

  if (apiError.status === 401) {
    return "Your session ended before the invitation could be accepted. Sign in again and reopen this link.";
  }

  if (apiError.status === 403) {
    return "This invitation was issued to a different account. Sign out, then sign back in with the email address it was sent to.";
  }

  return raw.trim() || "Unable to accept the invitation. Please try again.";
}

/**
 * The page an invited person lands on from their invitation email.
 *
 * Accepting needs a bearer token, so this cannot be a one-click link from the
 * email — the invitee has to be signed in first. It is a public route rather
 * than a `/dashboard` one for the same reason: the dashboard middleware
 * bounces anonymous visitors to the home page, which would throw the token
 * away before they ever got the chance to sign in.
 *
 * There is no endpoint to read an invitation before accepting it, so the page
 * cannot name the organization up front. What it can do is show which account
 * is about to accept, which is where this goes wrong most often — the link is
 * bound to one email address, and people open it in whichever browser they
 * happen to be signed into.
 */
export function AcceptInvitationView({ token }: { token: string }) {
  const pathname = usePathname();
  const lp = useLocalePath();
  const { data: session } = authClient.useSession();
  const [acceptInvitation, { isLoading, isSuccess, data, error, reset }] =
    useAcceptOrganizationInvitationMutation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14"
    >
      <RequireAuth
        redirectTo={pathname}
        title="Sign in to accept your invitation"
        description="You have been invited to join an organization workspace on DevSolve. Sign in with the email address the invitation was sent to, and you will come straight back here."
      >
        {isSuccess ? (
          <AcceptedCard member={data} />
        ) : (
          <div className={CARD}>
            <span
              aria-hidden="true"
              className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/25"
            >
              <UserRoundPlus className="size-5.5" />
            </span>

            <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Join your organization workspace
            </h1>
            <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
              An organization on DevSolve has invited you onto its team.
              Accepting adds you to its workspace with the role and permissions
              they chose for you.
            </p>

            {session?.user ? (
              <div className="mt-5 flex items-start gap-3 rounded-xl bg-muted/60 p-4">
                <MailCheck
                  aria-hidden="true"
                  className="mt-0.5 size-4.5 shrink-0 text-muted-foreground"
                />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Accepting as{" "}
                  <span className="font-semibold text-foreground">
                    {session.user.email ?? session.user.name}
                  </span>
                  . An invitation only works for the address it was sent to — if
                  that is not this one, sign out and sign back in with the right
                  account before accepting.
                </p>
              </div>
            ) : null}

            {error ? (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-red-700 ring-1 ring-red-100 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20"
              >
                <ShieldAlert
                  aria-hidden="true"
                  className="mt-0.5 size-4.5 shrink-0"
                />
                <p className="text-sm leading-relaxed">
                  {getErrorMessage(error)}
                </p>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  reset();
                  void acceptInvitation({ token });
                }}
                className="h-11 rounded-xl bg-blue-600 px-5 text-base font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <BadgeCheck className="size-4" />
                    {error ? "Try again" : "Accept invitation"}
                  </>
                )}
              </Button>

              <Button
                nativeButton={false}
                variant="outline"
                render={<Link href={lp("/")} />}
                className="h-11 rounded-xl px-5 text-base font-semibold"
              >
                Not now
              </Button>
            </div>
          </div>
        )}
      </RequireAuth>
    </motion.div>
  );
}

/** What the invitee actually got, read back from the accept response. */
function AcceptedCard({ member }: { member?: OrganizationInvitationMember }) {
  const lp = useLocalePath();
  const permissions = member?.permissions ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={CARD}
    >
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/25"
      >
        <CheckCircle2 className="size-5.5" />
      </span>

      <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        You are on the team
      </h1>
      <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
        Your invitation was accepted. The organization workspace is now
        available from your dashboard.
      </p>

      <dl className="mt-5 space-y-4 rounded-xl bg-muted/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-sm font-medium text-muted-foreground">Role</dt>
          <dd>
            <Badge variant="tag" className="rounded-lg text-sm">
              {roleTitle(member?.role)}
            </Badge>
          </dd>
        </div>

        {permissions.length > 0 ? (
          <div className="space-y-2">
            <dt className="text-sm font-medium text-muted-foreground">
              Permissions
            </dt>
            <dd className="flex flex-wrap gap-1.5">
              {permissions.map((permission) => (
                <Badge
                  key={permission}
                  variant="secondary"
                  className="rounded-lg text-sm font-medium"
                >
                  {permissionTitle(permission)}
                </Badge>
              ))}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <Button
          nativeButton={false}
          render={<Link href={lp("/dashboard/team-management")} />}
          className="h-11 rounded-xl bg-blue-600 px-5 text-base font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          Go to the team
          <ArrowRight className="size-4" />
        </Button>

        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href={lp("/dashboard")} />}
          className="h-11 rounded-xl px-5 text-base font-semibold"
        >
          Open dashboard
        </Button>
      </div>
    </motion.div>
  );
}

export default AcceptInvitationView;
