import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import PageBackdrop from "@/components/layout/PageBackdrop";
import { cn } from "@/lib/utils";

export const NOT_FOUND_DEFAULTS = {
  code: "404",
  title: "Page not found",
  description:
    "The page you are looking for does not exist or may have been moved. Let's get you back to a safe place.",
  homeHref: "/",
  homeLabel: "Back home",
  browseHref: "/program",
  browseLabel: "Browse programs",
} as const;

export type NotFoundProps = {
  className?: string;
  code?: string;
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
  browseHref?: string;
  browseLabel?: string;
};

export function NotFoundStage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      {/* 404 renders outside the route-group layouts, so it carries the shared
          surface itself rather than inheriting one. */}
      <PageBackdrop seed={11} />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-[1280px] items-center px-4 py-12 sm:px-6 lg:px-8">
        <section
          className={cn(
            "mx-auto flex w-full max-w-4xl flex-col items-center gap-8 rounded-[40px] border border-slate-200 bg-white/88 px-6 py-12 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.65)_inset,0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/82 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_24px_60px_rgba(2,6,23,0.36)] sm:px-10 sm:py-14",
            className,
          )}
        >
          <div className="flex flex-col items-center gap-4">
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/25 dark:bg-blue-500/12 dark:text-blue-200"
            >
              DevSolve Navigation
            </Badge>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

export function NotFoundActions({
  homeHref = NOT_FOUND_DEFAULTS.homeHref,
  homeLabel = NOT_FOUND_DEFAULTS.homeLabel,
  browseHref = NOT_FOUND_DEFAULTS.browseHref,
  browseLabel = NOT_FOUND_DEFAULTS.browseLabel,
}: Pick<
  NotFoundProps,
  "homeHref" | "homeLabel" | "browseHref" | "browseLabel"
>) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Link
        href={homeHref}
        className={cn(
          buttonVariants({ variant: "default", size: "lg" }),
          "rounded-full bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)] hover:bg-blue-700",
        )}
      >
        <ArrowLeft data-icon="inline-start" />
        {homeLabel}
      </Link>

      <Link
        href={browseHref}
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "rounded-full border-slate-300 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-white/12 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-400/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-200",
        )}
      >
        <Compass data-icon="inline-start" />
        {browseLabel}
      </Link>
    </div>
  );
}
