"use client";

import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

export function TeamsPageHeader() {
  const lp = useLocalePath();

  return (
    <header className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
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
          <span className="font-semibold text-foreground">Team</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Team Management
        </h1>

        <p className="text-sm text-muted-foreground">
          Everyone with access to this organization&apos;s workspace, what each
          of them may do, and who is still deciding.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Link
          href={lp("/dashboard/team-management/invite")}
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-11 cursor-pointer rounded-xl px-4 text-sm font-semibold",
          )}
        >
          <UserPlus data-icon="inline-start" />
          Invite member
        </Link>
      </div>
    </header>
  );
}
