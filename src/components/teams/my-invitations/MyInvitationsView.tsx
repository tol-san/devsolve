"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  LogIn,
  MailOpen,
  MailQuestion,
  RefreshCcw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { CompanyLogo } from "@/components/researchers/CompanyLogo";
import { INVITE_ROLE_OPTIONS } from "@/components/teams/invite-member/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";
import { toast } from "@/hooks/use-toast";
import { useNow } from "@/hooks/useNow";
import { apiErrorMessage, apiErrorStatus } from "@/lib/api/error-message";
import {
  formatDate,
  formatDateTime,
  formatTimeDistance,
  toDate,
} from "@/lib/format/datetime";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import {
  useAcceptOrganizationInvitationMutation,
  useGetMyInvitationsQuery,
  type MyOrganizationInvitation,
  type OrganizationInvitationRole,
} from "@/lib/redux/services/organizationsApi";
import { cn } from "@/lib/utils";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** The role's own words, so this screen and the invite form agree. */
function roleCopy(role: OrganizationInvitationRole | undefined) {
  const option = INVITE_ROLE_OPTIONS.find((entry) => entry.role === role);
  return {
    title: option?.title ?? "Member",
    access: option?.access ?? "Collaborate on programs and reports",
  };
}

/** What went wrong accepting, in the invitee's terms rather than the code's. */
function acceptFailureMessage(error: unknown): string {
  const status = apiErrorStatus(error);

  const copy = {
    401: "Your session ended. Sign in again and the invitation will still be here.",
    403: "This invitation was sent to a different account. Sign in as the address it was addressed to.",
    404: "This invitation is no longer valid — it may have been withdrawn. Ask the organization for a new one.",
    409: "This invitation has already been used. You are on the team already.",
    410: "This invitation has expired. Invitations last seven days; ask the organization for a new one.",
  }[status ?? 0];

  return (
    copy ??
    apiErrorMessage(
      error,
      "The invitation could not be accepted. Trying again is usually enough.",
    )
  );
}

/**
 * Invitations companies have sent this account.
 *
 * Backed by `GET /organizations/invitations/me`, which is the only place a
 * signed-in invitee can read their own `invitationToken` — the token otherwise
 * only reaches them by email, and the INVITATION notification does not carry
 * it (its `notifiableId` is the organization's id, not the token).
 *
 * Every row here is live: upstream returns only invitations that would succeed
 * if accepted right now — pending, unexpired, into an organization that is
 * still active — ordered soonest-to-expire first. So the list is rendered in
 * the order it arrives, accepting happens in place, and the accepted row
 * leaves on the refetch rather than being hidden client-side.
 */
