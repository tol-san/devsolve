"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, MapPin, Search } from "lucide-react";
import { motion } from "motion/react";

import { CountryFlag } from "@/components/shared/CountryFlag";
import { COUNTRY_OPTIONS, resolveCountry } from "@/lib/countries";
import { cn } from "@/lib/utils";

type CountrySelectProps = {
  /**
   * The stored value: normally a lowercase code. A legacy free-text value is
   * accepted and shown as written, so opening the editor on an old profile
   * does not silently blank the field.
   */
  value: string | null | undefined;
  /** Called with the **lowercase code** — never the display name. */
  onChange: (code: string) => void;
  id?: string;
  placeholder?: string;
  /** Spinner in place of the chevron while a country is being guessed. */
  isDetecting?: boolean;
  error?: boolean;
  disabled?: boolean;
  className?: string;
};

/**
 * The country picker.
 *
 * Shows flag and name, filters by name as you type, and **submits only the
 * lowercase ISO code**. The name is presentation: it is derived from the code
 * on the way in and discarded on the way out, so it is never what gets stored.
 * See `@/lib/countries` for why that direction is the only reliable one.
 *
 * Not a native `<select>` — it needs a flag image and a search field per row,
 * neither of which an `<option>` can hold.
 */
export function CountrySelect({
  value,
  onChange,
  id,
  placeholder = "Select a country or region",
  isDetecting,
  error,
  disabled,
  className,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const resolved = resolveCountry(value);
  const selectedCode = resolved?.kind === "code" ? resolved.code : null;

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    /* Escape closes without picking — a click-outside listener alone leaves
       someone on a keyboard with no way out. */
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const options = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return COUNTRY_OPTIONS;
    /* Name only. Matching the code too would make a two-letter search like
       "in" surface Andorra and Argentina above India. */
    return COUNTRY_OPTIONS.filter((option) =>
      option.name.toLowerCase().includes(needle),
    );
  }, [query]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border bg-background px-3.5 text-base text-foreground shadow-2xs outline-none transition-all hover:bg-muted/50 focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60",
          error
            ? "border-destructive focus:ring-destructive/30"
            : "border-border focus:border-blue-600",
          isOpen && !error && "border-blue-600 ring-2 ring-blue-600/20",
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {resolved ? (
            resolved.kind === "code" ? (
              <CountryFlag code={resolved.code} size={14} />
            ) : (
              <MapPin className="size-4 shrink-0 text-muted-foreground" />
            )
          ) : (
            <MapPin className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span
            className={cn(
              "truncate font-medium",
              !resolved && "font-normal text-muted-foreground",
            )}
          >
            {resolved
              ? resolved.kind === "code"
                ? resolved.name
                : resolved.text
              : placeholder}
          </span>
        </span>

        <span className="ml-2 flex shrink-0 items-center text-muted-foreground">
          {isDetecting ? (
            <Loader2 className="size-4 animate-spin text-blue-600 dark:text-blue-400" />
          ) : (
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                isOpen && "rotate-180 text-blue-600 dark:text-blue-400",
              )}
            />
          )}
        </span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-x-0 z-50 mt-1.5 flex max-h-72 flex-col overflow-hidden rounded-2xl border border-border bg-popover p-2 shadow-xl"
        >
          <div className="relative mb-2 px-1 pt-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search country..."
              autoFocus
              aria-label="Search countries"
              className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div role="listbox" className="max-h-52 space-y-0.5 overflow-y-auto pr-1">
            {options.length === 0 ? (
              <p className="py-4 text-center text-sm font-medium text-muted-foreground">
                No country matching &quot;{query}&quot;
              </p>
            ) : (
              options.map((option) => {
                const isSelected = option.code === selectedCode;
                return (
                  <button
                    key={option.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      /* The code, and only the code. */
                      onChange(option.code);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                        : "font-medium text-foreground hover:bg-muted",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <CountryFlag code={option.code} size={14} />
                      <span className="truncate">{option.name}</span>
                    </span>
                    {isSelected && (
                      <Check className="ml-2 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default CountrySelect;
