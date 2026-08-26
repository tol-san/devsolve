"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronRight,
  Command,
  MessagesSquare,
  Plus,
  Search,
  X,
} from "lucide-react";

import { AuthGatedLink } from "@/components/auth/AuthGatedLink";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalePath, useT } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface DiscussionSearchProps {
  searchQuery: string;
  onSearch: (value: string) => void;
  onClearSearch: () => void;
  isSearching?: boolean;
}

interface DiscussionHeaderProps {
  breadcrumbLabel: string;
  title: string;
  badgeLabel: string;
  description: string;
  createHref: string;
  createLabel?: string;
}

export function DiscussionHeader({
  breadcrumbLabel,
  title,
  badgeLabel,
  description,
  createHref,
  createLabel,
}: DiscussionHeaderProps) {
  const t = useT();
  const lp = useLocalePath();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-neutral-800">
      <div className="flex max-w-3xl flex-col gap-2.5">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
        >
          <Link
            href={lp("/")}
            className="transition-colors hover:text-foreground"
          >
            {t("nav.home")}
          </Link>
          <ChevronRight aria-hidden="true" className="size-4" />
          <span aria-current="page" className="font-semibold text-foreground">
            {breadcrumbLabel}
          </span>
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
            {title}
          </h1>
          <Badge variant="tag" className="h-6 rounded-lg px-2.5 text-sm">
            <MessagesSquare data-icon="inline-start" aria-hidden="true" />
            {badgeLabel}
          </Badge>
        </div>

        <p className="text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <motion.div
        className="w-full shrink-0 sm:w-auto"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* Gated: an anonymous visitor gets the sign-in prompt here rather
            than a form they cannot submit. */}
        <AuthGatedLink
          href={createHref}
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-xs hover:bg-blue-700 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700",
          )}
        >
          <Plus data-icon="inline-start" aria-hidden="true" />
          {createLabel ?? t("community.pages.community.createLabel")}
        </AuthGatedLink>
      </motion.div>
    </header>
  );
}

export function DiscussionSearch({
  searchQuery,
  onSearch,
  onClearSearch,
  isSearching,
}: DiscussionSearchProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);

  const isMac = useSyncExternalStore(
    useCallback(() => () => {}, []),
    () => /Mac|iPod|iPhone|iPad/.test(window.navigator.userAgent),
    () => false,
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable === true;

      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }

      if (
        event.key === "/" &&
        !isTyping &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        inputRef.current?.focus();
        return;
      }

      if (
        event.key === "Escape" &&
        document.activeElement === inputRef.current
      ) {
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-card p-2 shadow-xs ring-1 ring-foreground/5">
      <div className="relative min-w-0 flex-1">
        <label htmlFor="discussions-search" className="sr-only">
          {t("community.search.label")}
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={inputRef}
          type="search"
          id="discussions-search"
          value={searchQuery}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={t("community.search.placeholder")}
          className="h-11 rounded-xl bg-muted/50 pr-4 pl-11 text-base shadow-none [&::-webkit-search-cancel-button]:hidden"
        />
      </div>

      <AnimatePresence>
        {isSearching && (
          <motion.span
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            aria-label={t("community.search.updating")}
            className="size-2 shrink-0 rounded-full bg-primary"
          />
        )}
      </AnimatePresence>

      {searchQuery ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            onClearSearch();
            inputRef.current?.focus();
          }}
          aria-label={t("community.search.clear")}
          className="rounded-xl"
        >
          <X aria-hidden="true" />
        </Button>
      ) : (
        <kbd className="pointer-events-none hidden items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 font-mono text-sm font-semibold text-muted-foreground sm:flex">
          {isMac ? <Command className="size-3.5" /> : <span>Ctrl</span>}
          <span>K</span>
        </kbd>
      )}
    </div>
  );
}
