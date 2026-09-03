"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
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
import { useLocalePath } from "@/lib/i18n/I18nProvider";
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
        reputation ? `${reputation.toLocaleString()} rep` : null,
      ].filter((fact): fact is string => Boolean(fact));
    }
  }
}

type SearchHitRowProps = {
  hit: SearchHit;
  compact?: boolean;
  isSelected?: boolean;
  onNavigate?: () => void;
};

/**
 * One search result, in the dropdown or on the results page.
 */
export function SearchHitRow({
  hit,
  compact,
  isSelected,
  onNavigate,
}: SearchHitRowProps) {
  const lp = useLocalePath();
  const Icon = FALLBACK_ICON[hit.type];
  const allFacts = factsFor(hit);
  const facts = compact ? allFacts.slice(0, 2) : allFacts;
  const isPerson = hit.type === "users";

  return (
    <Link
      href={lp(hrefForHit(hit))}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-xl transition-all duration-150 cursor-pointer",
        compact
          ? "px-3 py-2.5 hover:bg-muted/60"
          : "border border-border bg-card p-3.5 sm:p-4 hover:border-border/80 hover:bg-muted/30 hover:shadow-xs",
        isSelected &&
          (compact
            ? "bg-muted text-foreground ring-1 ring-border shadow-2xs"
            : "ring-1 ring-border bg-muted/50"),
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden border border-border/70 bg-muted/60 text-muted-foreground transition-colors duration-150 group-hover:bg-muted group-hover:text-foreground",
          isPerson ? "rounded-full" : "rounded-xl",
          compact ? "size-10" : "size-12",
        )}
      >
        {hit.imageUrl ? (
          <Image
            src={hit.imageUrl}
            alt=""
            width={compact ? 40 : 48}
            height={compact ? 40 : 48}
            unoptimized
            className="size-full object-cover"
          />
        ) : (
          <Icon
            className={cn("shrink-0", compact ? "size-4.5" : "size-5")}
          />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "truncate font-semibold text-foreground group-hover:text-foreground transition-colors",
              compact ? "text-sm" : "text-base",
            )}
          >
            {hit.title}
          </span>
        </span>

        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          {hit.subtitle && (
            <span className="truncate text-xs text-muted-foreground">
              {hit.subtitle}
            </span>
          )}

          {compact && facts.length > 0 && (
            <>
              {hit.subtitle && <span className="text-muted-foreground/40 text-xs">·</span>}
              <div className="flex flex-wrap items-center gap-1">
                {facts.map((fact) => (
                  <span
                    key={fact}
                    className="inline-flex items-center rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >
                    {fact}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {!compact && (
          <SearchSnippet snippet={hit.snippet} className="mt-1.5 line-clamp-2" />
        )}

        {!compact && facts.length > 0 && (
          <span className="mt-2 flex flex-wrap gap-1.5">
            {facts.map((fact) => (
              <span
                key={fact}
                className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {fact}
              </span>
            ))}
          </span>
        )}
      </span>

      {/* Right side indicator */}
      <span className="flex items-center shrink-0">
        {isSelected ? (
          <kbd className="hidden sm:inline-flex items-center rounded border border-border/80 bg-background px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground shadow-2xs">
            ↵
          </kbd>
        ) : (
          <ArrowUpRight className="size-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 group-hover:text-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        )}
      </span>
    </Link>
  );
}
