"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ShieldOff } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useSidebarAuth } from "@/hooks/useSidebarAuth";
import type { OrganizationInvitationPermission } from "@/lib/redux/services/organizationsApi";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

export function RequireRole({
  roles,
  orPermission,
  title,
  description,
  action,
  children,
}: {
  roles: string[];
  orPermission?: OrganizationInvitationPermission;
  title: string;
  description: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  const lp = useLocalePath();
  const { user, areRolesResolved } = useSidebarAuth();
  const { can, isLoading: isMembershipLoading } = useCompanyAccess();

  const holdsPermission = Boolean(orPermission && can(orPermission));

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
