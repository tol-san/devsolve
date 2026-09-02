"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  FileQuestion,
  LayoutPanelTop,
  ShieldCheck,
  User,
} from "lucide-react";

import type { SearchHit, SearchType } from "@/lib/types/search/types";
import {
  docNumber,
  docString,
  docStrings,
  enumLabel,
  hrefForHit,
} from "@/lib/search/presentation";
import { SearchSnippet } from "@/components/search/SearchSnippet";
import { cn } from "@/lib/utils";

/** A stand-in when a hit has no image, which is common on problems. */
const FALLBACK_ICON: Record<SearchType, typeof User> = {
  programs: ShieldCheck,
  showcases: LayoutPanelTop,
  problems: FileQuestion,
  organizations: Building2,
  users: User,
};

/**
 * The one or two facts worth showing beside a hit, chosen per index.
 *
 * `document` holds the whole indexed record and its fields differ by type, so
 * this picks rather than prints: enum-ish values arrive as `UPPER_SNAKE` and
 * are mapped to labels, and anything absent is simply left out instead of
 * rendering an empty chip.
 */
function factsFor(hit: SearchHit): string[] {
  const doc = hit.document;

  switch (hit.type) {
    case "programs": {
      const facts = [
        enumLabel(doc.engagementType),
        enumLabel(doc.industry),
        docString(doc, "country"),
      ];
      if (doc.offersBounties === true) {
        const max = docNumber(doc, "maximumBounty");
        facts.push(max ? `Bounties to $${max.toLocaleString()}` : "Offers bounties");
      }
      return facts.filter((fact): fact is string => Boolean(fact));
    }
    case "showcases":
      return [
        docString(doc, "categoryName"),
        ...docStrings(doc, "tags").slice(0, 2),
      ].filter((fact): fact is string => Boolean(fact));
    case "problems":
      return [
        enumLabel(doc.status),
        enumLabel(doc.problemType),
        enumLabel(doc.severity),
      ].filter((fact): fact is string => Boolean(fact));
    case "organizations":
      return [
        enumLabel(doc.industry),
        docString(doc, "country"),
        docString(doc, "companySize"),
      ].filter((fact): fact is string => Boolean(fact));
    case "users": {
      const reputation = docNumber(doc, "reputation");
      return [
        docString(doc, "country"),
        reputation ? `${reputation.toLocaleString()} reputation` : null,
      ].filter((fact): fact is string => Boolean(fact));
    }
  }
}

type SearchHitRowProps = {
  hit: SearchHit;
  /** Compact drops the snippet and facts — the dropdown has no room. */
  compact?: boolean;
  onNavigate?: () => void;
};

/**
 * One search result, in the dropdown or on the results page.
 *
 * `imageUrl` and `subtitle` are frequently null on every index, so both have a
 * fallback rather than a hole: an avatar becomes the type's own icon, and a
 * missing subtitle simply closes the gap.
 */
export function SearchHitRow({ hit, compact, onNavigate }: SearchHitRowProps) {
  const Icon = FALLBACK_ICON[hit.type];
  const facts = compact ? [] : factsFor(hit);
  const isPerson = hit.type === "users";

  return (
    <Link
      href={hrefForHit(hit)}
      onClick={onNavigate}
      className={cn(
        "flex items-start gap-3 rounded-xl transition-colors hover:bg-muted",
        compact ? "p-2" : "border border-border bg-card p-3.5 sm:p-4",
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden border border-border bg-muted",
          isPerson ? "rounded-full" : "rounded-lg",
          compact ? "size-9" : "size-12",
        )}
      >
        {hit.imageUrl ? (
          <Image
            src={hit.imageUrl}
            alt=""
            width={compact ? 36 : 48}
            height={compact ? 36 : 48}
            unoptimized
            className="size-full object-cover"
          />
        ) : (
          <Icon
            className={cn("text-muted-foreground", compact ? "size-4" : "size-5")}
          />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span
            className={cn(
              "truncate font-semibold text-foreground",
              compact ? "text-sm" : "text-base",
            )}
          >
            {hit.title}
          </span>
        </span>

        {hit.subtitle && (
          <span className="mt-0.5 block truncate text-sm text-muted-foreground">
            {hit.subtitle}
          </span>
        )}

        {!compact && (
          <SearchSnippet snippet={hit.snippet} className="mt-1.5 line-clamp-2" />
        )}

        {facts.length > 0 && (
          <span className="mt-2 flex flex-wrap gap-1.5">
            {facts.map((fact) => (
              <span
                key={fact}
                className="rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {fact}
              </span>
            ))}
          </span>
        )}
      </span>
    </Link>
  );
}
