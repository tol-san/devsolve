"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Loader2,
  LogIn,
  MailCheck,
  RefreshCcw,
  ShieldAlert,
  UserRoundX,
} from "lucide-react";
import { motion } from "motion/react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import {
  INVITE_PERMISSION_OPTIONS,
  INVITE_ROLE_OPTIONS,
} from "@/components/teams/invite-member/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";
import { useSidebarAuth } from "@/hooks/useSidebarAuth";
import { authClient } from "@/lib/auth/auth-client";
import { apiErrorMessage, apiErrorStatus } from "@/lib/api/error-message";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import {
  useAcceptOrganizationInvitationMutation,
  type OrganizationInvitationMember,
  type OrganizationInvitationPermission,
  type OrganizationInvitationRole,
} from "@/lib/redux/services/organizationsApi";
import { cn } from "@/lib/utils";

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
 * The page an invitation email lands on.
 *
 * Accepting needs a bearer token, so it cannot be a one-click link straight
 * from the email — the invitee has to be signed in first. It is a public route
 * rather than a `/dashboard` one for exactly that reason: the dashboard
 * middleware bounces anonymous visitors to the home page, which would throw
 * the token away before they ever got the chance to sign in.
 *
 * `RequireAuth` carries the current path through the login round trip, so the
 * token survives it.
 */
export function AcceptInvitationView({ token }: { token: string }) {
  const pathname = usePathname();

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
        <AcceptFlow token={token} />
      </RequireAuth>
    </motion.div>
  );
}

/**
 * Accepts on arrival, once.
 *
 * There is nothing to decide on this screen — following the link *is* the
 * decision — so it is spent rather than presented as a form. What the invitee
 * needs is the outcome, and for the outcomes that are their fault, a way out.
 */
function AcceptFlow({ token }: { token: string }) {
  const [acceptInvitation, { isLoading, isSuccess, data, error, reset }] =
    useAcceptOrganizationInvitationMutation();

  /* Fired once. React re-invokes an effect on mount under strict mode, and the
     upstream answers the second POST with 409 — an accept that worked would
     otherwise report itself as already used. Refs survive the double invoke,
     which a piece of state would not. */
  const fired = useRef(false);
  /* State, not a ref: it is read while rendering to decide which card to
     show, and a ref read during render is a value React never promised to
     have refreshed by then. */
  const [acceptedHere, setAcceptedHere] = useState(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    void acceptInvitation({ token })
      .unwrap()
      .then(() => setAcceptedHere(true))
      .catch(() => {
        /* Rendered from the mutation's own error state below. */
      });
  }, [acceptInvitation, token]);

  const retry = () => {
    reset();
    void acceptInvitation({ token })
      .unwrap()
      .then(() => setAcceptedHere(true))
      .catch(() => {});
  };

  /* A conflict that lands after this page has already accepted is this page
     seeing its own work, not a spent link. */
  const status = apiErrorStatus(error);
  if (isSuccess || (status === 409 && acceptedHere)) {
    return <AcceptedCard member={data} />;
  }

  if (error) return <FailedCard error={error} onRetry={retry} />;

  return <AcceptingCard isLoading={isLoading} />;
}

