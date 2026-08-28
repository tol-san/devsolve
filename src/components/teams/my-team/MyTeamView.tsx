"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ClipboardList,
  Clock3,
  MailOpen,
  Minus,
  PlusCircle,
  UserRoundCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import { CompanyLogo } from "@/components/researchers/CompanyLogo";
import {
  INVITE_PERMISSION_OPTIONS,
  INVITE_ROLE_OPTIONS,
} from "@/components/teams/invite-member/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { formatDate } from "@/lib/format/datetime";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import type {
  OrganizationInvitationPermission,
  OrganizationInvitationRole,
  OrganizationMembership,
} from "@/lib/redux/services/organizationsApi";
import { cn } from "@/lib/utils";

/**
 * Where a permission actually takes you.
 *
 * Only screens that exist and that the permission genuinely governs — a member
 * sent to a screen their permissions do not cover would meet a 403 the backend
 * is right to give them, and this page would have been the one that lied.
 */
const DESTINATIONS: {
  permissions: OrganizationInvitationPermission[];
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    permissions: ["VIEW_PROGRAMS"],
    href: "/dashboard/program-management",
    label: "Programs",
    description: "The programs this organization runs, and the state of each.",
    icon: Building2,
  },
  {
    permissions: ["CREATE_PROGRAM"],
    href: "/dashboard/create-program",
    label: "Create a program",
    description: "Open a new bounty or disclosure program.",
    icon: PlusCircle,
  },
  {
    permissions: ["VIEW_REPORTS", "TRIAGE_REPORTS"],
    href: "/dashboard/report-management",
    label: "Reports",
    description: "Vulnerability reports filed against those programs.",
    icon: ClipboardList,
  },
  {
    permissions: ["MANAGE_RESEARCHERS"],
    href: "/dashboard/researcher-access",
    label: "Researcher access",
    description: "Who may report to this organization.",
    icon: UserRoundCheck,
  },
];

const STATUS_COPY: Record<
  string,
  { label: string; className: string; note?: string }
