"use client";

import Link from "next/link";
import { Award, Bug, Clock, Lock, ShieldAlert, Sparkles } from "lucide-react";
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

/**
 * One row of the stream.
 *
 * Reads as a sentence — who found something, where, and what it was worth —
 * with the money set as the largest thing on the card, because that is what a
 * hacktivity page is opened to see. Severity always carries a word beside its
 * colour, and a title only appears once its report is actually disclosed.
 */

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-card";

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
function Noun({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return <span className="font-semibold text-foreground">{children}</span>;

  return (
    <Link
      href={href}
      className={cn(
        "font-semibold text-foreground underline-offset-4 hover:text-blue-600 hover:underline dark:hover:text-blue-400",
        focusRing,
      )}
    >
      {children}
    </Link>
  );
}

export function HacktivityCard({ activity }: { activity: HacktivityActivity }) {
  const relative = useRelativeTime();
  const severity = activity.severity ? SEVERITY_STYLE[activity.severity] : UNRATED_STYLE;
  const { researcher, program, organization, reward } = activity;

  const profileHref = researcher.username
    ? `/profile/${encodeURIComponent(researcher.username)}`
    : undefined;
  /* Programs and organizations are addressed by id today — the handle and slug
     arrive on the row, but no route resolves them yet. */
  const programHref = program?.id ? `/programs/${program.id}` : undefined;
  const organizationHref = organization?.id
    ? `/company?id=${organization.id}`
    : undefined;

  const target = program ?? organization;
  const targetHref = program ? programHref : organizationHref;

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/5 transition-shadow hover:shadow-md dark:ring-foreground/10">
      {/* Severity rail — a second, glanceable read of the chip below. */}
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-1", severity.rail)}
      />

      <div className="grid gap-4 py-5 pl-5 pr-4 sm:grid-cols-[1fr_auto] sm:gap-6 sm:pl-6">
        <div className="min-w-0 space-y-3">
          {/* Who */}
          <div className="flex items-start gap-3">
            <Avatar size="lg" className="mt-0.5 shrink-0">
              <AvatarImage src={researcher.avatarUrl} alt="" />
              <AvatarFallback>{initialsOf(researcher.name)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              {activity.eventType === "REPORT_RESOLVED" ? (
                <p className="text-base leading-snug text-muted-foreground">
                  {target ? <Noun href={targetHref}>{target.name}</Noun> : "An organization"}{" "}
                  resolved a{" "}
                  {activity.severity ? (
                    <strong className="font-bold text-foreground">
                      {activity.severity}
                    </strong>
                  ) : null}{" "}
                  severity report by{" "}
                  <Noun href={profileHref}>
                    {researcher.username ? `@${researcher.username}` : researcher.name}
                  </Noun>
                </p>
              ) : activity.eventType === "REPORT_DISCLOSED" ? (
                <p className="text-base leading-snug text-muted-foreground">
                  <Noun href={profileHref}>
                    {researcher.username ? `@${researcher.username}` : researcher.name}
                  </Noun>{" "}
                  disclosed a{" "}
                  {activity.severity ? (
                    <strong className="font-bold text-foreground">
                      {activity.severity}
                    </strong>
                  ) : null}{" "}
                  severity finding in{" "}
                  {target ? <Noun href={targetHref}>{target.name}</Noun> : "a program"}
                </p>
              ) : activity.eventType === "BOUNTY_AWARDED" ? (
                <p className="text-base leading-snug text-muted-foreground">
                  <Noun href={profileHref}>
                    {researcher.username ? `@${researcher.username}` : researcher.name}
                  </Noun>{" "}
                  earned{" "}
                  {reward.kind === "cash" ? (
                    <strong className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(reward.amount, reward.currency)}
                    </strong>
                  ) : (
                    "a bounty"
                  )}{" "}
                  from {target ? <Noun href={targetHref}>{target.name}</Noun> : "a program"}
                </p>
              ) : activity.eventType === "RECOGNITION_AWARDED" ? (
                <p className="text-base leading-snug text-muted-foreground">
                  <Noun href={profileHref}>
                    {researcher.username ? `@${researcher.username}` : researcher.name}
                  </Noun>{" "}
                  was recognised by{" "}
                  {target ? <Noun href={targetHref}>{target.name}</Noun> : "an organization"}
                </p>
              ) : (
                <p className="text-base leading-snug text-muted-foreground">
                  <Noun href={profileHref}>
                    {researcher.username ? `@${researcher.username}` : researcher.name}
                  </Noun>{" "}
                  {eventPhrase(activity.eventType)}{" "}
                  {target ? <Noun href={targetHref}>{target.name}</Noun> : "a program"}
                </p>
              )}

              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
                {researcher.username ? (
                  <span className="font-medium">@{researcher.username}</span>
                ) : null}
                {typeof researcher.reputation === "number" ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>{formatCount(researcher.reputation)} rep</span>
                  </>
                ) : null}
                {activity.createdAt ? (
                  <>
                    <span aria-hidden>·</span>
                    <time
                      dateTime={activity.createdAt}
                      title={formatUtc(activity.createdAt)}
                    >
                      {relative(activity.createdAt)}
                    </time>
                  </>
                ) : null}
              </p>
            </div>
          </div>

          {/* What: Driven by disclosureStatus */}
          {activity.disclosureStatus === "DISCLOSED" && activity.title ? (
            <h3 className="text-base font-bold leading-snug text-foreground text-pretty">
              {activity.title}
            </h3>
          ) : activity.disclosureStatus === "PENDING_DISCLOSURE" ? (
            <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-amber-700 dark:text-amber-300">
              <Clock aria-hidden className="size-4 shrink-0 text-amber-500 animate-pulse" />
              <span className="font-semibold">Disclosure pending</span>
              <span className="text-xs text-muted-foreground font-normal hidden sm:inline">
                — public disclosure requested and awaiting publication
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-muted-foreground">
              <Lock aria-hidden className="size-4 shrink-0 text-muted-foreground/80" />
              <span className="font-medium">Undisclosed finding</span>
              <span className="text-xs text-muted-foreground/70 font-normal hidden sm:inline">
                — vulnerability details remain confidential
              </span>
            </div>
          )}

          {activity.recognition ? (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Sparkles aria-hidden className="size-3.5 shrink-0 text-amber-500" />
              <span className="truncate">{activity.recognition}</span>
            </p>
          ) : null}

          {/* Classification: severity leads, the weakness sits quieter beside it. */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              title={
                activity.severity ? undefined : "Severity is still being agreed"
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
                severity.chip,
              )}
            >
              <ShieldAlert aria-hidden className="size-3.5" />
              {severity.label}
            </span>

            {activity.weakness ? (
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Bug aria-hidden className="size-3.5 shrink-0" />
                <span className="truncate">
                  {[activity.weakness.cweId, activity.weakness.name]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
            ) : null}

            {organization && program ? (
              <span className="text-xs font-medium text-muted-foreground">
                at{" "}
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

        {/* What it was worth */}
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3 sm:min-w-[7.5rem] sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <Reward reward={reward} eventType={activity.eventType} />
        </div>
      </div>
    </article>
  );
}

/**
 * Money and points are deliberately different objects. Points are an outcome
 * in their own right, not a bounty of zero, so they never borrow the numerals
 * a paid bounty uses.
 */
function Reward({
  reward,
  eventType,
}: {
  reward: HacktivityActivity["reward"];
  eventType?: string;
}) {
  if (reward.kind === "cash") {
    return (
      <div className="flex flex-col items-start gap-0.5 sm:items-end">
        <span className="text-2xl font-extrabold tracking-tight text-emerald-600 tabular-nums dark:text-emerald-400">
          {formatMoney(reward.amount, reward.currency)}
        </span>
        {reward.points ? (
          <span className="text-xs font-medium text-muted-foreground">
            +{formatCount(reward.points)} pts
          </span>
        ) : null}
      </div>
    );
  }

  if (reward.kind === "points") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-500/25">
        <Award aria-hidden className="size-4" />
        {formatCount(reward.points)} points
      </span>
    );
  }

  if (eventType === "REPORT_RESOLVED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-500/20">
        Resolved
      </span>
    );
  }

  if (eventType === "REPORT_DISCLOSED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-500/20">
        Disclosed
      </span>
    );
  }

  return (
    <span className="text-sm font-medium text-muted-foreground">No bounty</span>
  );
}

/** Matches the card's geometry so nothing moves when the real rows land. */
export function HacktivityCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/5 dark:ring-foreground/10">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-border" />
      <div className="grid animate-pulse gap-4 py-5 pl-5 pr-4 sm:grid-cols-[1fr_auto] sm:gap-6 sm:pl-6">
        <div className="min-w-0 space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 size-10 shrink-0 rounded-full bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-3/5 rounded bg-muted" />
              <div className="h-3.5 w-2/5 rounded bg-muted" />
            </div>
          </div>
          <div className="h-4 w-4/5 rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-6 w-24 rounded-full bg-muted" />
            <div className="h-6 w-40 rounded-full bg-muted" />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3 sm:min-w-[7.5rem] sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <div className="h-7 w-24 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
