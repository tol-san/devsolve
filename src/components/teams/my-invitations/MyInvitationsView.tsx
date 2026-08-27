"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  Clock3,
  Loader2,
  MailOpen,
  MailQuestion,
  RefreshCcw,
  UserRound,
} from "lucide-react";

import { INVITE_ROLE_OPTIONS } from "@/components/teams/invite-member/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useNow } from "@/hooks/useNow";
import { apiErrorMessage, apiErrorStatus } from "@/lib/api/error-message";
import {
  formatDate,
  formatTimeDistance,
  hasPassed,
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

function roleTitle(role: OrganizationInvitationRole | undefined): string {
  return (
    INVITE_ROLE_OPTIONS.find((option) => option.role === role)?.title ??
    "Member"
  );
}

/** What went wrong, in the invitee's terms rather than the status code's. */
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

  const { data, isLoading, isError, isFetching, refetch } =
    useGetMyInvitationsQuery();

  /* One clock for the whole list, ticking so a deadline read as "in an hour"
     does not still say that an hour later. Null on the first render, which is
     what keeps the server's markup and the client's identical. */
  const now = useNow();

  const invitations = data ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full space-y-6 pb-12"
    >
      <header className="flex flex-col gap-1 border-b border-border pb-2">
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Invitations
        </h1>
        <p className="text-sm text-muted-foreground">
          Companies that have invited you onto their team. Accepting adds you to
          their workspace with the role they chose for you.
        </p>
      </header>

      <main className="flex flex-col gap-3">
        {isError ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-sm font-medium leading-relaxed text-foreground">
                Your invitations could not be loaded. Check that you are signed
                in, then try again.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={isFetching}
              onClick={() => void refetch()}
              className="h-10 shrink-0 cursor-pointer rounded-xl px-4 text-sm font-semibold"
            >
              {isFetching ? (
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
              ) : (
                <RefreshCcw className="size-4" />
              )}
              Try again
            </Button>
          </div>
        ) : isLoading ? (
          <div aria-busy="true" className="animate-pulse space-y-3">
            <div className="h-28 rounded-2xl border border-border bg-muted/60" />
            <div className="h-28 rounded-2xl border border-border bg-muted/60" />
          </div>
        ) : invitations.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid grid-cols-1 gap-3">
            {invitations.map((invitation, index) => (
              <InvitationRow
                key={invitation.invitationToken}
                invitation={invitation}
                index={index}
                now={now}
              />
            ))}
          </ul>
        )}
      </main>
    </motion.div>
  );
}

function InvitationRow({
  invitation,
  index,
  now,
}: {
  invitation: MyOrganizationInvitation;
  index: number;
  /** Null until the page has mounted; see `useNow`. */
  now: number | null;
}) {
  const [acceptInvitation, { isLoading }] =
    useAcceptOrganizationInvitationMutation();

  const organization = invitation.organizationName?.trim() || "An organization";
  const invitedBy = invitation.invitedByName?.trim();

  /* Upstream filters expired invitations out, so this is only reached by a
     page left open past the deadline. Worth saying, rather than letting the
     accept come back 410. */
  const expiresAt = toDate(invitation.expiresAt);
  const expired = now !== null && hasPassed(invitation.expiresAt, now);
  /* Under a day left. Only the badge changes, so urgency reads without the
     list rearranging itself. */
  const urgent =
    now !== null &&
    !expired &&
    !!expiresAt &&
    expiresAt.getTime() - now < ONE_DAY_MS;

  /* Before the clock lands, the deadline is stated as the date it is — true
     without needing to know what today is, and the same string on both sides
     of hydration. */
  const deadline = expired
    ? "Expired"
    : now === null
      ? `Expires ${formatDate(invitation.expiresAt)}`
      : `Expires ${formatTimeDistance(invitation.expiresAt, now, "soon")}`;

  async function handleAccept() {
    try {
      await acceptInvitation({ token: invitation.invitationToken }).unwrap();

      toast.success({
        title: `You joined ${organization}`,
        description: `You are now a ${roleTitle(
          invitation.role,
        ).toLowerCase()} on their team.`,
      });
    } catch (error) {
      toast.destructive({
        title: "Invitation not accepted",
        description: acceptFailureMessage(error),
      });
    }
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut", delay: index * 0.03 }}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3">
        <Avatar className="size-11 shrink-0 rounded-xl">
          {invitation.organizationLogoUrl && (
            <AvatarImage
              src={invitation.organizationLogoUrl}
              alt=""
              className="rounded-[inherit] object-cover"
            />
          )}
          <AvatarFallback className="rounded-[inherit] bg-muted text-muted-foreground">
            <Building2 className="size-5" />
          </AvatarFallback>
        </Avatar>

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
              {roleTitle(invitation.role)}
            </Badge>
            <Badge
              variant="outline"
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
          </div>

          <p className="text-sm text-muted-foreground">
            {invitedBy ? `Invited by ${invitedBy} · ` : ""}
            Sent {formatDate(invitation.invitedAt)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Button
          type="button"
          disabled={isLoading || expired}
          onClick={() => void handleAccept()}
          className="h-10 cursor-pointer rounded-xl px-4 text-sm font-semibold"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
          ) : (
            <Check className="size-4" />
          )}
          Accept invitation
        </Button>
      </div>
    </motion.li>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
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
      <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <MailOpen aria-hidden className="size-4 shrink-0" />
        An invitation only works for the address it was sent to.
      </p>
    </div>
  );
}

export default MyInvitationsView;