> = {
  ACTIVE: {
    label: "Active",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  PENDING: {
    label: "Awaiting verification",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
    note: "Programs and reports open up once DevSolve has verified this organization. Your access is already set — there is nothing for you to do but wait.",
  },
  SUSPENDED: {
    label: "Suspended",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
    note: "While an organization is suspended its programs and reports are closed to everyone on the team.",
  },
  REJECTED: {
    label: "Not approved",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
    note: "DevSolve did not approve this organization, so its workspace is closed. Its owner can correct the submission and send it back for review.",
  },
};

function roleCopy(role: OrganizationInvitationRole | undefined) {
  const option = INVITE_ROLE_OPTIONS.find((entry) => entry.role === role);
  return {
    title: option?.title ?? "Member",
    access: option?.access ?? "Collaborate on programs and reports",
  };
}

/**
 * The organization this account was invited into, from the member's side.
 *
 * The company's own screens — Team Management, Organization — sit on owner-only
 * endpoints, so someone who accepted an invitation joined a team and then had
 * nowhere in the app that said so. This is that place, and it answers three
 * questions in the order they get asked: which organization am I on, what am I
 * allowed to do there, and where does that let me go.
 *
 * It cannot list teammates: the roster is `/organizations/me/members`, which
 * belongs to the owner.
 */
export function MyTeamView() {
  const lp = useLocalePath();
  const {
    membership,
    memberships,
    hasCompanyAccess,
    isLoading,
    switchOrganization,
  } = useCompanyAccess();

  if (isLoading) return <MyTeamSkeleton />;
  if (!hasCompanyAccess || !membership) return <NotOnATeam />;

  const name = membership.organizationName?.trim() || "Your organization";
  const status = STATUS_COPY[String(membership.organizationStatus)];
  const role = roleCopy(membership.role ?? undefined);
  const permissions = membership.permissions ?? [];
  const open = DESTINATIONS.filter((destination) =>
    destination.permissions.some((permission) =>
      permissions.includes(permission),
    ),
  );
  const others = memberships.slice(1);

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
          <span className="font-semibold text-foreground">My team</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          My team
        </h1>
        <p className="text-sm text-muted-foreground">
          The organization you were invited into, and what your access there
          covers.
        </p>
      </header>

      {/* Which organization, and what am I on it — one card, because the two
          answers are read together and used to be split across three. */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <CompanyLogo
              organizationId={membership.organizationId}
              name={name}
              logoUrl={membership.organizationLogoUrl ?? null}
              className="size-16"
            />

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {name}
                </h2>
                {status ? (
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-7 rounded-full px-2.5 text-sm font-semibold",
                      status.className,
                    )}
                  >
                    {status.label}
                  </Badge>
                ) : null}
              </div>

              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {membership.organizationSlug ? (
                  <span>@{membership.organizationSlug}</span>
                ) : null}
                {membership.joinedAt ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    Joined {formatDate(membership.joinedAt)}
                  </span>
                ) : null}
              </p>
            </div>
          </div>

          {/* The role, given the weight it deserves: it answers "what am I
              here", and it was a badge in a card of its own before. */}
          <div className="shrink-0 rounded-xl bg-muted/60 px-4 py-3 sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Your role
            </p>
            <p className="mt-0.5 text-lg font-bold tracking-tight text-foreground">
              {membership.owner ? "Owner" : role.title}
            </p>
            <p className="mt-0.5 max-w-xs text-sm text-muted-foreground">
              {membership.owner
                ? "You registered this organization"
                : role.access}
            </p>
          </div>
        </div>

        {status?.note ? (
          <p className="flex items-start gap-2.5 border-t border-border bg-muted/40 px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:px-6">
            <Clock3 aria-hidden className="mt-0.5 size-4 shrink-0" />
            {status.note}
          </p>
        ) : null}
      </section>

      {/* Where those permissions lead */}
      {open.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-base font-bold tracking-tight text-foreground">
            What you can open
          </h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {open.map((destination, index) => (
              <motion.li
                key={destination.href}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  ease: "easeOut",
                  delay: index * 0.03,
                }}
              >
                <Link
                  href={lp(destination.href)}
                  className="group flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/20"
                >
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-500/10 dark:group-hover:text-blue-400"
                  >
                    <destination.icon className="size-5" />
                  </span>
                  <span className="min-w-0 space-y-1">
                    <span className="flex items-center gap-1.5 text-base font-semibold text-foreground">
                      {destination.label}
                      <ArrowRight className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </span>
                    <span className="block text-sm leading-relaxed text-muted-foreground">
                      {destination.description}
                    </span>
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Every permission, held or not — the question this page gets asked is
          usually "why can't I see X?", and a list of only what you have cannot
          answer it. */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h2 className="text-base font-bold tracking-tight text-foreground">
            Your permissions
          </h2>
          <p className="text-sm text-muted-foreground">
            {permissions.length} of {INVITE_PERMISSION_OPTIONS.length} granted —
            an owner or manager sets these.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {INVITE_PERMISSION_OPTIONS.map((option) => {
            const held = permissions.includes(option.value);

            return (
              <li
                key={option.value}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3",
                  held
                    ? "border-border bg-card"
                    : "border-dashed border-border bg-transparent",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                    held
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {held ? (
                    <Check className="size-3" />
                  ) : (
                    <Minus className="size-3" />
                  )}
                </span>

                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-sm font-semibold",
                      held ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {option.title}
                  </span>
                  <span className="sr-only">
                    {held ? "Granted" : "Not granted"}
                  </span>
                  {held ? (
                    <span className="block text-sm leading-relaxed text-muted-foreground">
                      {option.description}
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* An account can be on more than one. The workspace shows the first, so
          naming the rest is the difference between "incomplete" and "wrong". */}
      {others.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-base font-bold tracking-tight text-foreground">
            Also on your account
          </h2>
          <ul className="grid grid-cols-1 gap-2">
            {others.map((other) => (
              <OtherMembership
                key={other.organizationId}
                membership={other}
                onSwitch={() => switchOrganization(other.organizationId)}
              />
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            The workspace is showing {name}. Switching points every company
            screen at the other organization and is remembered.
          </p>
        </section>
      ) : null}
    </motion.div>
  );
}

function OtherMembership({
  membership,
  onSwitch,
}: {
  membership: OrganizationMembership;
  onSwitch: () => void;
}) {
  const name = membership.organizationName?.trim() || "An organization";
  const status = STATUS_COPY[String(membership.organizationStatus)];

  return (
    <li className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:border-foreground/20">
      <div className="flex min-w-0 items-center gap-3">
        <CompanyLogo
          organizationId={membership.organizationId}
          name={name}
          logoUrl={membership.organizationLogoUrl ?? null}
          className="size-10"
        />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-foreground">
            {name}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {membership.owner
              ? "Owner"
              : roleCopy(membership.role ?? undefined).title}
            {membership.permissions?.length
              ? ` · ${membership.permissions.length} permissions`
              : ""}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {status ? (
          <Badge
            variant="outline"
            className={cn(
              "hidden h-7 rounded-full px-2.5 text-sm font-semibold sm:inline-flex",
              status.className,
            )}
          >
            {status.label}
          </Badge>
        ) : null}

        <Button
          type="button"
          variant="outline"
          onClick={onSwitch}
          className="h-9 cursor-pointer rounded-xl px-3 text-sm font-semibold"
        >
          <ArrowLeftRight className="size-4" />
          Switch
        </Button>
      </div>
    </li>
  );
}

/** Shaped like the page it stands in for. */
function MyTeamSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading your team"
      className="w-full space-y-6 pb-12"
    >
      <div className="h-16 animate-pulse rounded-2xl bg-muted/60" />
      <div className="h-32 animate-pulse rounded-2xl border border-border bg-muted/60" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="h-24 animate-pulse rounded-2xl border border-border bg-muted/60" />
        <div className="h-24 animate-pulse rounded-2xl border border-border bg-muted/60" />
      </div>
      <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted/60" />
    </div>
  );
}

/**
 * For everyone who is not on a team — which is most accounts, and is not a
 * failure. The way onto one is an invitation, so that is where this points.
 */
function NotOnATeam() {
  const lp = useLocalePath();

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
          <span className="font-semibold text-foreground">My team</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          My team
        </h1>
      </header>

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-12 text-center">
        <span
          aria-hidden
          className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
        >
          <Users className="size-6" />
        </span>
        <p className="text-base font-semibold text-foreground">
          You are not on a team yet
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          Companies add people to their workspace by invitation. When one
          invites you, it arrives in your email and on your invitations screen —
          accept it there and this page fills in.
        </p>
        <Link
          href={lp("/dashboard/invitations")}
          className={cn(
            buttonVariants({ variant: "default" }),
            "mt-2 h-10 rounded-xl px-4 text-sm font-semibold",
          )}
        >
          <MailOpen className="size-4" />
          Open invitations
        </Link>
      </div>
    </motion.div>
  );
}

export default MyTeamView;
