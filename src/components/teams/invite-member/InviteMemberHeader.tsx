import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

export function InviteMemberHeader() {
  const lp = useLocalePath();

  return (
    <header className="flex flex-col justify-between gap-5 border-b border-border pb-6 sm:flex-row sm:items-end">
      <div className="space-y-4">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-sm font-medium text-muted-foreground"
        >
          <Link
            href={lp("/dashboard")}
            className="transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>

          <span className="text-muted-foreground/60">/</span>

          <Link
            href={lp("/dashboard/team-management")}
            className="transition-colors hover:text-foreground"
          >
            Team Management
          </Link>

          <span className="text-muted-foreground/60">/</span>

          <span className="font-semibold text-foreground">
            Invite Member
          </span>
        </nav>

        <div className="flex items-start gap-4">
          <div className="hidden size-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 sm:flex">
            <UserPlus className="size-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Invite a New Member
            </h1>

            <p className="mt-2 max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground">
              Add a trusted teammate to your organization and assign the
              appropriate role and permissions.
            </p>
          </div>
        </div>
      </div>

      <Link
        href={lp("/dashboard/team-management")}
        className={cn(
          buttonVariants({
            variant: "outline",
            size: "default",
          }),
          "h-11 shrink-0 rounded-xl border-border bg-card px-4 font-semibold text-foreground shadow-xs hover:bg-muted cursor-pointer",
        )}
      >
        <ArrowLeft className="size-4" />
        Back to members
      </Link>
    </header>
  );
}