"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Bug, ShieldAlert } from "lucide-react";
import { useGetHacktivityFeedQuery } from "@/lib/redux/services/hacktivityApi";
import type { HacktivityActivity } from "@/lib/types/hacktivity/types";
import { cn } from "@/lib/utils";
import { SEVERITY_STYLE, UNRATED_STYLE, formatMoney } from "./presentation";

/**
 * The three findings worth leading with.
 *
 * Drawn from the same stream as the feed, asked for by severity so the head of
 * the list is where the serious work is, then ordered by what was actually
 * paid. Only disclosed rows qualify: a card here names a vulnerability, and
 * nothing may name one before its program has published it.
 *
 * It asks separately from the feed on purpose — this strip is the page's
 * standing highlight and should not change every time a reader filters.
 */

const FEATURED_COUNT = 3;

function pickFeatured(activities: HacktivityActivity[]): HacktivityActivity[] {
  return activities
    .filter((activity) => activity.isDisclosed && activity.title)
    .sort((a, b) => {
      const paid = (activity: HacktivityActivity) =>
        activity.reward.kind === "cash" ? activity.reward.amount : 0;
      return paid(b) - paid(a);
    })
    .slice(0, FEATURED_COUNT);
}

export function FeaturedDisclosures() {
  const reduceMotion = useReducedMotion();
  const { data } = useGetHacktivityFeedQuery({
    size: 24,
    sort: "severity,DESC",
  });

  const featured = pickFeatured(data?.activities ?? []);

  // Nothing to feature is not a failure state — the strip simply steps aside.
  if (featured.length === 0) return null;

  return (
    <section aria-labelledby="featured-disclosures" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="featured-disclosures"
          className="text-xl font-bold tracking-tight text-foreground"
        >
          Featured disclosures
        </h2>
        <span className="text-sm font-medium text-muted-foreground">
          The most severe findings made public
        </span>
      </div>

      {/* Columns follow the count, so two findings do not leave a hole. */}
      <div
        className={cn(
          "grid gap-4",
          featured.length === 1
            ? "md:grid-cols-1"
            : featured.length === 2
              ? "md:grid-cols-2"
              : "md:grid-cols-3",
        )}
      >
        {featured.map((activity, index) => {
          const severity = activity.severity
            ? SEVERITY_STYLE[activity.severity]
            : UNRATED_STYLE;
          const programHref = activity.program?.id
            ? `/programs/${activity.program.id}`
            : undefined;

          return (
            <motion.article
              key={activity.id}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
              className="flex flex-col justify-between gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/5 transition-shadow hover:shadow-md dark:ring-foreground/10"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
                      severity.chip,
                    )}
                  >
                    <ShieldAlert aria-hidden className="size-3.5" />
                    {severity.label}
                  </span>

                  {activity.reward.kind === "cash" ? (
                    <span className="text-base font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatMoney(activity.reward.amount, activity.reward.currency)}
                    </span>
                  ) : null}
                </div>

                <h3 className="text-base font-bold leading-snug text-foreground text-pretty">
                  {activity.title}
                </h3>

                {activity.weakness ? (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Bug aria-hidden className="size-3.5 shrink-0" />
                    <span className="truncate">
                      {[activity.weakness.cweId, activity.weakness.name]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm">
                <span className="min-w-0 truncate text-muted-foreground">
                  Found by{" "}
                  {activity.researcher.username ? (
                    <Link
                      href={`/profile/${encodeURIComponent(activity.researcher.username)}`}
                      className="font-semibold text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                    >
                      {activity.researcher.name}
                    </Link>
                  ) : (
                    <span className="font-semibold text-foreground">
                      {activity.researcher.name}
                    </span>
                  )}
                </span>

                {activity.program ? (
                  programHref ? (
                    <Link
                      href={programHref}
                      className="shrink-0 font-semibold text-blue-600 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-blue-400"
                    >
                      {activity.program.name}
                    </Link>
                  ) : (
                    <span className="shrink-0 font-semibold text-foreground">
                      {activity.program.name}
                    </span>
                  )
                ) : null}
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
