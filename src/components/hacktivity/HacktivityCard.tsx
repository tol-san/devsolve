"use client";

import Link from "next/link";
import {
  Award,
  Bug,
  Building2,
  Clock,
  Lock,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRelativeTime } from "@/lib/i18n/relative-time";
import type { HacktivityActivity } from "@/lib/types/hacktivity/types";
import { cn } from "@/lib/utils";
import {
  SEVERITY_STYLE,
  UNRATED_STYLE,
  eventPhrase,
  formatCount,
  formatMoney,
  formatUtc,
} from "./presentation";

const focusRing =
  "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-card";

function initialsOf(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "DS"
  );
}

/** Renders as a link only when there is somewhere real to go. */
function Noun({
  href,
  className,
  children,
}: {
  href?: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (!href)
    return (
      <span className={cn("font-semibold text-foreground", className)}>
        {children}
      </span>
    );

  return (
    <Link
      href={href}
      className={cn(
        "font-semibold text-foreground underline-offset-4 transition-colors hover:text-blue-600 hover:underline dark:hover:text-blue-400",
        focusRing,
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function HacktivityCard({ activity }: { activity: HacktivityActivity }) {
  const relative = useRelativeTime();
  const severity = activity.severity
    ? SEVERITY_STYLE[activity.severity]
    : UNRATED_STYLE;
  const { researcher, program, organization, reward } = activity;

  const profileHref = researcher.username
    ? `/profile/${encodeURIComponent(researcher.username)}`
    : undefined;
  const programHref = program?.id ? `/programs/${program.id}` : undefined;
  const organizationHref = organization?.id
    ? `/company?id=${organization.id}`
    : undefined;

  const target = program ?? organization;
  const targetHref = program ? programHref : organizationHref;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5.5 shadow-xs transition-all duration-200 hover:border-border hover:shadow-md">
      {/* Severity rail indicator */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-1 rounded-l-2xl transition-all group-hover:w-1.5",
          severity.rail,
        )}
      />

      <div className="grid gap-4 pl-2 sm:grid-cols-[1fr_auto] sm:gap-6 sm:pl-3">
        <div className="min-w-0 space-y-3">
          {/* Researcher & Action Header */}
          <div className="flex items-start gap-3">
            <Avatar className="mt-0.5 size-10 shrink-0 ring-1 ring-border/80 transition-transform group-hover:scale-105">
              <AvatarImage src={researcher.avatarUrl} alt="" />
              <AvatarFallback className="bg-muted text-xs font-bold text-foreground">
                {initialsOf(researcher.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="text-sm sm:text-base leading-snug text-muted-foreground">
                {activity.eventType === "REPORT_RESOLVED" ? (
                  <p>
                    {target ? (
                      <Noun href={targetHref}>{target.name}</Noun>
                    ) : (
                      "An organization"
                    )}{" "}
                    resolved a{" "}
                    {activity.severity ? (
                      <span className="font-bold text-foreground">
                        {activity.severity}
                      </span>
                    ) : null}{" "}
                    severity report by{" "}
                    <Noun href={profileHref}>
                      {researcher.username ? `@${researcher.username}` : researcher.name}
                    </Noun>
                  </p>
                ) : activity.eventType === "REPORT_DISCLOSED" ? (
                  <p>
                    <Noun href={profileHref}>
                      {researcher.username ? `@${researcher.username}` : researcher.name}
                    </Noun>{" "}
                    disclosed a{" "}
                    {activity.severity ? (
                      <span className="font-bold text-foreground">
                        {activity.severity}
                      </span>
                    ) : null}{" "}
                    severity finding in{" "}
                    {target ? (
                      <Noun href={targetHref}>{target.name}</Noun>
                    ) : (
                      "a program"
                    )}
                  </p>
                ) : activity.eventType === "BOUNTY_AWARDED" ? (
                  <p>
                    <Noun href={profileHref}>
                      {researcher.username ? `@${researcher.username}` : researcher.name}
                    </Noun>{" "}
                    earned{" "}
                    {reward.kind === "cash" ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(reward.amount, reward.currency)}
                      </span>
                    ) : (
                      "a bounty"
                    )}{" "}
                    from{" "}
                    {target ? (
                      <Noun href={targetHref}>{target.name}</Noun>
                    ) : (
                      "a program"
                    )}
                  </p>
                ) : activity.eventType === "RECOGNITION_AWARDED" ? (
                  <p>
                    <Noun href={profileHref}>
                      {researcher.username ? `@${researcher.username}` : researcher.name}
                    </Noun>{" "}
                    was recognised by{" "}
                    {target ? (
                      <Noun href={targetHref}>{target.name}</Noun>
                    ) : (
                      "an organization"
                    )}
                  </p>
                ) : (
                  <p>
                    <Noun href={profileHref}>
                      {researcher.username ? `@${researcher.username}` : researcher.name}
                    </Noun>{" "}
                    {eventPhrase(activity.eventType)}{" "}
                    {target ? (
                      <Noun href={targetHref}>{target.name}</Noun>
                    ) : (
                      "a program"
                    )}
                  </p>
                )}
              </div>

              {/* Researcher metadata pills & timestamp */}
              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
                {researcher.username ? (
                  <span className="font-medium text-foreground/80">
                    @{researcher.username}
                  </span>
                ) : null}

                {typeof researcher.reputation === "number" ? (
                  <>
                    <span aria-hidden className="text-border">·</span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 font-medium tabular-nums text-foreground">
                      {formatCount(researcher.reputation)} rep
                    </span>
                  </>
                ) : null}

                {activity.createdAt ? (
                  <>
                    <span aria-hidden className="text-border">·</span>
                    <time
                      dateTime={activity.createdAt}
                      title={formatUtc(activity.createdAt)}
                      className="transition-colors hover:text-foreground"
                    >
                      {relative(activity.createdAt)}
                    </time>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Finding Title or Disclosure State */}
          {activity.disclosureStatus === "DISCLOSED" && activity.title ? (
            <h3 className="text-base sm:text-lg font-bold leading-snug tracking-tight text-foreground text-pretty transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {activity.title}
            </h3>
          ) : activity.disclosureStatus === "PENDING_DISCLOSURE" ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-300">
              <Clock
                aria-hidden
                className="size-4 shrink-0 text-amber-600 dark:text-amber-400 animate-pulse"
              />
              <span className="font-semibold">Disclosure pending</span>
              <span className="text-xs text-amber-700/80 dark:text-amber-300/80 font-normal hidden sm:inline">
                — awaiting public release by program
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground">
              <Lock aria-hidden className="size-4 shrink-0 text-muted-foreground/80" />
              <span className="font-medium text-foreground/80">
                Undisclosed finding
              </span>
              <span className="text-xs text-muted-foreground/70 font-normal hidden sm:inline">
                — vulnerability details remain confidential
              </span>
            </div>
          )}

          {activity.recognition ? (
            <p className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
              <Sparkles aria-hidden className="size-3.5 shrink-0 text-amber-500" />
              <span className="truncate">{activity.recognition}</span>
            </p>
          ) : null}

          {/* Classification Tags & Metadata */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span
              title={
                activity.severity ? undefined : "Severity is still being agreed"
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
                severity.chip,
              )}
            >
              <ShieldAlert aria-hidden className="size-3.5" />
              {severity.label}
            </span>

            {activity.weakness ? (
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border/70 bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                <Bug aria-hidden className="size-3.5 shrink-0 text-muted-foreground/80" />
                <span className="truncate">
                  {[activity.weakness.cweId, activity.weakness.name]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
            ) : null}

            {organization && program ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Building2 className="size-3 text-muted-foreground/70" />
                {organizationHref ? (
                  <Link
                    href={organizationHref}
                    className={cn(
                      "underline-offset-4 hover:text-foreground hover:underline",
                      focusRing,
                    )}
                  >
                    {organization.name}
                  </Link>
                ) : (
                  organization.name
                )}
              </span>
            ) : null}
          </div>
        </div>

        {/* Reward / Outcome Column */}
        <div className="flex items-center justify-between gap-3 border-t border-border/80 pt-3 sm:min-w-[8.5rem] sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <Reward reward={reward} eventType={activity.eventType} />
        </div>
      </div>
    </article>
  );
}

function Reward({
  reward,
  eventType,
}: {
  reward: HacktivityActivity["reward"];
  eventType?: string;
}) {
  if (reward.kind === "cash") {
    return (
      <div className="flex flex-col items-start gap-1 sm:items-end">
        <span className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xl sm:text-2xl font-extrabold tracking-tight text-emerald-600 tabular-nums dark:text-emerald-400">
          {formatMoney(reward.amount, reward.currency)}
        </span>
        {reward.points ? (
          <span className="text-xs font-semibold text-muted-foreground">
            +{formatCount(reward.points)} pts
          </span>
        ) : null}
      </div>
    );
  }

  if (reward.kind === "points") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
        <Award aria-hidden className="size-4 text-indigo-600 dark:text-indigo-400" />
        {formatCount(reward.points)} pts
      </span>
    );
  }

  if (eventType === "REPORT_RESOLVED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
        Resolved
      </span>
    );
  }

  if (eventType === "REPORT_DISCLOSED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
        Disclosed
      </span>
    );
  }

  return (
    <span className="text-xs font-medium text-muted-foreground">
      No cash bounty
    </span>
  );
}

/** Matches the refreshed card geometry */
export function HacktivityCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5.5 shadow-xs">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-border" />
      <div className="grid animate-pulse gap-4 pl-2 sm:grid-cols-[1fr_auto] sm:gap-6 sm:pl-3">
        <div className="min-w-0 space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 size-10 shrink-0 rounded-full bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-2/5 rounded bg-muted" />
              <div className="h-3 w-1/4 rounded bg-muted" />
            </div>
          </div>
          <div className="h-5 w-3/4 rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-5 w-20 rounded-full bg-muted" />
            <div className="h-5 w-36 rounded-full bg-muted" />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border/80 pt-3 sm:min-w-[8.5rem] sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <div className="h-8 w-24 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

