"use client";

import React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, Search, ShieldCheck, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalePath, useT } from "@/lib/i18n/I18nProvider";

export function ProgramHeader() {
  const t = useT();
  const lp = useLocalePath();

  return (
    <header className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex max-w-3xl flex-col gap-2.5">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
        >
          <Link href={lp("/")} className="transition-colors hover:text-foreground">
            {t("nav.home")}
          </Link>
          <ChevronRight aria-hidden="true" className="size-4" />
          <span aria-current="page" className="font-semibold text-foreground">
            {t("programs.breadcrumb")}
          </span>
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("programs.title")}
          </h1>
          <Badge variant="tag" className="h-6 rounded-lg px-2.5 text-sm">
            <ShieldCheck data-icon="inline-start" aria-hidden="true" />
            {t("programs.badge")}
          </Badge>
        </div>

        <p className="text-base leading-relaxed text-muted-foreground">
          {t("programs.subtitle")}
        </p>
      </div>
    </header>
  );
}

export function ProgramSearch({
  searchTerm,
  onSearchTermChange,
  onClearSearch,
  isSearching,
}: {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onClearSearch: () => void;
  isSearching?: boolean;
}) {
  const t = useT();

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-card p-2 shadow-xs ring-1 ring-foreground/5">
      <div className="relative min-w-0 flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground"
        />
        <label htmlFor="program-search" className="sr-only">
          {t("programs.search.label")}
        </label>
        <Input
          id="program-search"
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder={t("programs.search.placeholder")}
          autoComplete="off"
          className="h-11 rounded-xl bg-muted/50 pr-4 pl-11 text-base shadow-none [&::-webkit-search-cancel-button]:hidden"
        />
      </div>

      <AnimatePresence>
        {isSearching ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            aria-label={t("programs.search.updating")}
            className="size-2 shrink-0 rounded-full bg-primary"
          />
        ) : null}
      </AnimatePresence>

      {searchTerm ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClearSearch}
          aria-label={t("programs.search.clear")}
          className="rounded-xl"
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
