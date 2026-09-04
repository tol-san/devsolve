"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Clock3, KeyRound } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useOrganizationPermission } from "@/hooks/useOrganizationPermission";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import type { OrganizationInvitationPermission } from "@/lib/redux/services/organizationsApi";
import { cn } from "@/lib/utils";

export function RequireOrgPermission({
  permission,
  title,
  description,
  action,
  requireActiveOrganization = true,
  children,
}: {
  permission: OrganizationInvitationPermission;
  title: string;
  description: string;
  action?: { href: string; label: string };
  requireActiveOrganization?: boolean;
  children: React.ReactNode;
}) {
  const lp = useLocalePath();
  const { granted, isResolved } = useOrganizationPermission(permission);
  const { membership, isActive } = useCompanyAccess();

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

  if (granted && requireActiveOrganization && !isActive) {
    const rejected = membership?.organizationStatus === "REJECTED";

    return (
      <Notice
        icon={<Clock3 className="size-5.5" />}
        title={
          rejected
            ? `${membership?.organizationName ?? "This organization"} was not approved`
            : `${membership?.organizationName ?? "This organization"} is still under review`
        }
        description={
          rejected
            ? "DevSolve did not approve this organization, so its programs and reports are closed. Its owner can correct the submission and send it back for review."
            : "Programs and reports open up once DevSolve has verified the organization. Nothing here is lost in the meantime — the workspace fills in as soon as it is approved."
        }
        action={action}
        lp={lp}
      />
    );
  }

  if (granted) return <>{children}</>;

  return (
    <Notice
      icon={<KeyRound className="size-5.5" />}
      title={title}
      description={description}
      action={action}
      lp={lp}
    />
  );
}

function Notice({
  icon,
  title,
  description,
  action,
  lp,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { href: string; label: string };
  lp: (path: string) => string;
}) {
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
          {icon}
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