/** While the POST is in flight. */
function AcceptingCard({ isLoading }: { isLoading: boolean }) {
  const { data: session } = authClient.useSession();

  return (
    <div className={CARD}>
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/25"
      >
        {isLoading ? (
          <Loader2 className="size-5.5 animate-spin motion-reduce:animate-none" />
        ) : (
          <BadgeCheck className="size-5.5" />
        )}
      </span>

      <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        Accepting your invitation…
      </h1>
      <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
        Adding you to the organization workspace with the role and permissions
        they chose for you. This only takes a moment.
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
            . An invitation only works for the address it was sent to.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * What went wrong, keyed on the status rather than the wording.
 *
 * The five failures are genuinely different situations with different ways
 * out — the link is not yours, is unknown, is spent, or has aged out — and a
 * single "something went wrong" would leave the invitee with nothing to do.
 * The upstream's own sentence is shown underneath when it adds anything, but
 * the status is what decides the heading and the button.
 */
function FailedCard({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const lp = useLocalePath();
  const pathname = usePathname();
  const { handleLogin, isLoggingIn } = useKeycloakLogin();
  const { handleSignOut } = useSidebarAuth();

  const status = apiErrorStatus(error);
  const upstream = apiErrorMessage(error, "");

  const copy = {
    401: {
      title: "Your session ended",
      body: "Sign in again and you will come straight back to this invitation.",
    },
    403: {
      title: "This invitation was sent to a different account",
      body: "You are signed in as someone else. Switch to the account the invitation was addressed to, then open this link again.",
    },
    404: {
      title: "This invitation link is not valid",
      body: "The link may be incomplete, or the invitation may have been withdrawn. Ask the organization to send you a new one.",
    },
    409: {
      title: "This invitation has already been used",
      body: "It was accepted once already. If that was you, the workspace is on your dashboard.",
    },
    410: {
      title: "This invitation has expired",
      body: "Invitations last seven days. Ask the organization to send you a new one.",
    },
  }[status ?? 0] ?? {
    title: "The invitation could not be accepted",
    body: "Something went wrong on the way to the organization service. Trying again is usually enough.",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={CARD}
      role="alert"
    >
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/25"
      >
        {status === 403 ? (
          <UserRoundX className="size-5.5" />
        ) : status === 410 ? (
          <Clock3 className="size-5.5" />
        ) : (
          <ShieldAlert className="size-5.5" />
        )}
      </span>

      <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {copy.title}
      </h1>
      <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
        {copy.body}
      </p>

      {/* Kept when it says something the heading does not — the upstream names
          the organization on some of these. */}
      {upstream && upstream !== copy.body ? (
        <p className="mt-4 rounded-xl bg-muted/60 p-4 text-sm leading-relaxed text-muted-foreground">
          {upstream}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        {status === 401 ? (
          <Button
            type="button"
            disabled={isLoggingIn}
            onClick={() => void handleLogin(pathname)}
            className="h-11 rounded-xl bg-blue-600 px-5 text-base font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            {isLoggingIn ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
            ) : (
              <LogIn className="size-4" />
            )}
            Log in again
          </Button>
        ) : status === 403 ? (
          /* Signing out lands them back on the home page signed out; the
             invitation link is theirs to reopen with the right account. */
          <Button
            type="button"
            onClick={() => void handleSignOut()}
            className="h-11 rounded-xl bg-blue-600 px-5 text-base font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            <UserRoundX className="size-4" />
            Sign out and switch account
          </Button>
        ) : status === null || status >= 500 ? (
          /* A network failure or a service that fell over — the only failures
             here that trying again can fix. */
          <Button
            type="button"
            onClick={onRetry}
            className="h-11 rounded-xl bg-blue-600 px-5 text-base font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            <RefreshCcw className="size-4" />
            Try again
          </Button>
        ) : null}

        <Link
          href={lp("/dashboard")}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 rounded-xl px-5 text-base font-semibold",
          )}
        >
          Go to dashboard
        </Link>
      </div>
    </motion.div>
  );
}

/** What the invitee actually got, read back from the accept response. */
function AcceptedCard({ member }: { member?: OrganizationInvitationMember }) {
  const lp = useLocalePath();
  const permissions = member?.permissions ?? [];

  /* The accept response carries the member, not the organization — so the
     name comes from the membership the accept has just created. Accepting
     invalidates the memberships tag, so this is the freshly written row rather
     than a stale one. */
  const { membership } = useCompanyAccess();
  const organizationName = membership?.organizationName?.trim();

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
        {organizationName
          ? `You are on the team at ${organizationName}`
          : "You are on the team"}
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
              {roleTitle(member?.role ?? undefined)}
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
        {/* Their own view of the workspace. `/dashboard/team-management` is
            the owner's roster and is gated to a company account, so it is the
            one screen a brand new member cannot open. */}
        <Link
          href={lp("/dashboard/my-team")}
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-11 rounded-xl bg-blue-600 px-5 text-base font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500",
          )}
        >
          Go to the team
          <ArrowRight className="size-4" />
        </Link>

        <Link
          href={lp("/dashboard")}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 rounded-xl px-5 text-base font-semibold",
          )}
        >
          Open dashboard
        </Link>
      </div>
    </motion.div>
  );
}

export default AcceptInvitationView;