export function MyInvitationsView() {
  const lp = useLocalePath();

  const { data, isLoading, isError, isFetching, error, refetch } =
    useGetMyInvitationsQuery();

  /* One clock for the whole list, ticking, so a deadline read as "in an hour"
     does not still say that an hour later. Null on the first render, which is
     what keeps the server's markup and the client's identical. */
  const now = useNow();

  const invitations = data ?? [];
  const waiting = invitations.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full space-y-6 pb-12"
    >
      <header className="flex flex-col justify-between gap-4 border-b border-border pb-2 sm:flex-row sm:items-center">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Link
              href={lp("/dashboard")}
              className="flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Dashboard
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">Invitations</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Invitations
            </h1>
            {waiting > 0 && (
              <Badge
                variant="outline"
                className="h-7 rounded-full border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
              >
                {waiting} waiting
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Companies that have invited you onto their team. Accepting adds you
            to their workspace with the role they chose for you.
          </p>
        </div>

        {!isLoading && !isError && (
          <Button
            type="button"
            variant="outline"
            disabled={isFetching}
            onClick={() => void refetch()}
            aria-label="Check for new invitations"
            className="h-10 shrink-0 cursor-pointer rounded-xl px-4 text-sm font-semibold"
          >
            {isFetching ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
            ) : (
              <RefreshCcw className="size-4" />
            )}
            Refresh
          </Button>
        )}
      </header>

      <main className="flex flex-col gap-3">
        {isError ? (
          <LoadFailed
            error={error}
            isRetrying={isFetching}
            onRetry={() => void refetch()}
          />
        ) : isLoading ? (
          <InvitationsSkeleton />
        ) : waiting === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid grid-cols-1 gap-3">
            <AnimatePresence initial={false} mode="popLayout">
              {invitations.map((invitation) => (
                <InvitationRow
                  key={invitation.invitationToken}
                  invitation={invitation}
                  now={now}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </main>
    </motion.div>
  );
}

function InvitationRow({
  invitation,
  now,
}: {
  invitation: MyOrganizationInvitation;
  /** Null until the page has mounted; see `useNow`. */
  now: number | null;
}) {
  const [acceptInvitation, { isLoading }] =
    useAcceptOrganizationInvitationMutation();

  /* Held so the row can report its own success straight away. The refetch that
     removes it is a round trip behind, and a row vanishing under the cursor
     with only a toast to explain it is the worst moment on this screen. */
  const [accepted, setAccepted] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const organization = invitation.organizationName?.trim() || "An organization";
  const invitedBy = invitation.invitedByName?.trim();
  const role = roleCopy(invitation.role);

  /* Upstream filters expired invitations out, so this is only reached by a
     page left open past the deadline. Worth saying, rather than letting the
     accept come back 410. */
  const expiresAt = toDate(invitation.expiresAt);
  const expired = now !== null && !!expiresAt && expiresAt.getTime() <= now;
  /* Under a day left. Only the badge changes, so urgency reads without the
     list rearranging itself. */
  const urgent =
    now !== null &&
    !expired &&
    !!expiresAt &&
    expiresAt.getTime() - now < ONE_DAY_MS;

  /* Before the clock lands, the deadline is stated as the date it is — true
     without knowing what today is, and the same string on both sides of
     hydration. */
  const deadline = expired
    ? "Expired"
    : now === null
      ? `Expires ${formatDate(invitation.expiresAt)}`
      : `Expires ${formatTimeDistance(invitation.expiresAt, now, "soon")}`;

  async function handleAccept() {
    setFailure(null);

    try {
      await acceptInvitation({ token: invitation.invitationToken }).unwrap();
      setAccepted(true);

      toast.success({
        title: `You joined ${organization}`,
        description: `You are now a ${role.title.toLowerCase()} on their team.`,
      });
    } catch (error) {
      const message = acceptFailureMessage(error);
      setFailure(message);

      toast.destructive({
        title: "Invitation not accepted",
        description: message,
      });
    }
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.18 } }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-card p-5 transition-colors sm:flex-row sm:items-center sm:justify-between",
        accepted
          ? "border-emerald-300 dark:border-emerald-500/40"
          : "border-border",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <CompanyLogo
          organizationId={invitation.organizationId}
          name={organization}
          logoUrl={invitation.organizationLogoUrl ?? null}
          className="size-11"
        />

        <div className="min-w-0 space-y-1.5">
          <p className="text-base font-bold tracking-tight text-foreground">
            {organization}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="h-7 gap-1.5 rounded-full px-2.5 text-sm font-semibold text-muted-foreground"
            >
              <UserRound className="size-3.5" />
              {role.title}
            </Badge>

            {!accepted && (
              <Badge
                variant="outline"
                /* The exact moment, for anyone who needs to plan around it. */
                title={formatDateTime(invitation.expiresAt)}
                className={cn(
                  "h-7 gap-1.5 rounded-full px-2.5 text-sm font-semibold",
                  expired
                    ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                    : urgent
                      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                      : "text-muted-foreground",
                )}
              >
                <Clock3 className="size-3.5" />
                {deadline}
              </Badge>
            )}
          </div>

          {accepted ? (
            <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 aria-hidden className="size-4 shrink-0" />
              You are on the team — this invitation is done.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {invitedBy ? `Invited by ${invitedBy} · ` : ""}
                Sent {formatDate(invitation.invitedAt)}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <ShieldCheck aria-hidden className="size-4 shrink-0" />
                {role.access}
              </p>
            </>
          )}

          {failure && (
            <p
              role="alert"
              className="flex items-start gap-1.5 text-sm font-medium text-rose-700 dark:text-rose-300"
            >
              <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
              {failure}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {accepted ? (
          <span className="flex h-10 items-center gap-2 rounded-xl bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 className="size-4" />
            Joined
          </span>
        ) : (
          <Button
            type="button"
            disabled={isLoading || expired}
            onClick={() => void handleAccept()}
            aria-label={`Accept the invitation from ${organization}`}
            className="h-10 w-full cursor-pointer rounded-xl px-4 text-sm font-semibold sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {failure ? "Try again" : "Accept invitation"}
          </Button>
        )}
      </div>
    </motion.li>
  );
}

/**
 * The list could not be read at all.
 *
 * Split on the status because the ways out differ: a session that ended is
 * fixed by signing in, and nothing else here is fixed by anything but waiting.
 */
function LoadFailed({
  error,
  isRetrying,
  onRetry,
}: {
  error: unknown;
  isRetrying: boolean;
  onRetry: () => void;
}) {
  const pathname = usePathname();
  const { handleLogin, isLoggingIn } = useKeycloakLogin();
  const status = apiErrorStatus(error);
  const expired = status === 401 || status === 403;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      role="alert"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
        >
          <AlertCircle className="size-5" />
        </span>
        <div className="space-y-1">
          <p className="text-base font-bold tracking-tight text-foreground">
            {expired
              ? "Your session ended"
              : "Your invitations could not be loaded"}
          </p>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            {expired
              ? "Sign in again and you will come straight back to this list."
              : apiErrorMessage(
                  error,
                  "Something went wrong on the way to the organization service. Trying again is usually enough.",
                )}
          </p>
        </div>
      </div>

      {expired ? (
        <Button
          type="button"
          disabled={isLoggingIn}
          /* Carries this screen through the round trip, so signing in lands
             back on the invitations rather than the home page. */
          onClick={() => void handleLogin(pathname)}
          className="h-10 shrink-0 cursor-pointer rounded-xl px-4 text-sm font-semibold"
        >
          {isLoggingIn ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
          ) : (
            <LogIn className="size-4" />
          )}
          Log in again
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={isRetrying}
          onClick={onRetry}
          className="h-10 shrink-0 cursor-pointer rounded-xl px-4 text-sm font-semibold"
        >
          {isRetrying ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
          ) : (
            <RefreshCcw className="size-4" />
          )}
          Try again
        </Button>
      )}
    </motion.div>
  );
}

/** Shaped like the rows it stands in for, so nothing jumps when they arrive. */
function InvitationsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading your invitations"
      className="grid grid-cols-1 gap-3"
    >
      {[0, 1].map((row) => (
        <div
          key={row}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="size-11 shrink-0 animate-pulse rounded-xl bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-44 animate-pulse rounded-md bg-muted" />
              <div className="h-7 w-56 animate-pulse rounded-full bg-muted/70" />
              <div className="h-3.5 w-36 animate-pulse rounded-md bg-muted/70" />
            </div>
          </div>
          <div className="h-10 w-full animate-pulse rounded-xl bg-muted sm:w-40" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  const lp = useLocalePath();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-12 text-center"
    >
      <span
        aria-hidden
        className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
      >
        <MailQuestion className="size-6" />
      </span>
      <p className="text-base font-semibold text-foreground">
        No invitations waiting
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        When a company invites you onto its team, it shows up here and in your
        email. Anything you have already accepted, or that has expired, leaves
        this list on its own.
      </p>
      <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <MailOpen aria-hidden className="size-4 shrink-0" />
        An invitation only works for the address it was sent to.
      </p>
      <Link
        href={lp("/dashboard")}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "mt-2 h-10 rounded-xl px-4 text-sm font-semibold",
        )}
      >
        Back to dashboard
        <ArrowRight data-icon="inline-end" />
      </Link>
    </motion.div>
  );
}

export default MyInvitationsView;
