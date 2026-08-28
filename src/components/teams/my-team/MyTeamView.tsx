"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  ClipboardList,
  MailOpen,
  PlusCircle,
  ShieldCheck,
  UserRound,
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
import { buttonVariants } from "@/components/ui/button";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { formatDate } from "@/lib/format/datetime";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import type {
  OrganizationInvitationPermission,
  OrganizationInvitationRole,
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
    description: "The programs this organization runs, and what state each is in.",
    icon: Building2,
  },
  {
    permissions: ["CREATE_PROGRAM"],
    href: "/dashboard/create-program",
    label: "Create a program",
    description: "Open a new bounty or disclosure program for the organization.",
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
    description: "Decide which researchers may report to this organization.",
    icon: UserRoundCheck,
  },
];

const STATUS_COPY: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  PENDING: {
    label: "Awaiting verification",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  },
  SUSPENDED: {
    label: "Suspended",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  },
  REJECTED: {
    label: "Rejected",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  },
};

function roleCopy(role: OrganizationInvitationRole | undefined) {
  const option = INVITE_ROLE_OPTIONS.find((entry) => entry.role === role);
  return {
    title: option?.title ?? "Member",
    access: option?.access ?? "Collaborate on programs and reports",
  };
}

function permissionTitle(permission: OrganizationInvitationPermission): string {
  return (
    INVITE_PERMISSION_OPTIONS.find((option) => option.value === permission)
      ?.title ?? permission
  );
}

/**
 * The organization this account was invited into, from the member's side.
 *
 * The company's own screens — Team Management, Organization — are the owner's
 * view of the same workspace and are role-gated to a company account. Someone
 * who accepted an invitation holds no such role, so until this page existed
 * they joined a team and then had nowhere in the app that said so.
 *
 * What it answers, in the order it is asked: which organization am I on, what
 * am I there, what does that let me open, and who else is here.
 */
export function MyTeamView() {
  const lp = useLocalePath();
  const { membership, hasCompanyAccess, isLoading } = useCompanyAccess();

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
          The organization you were invited into, what you can do there, and who
          else is on it.
        </p>
      </header>

      {/* The organization itself */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <CompanyLogo
            organizationId={membership.organizationId}
            name={name}
            logoUrl={membership.organizationLogoUrl ?? null}
            className="size-14"
          />
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {name}
              </h2>
              {status && (
                <Badge
                  variant="outline"
                  className={cn(
                    "h-7 rounded-full px-2.5 text-sm font-semibold",
                    status.className,
                  )}
                >
                  {status.label}
                </Badge>
              )}
            </div>

            {/* The membership carries identity, not the full profile: the
                organization's own record is an owner endpoint. */}
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {membership.organizationSlug ? (
                <span>@{membership.organizationSlug}</span>
              ) : null}
              {membership.owner ? <span>You own this organization</span> : null}
            </p>
          </div>
        </div>

      </section>

      {/* What this account is on that team */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <UserRound className="size-4 text-muted-foreground" />
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Your role
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="h-7 rounded-full px-2.5 text-sm font-semibold text-muted-foreground"
            >
              {role.title}
            </Badge>
            {membership.joinedAt ? (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-3.5" />
                Joined {formatDate(membership.joinedAt)}
              </span>
            ) : null}
          </div>

          <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
            {role.access}
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-base font-bold tracking-tight text-foreground">
            Permissions
          </h2>

          {permissions.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {permissions.map((permission) => (
                <li key={permission}>
                  <Badge
                    variant="secondary"
                    className="rounded-lg text-sm font-medium"
                  >
                    {permissionTitle(permission)}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your permissions are not listed here. An owner or manager sets
              them from team management, and the backend is the one that
              enforces them on every request.
            </p>
          )}
        </div>
      </section>

      {/* Where those permissions lead */}
      {open.length > 0 && (
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
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"
                  >
                    <destination.icon className="size-5" />
                  </span>
                  <span className="min-w-0 space-y-1">
                    <span className="flex items-center gap-1.5 text-base font-semibold text-foreground">
                      {destination.label}
                      <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
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
      )}

    </motion.div>
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
      <div className="h-28 animate-pulse rounded-2xl border border-border bg-muted/60" />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="h-36 animate-pulse rounded-2xl border border-border bg-muted/60" />
        <div className="h-36 animate-pulse rounded-2xl border border-border bg-muted/60" />
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
