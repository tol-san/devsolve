"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Bug, Flame, ShieldAlert } from "lucide-react";
import { useGetHacktivityFeedQuery } from "@/lib/redux/services/hacktivityApi";
import type { HacktivityActivity } from "@/lib/types/hacktivity/types";
import { cn } from "@/lib/utils";
import { SEVERITY_STYLE, UNRATED_STYLE, formatMoney } from "./presentation";

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

interface FeaturedDisclosuresProps {
  initialActivities?: HacktivityActivity[] | null;
}

export function FeaturedDisclosures({
  initialActivities,
}: FeaturedDisclosuresProps = {}) {
  const reduceMotion = useReducedMotion();
  const { data } = useGetHacktivityFeedQuery({
    size: 24,
    sort: "severity,DESC",
  });

  const featured = pickFeatured(data?.activities ?? initialActivities ?? []);

  if (featured.length === 0) return null;

  return (
    <section aria-labelledby="featured-disclosures" className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Flame aria-hidden className="size-4" />
          </div>
          <h2
            id="featured-disclosures"
            className="text-lg sm:text-xl font-bold tracking-tight text-foreground"
          >
            Featured disclosures
          </h2>
        </div>
        <span className="text-xs sm:text-sm font-medium text-muted-foreground">
          Top severe findings made public
        </span>
      </div>

      {/* Grid of featured disclosure cards */}
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
              className="group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition-all duration-200 hover:border-border hover:shadow-md"
            >
              {/* Top severity accent glow line */}
              <div
                aria-hidden
                className={cn("absolute inset-x-0 top-0 h-1", severity.rail)}
              />

              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
                      severity.chip,
                    )}
                  >
                    <ShieldAlert aria-hidden className="size-3.5" />
                    {severity.label}
                  </span>

                  {activity.reward.kind === "cash" ? (
                    <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-sm font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatMoney(
                        activity.reward.amount,
                        activity.reward.currency,
                      )}
                    </span>
                  ) : null}
                </div>

                <h3 className="text-sm sm:text-base font-bold leading-snug tracking-tight text-foreground text-pretty transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {activity.title}
                </h3>

                {activity.weakness ? (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Bug aria-hidden className="size-3.5 shrink-0 text-muted-foreground/80" />
                    <span className="truncate">
                      {[activity.weakness.cweId, activity.weakness.name]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/80 pt-3 text-xs sm:text-sm">
                <span className="min-w-0 truncate text-muted-foreground">
                  Found by{" "}
                  {activity.researcher.username ? (
                    <Link
                      href={`/profile/${encodeURIComponent(activity.researcher.username)}`}
                      className="font-semibold text-foreground underline-offset-4 hover:text-blue-600 hover:underline focus-visible:outline-none"
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
                      className="shrink-0 font-semibold text-blue-600 underline-offset-4 hover:underline focus-visible:outline-none dark:text-blue-400"
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

