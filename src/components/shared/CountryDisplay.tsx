"use client";

import { CountryFlag } from "@/components/shared/CountryFlag";
import { resolveCountry } from "@/lib/countries";
import { cn } from "@/lib/utils";

type CountryDisplayProps = {
  /** The stored `country` value: a code, a legacy free-text string, or null. */
  value: string | null | undefined;
  size?: 12 | 14 | 18 | 24;
  /** Rendered when there is no country at all. Nothing by default. */
  fallback?: React.ReactNode;
  /** Show only the flag, with the name on hover — for dense rows. */
  flagOnly?: boolean;
  className?: string;
  textClassName?: string;
};

/**
 * A country as it appears anywhere on screen: flag, then name.
 *
 * The read half of the contract in `@/lib/countries`. The stored field is free
 * text the backend does not validate, so this handles all three cases it can
 * actually be in:
 *
 * - a code we know (`"kh"`) — flag plus the derived name;
 * - free text (`"Cambodia"`, `"San Francisco, USA"`, left over from the old
 *   free-text editor) — shown as written, with no flag, because guessing a
 *   code from a name is exactly the reverse lookup we refuse to do;
 * - empty — the caller's fallback, or nothing.
 *
 * Every display site uses this rather than reading `profile.country` directly,
 * so an unexpected value is handled once instead of in a dozen places.
 */
export function CountryDisplay({
  value,
  size = 14,
  fallback = null,
  flagOnly = false,
  className,
  textClassName,
}: CountryDisplayProps) {
  const resolved = resolveCountry(value);

  if (!resolved) return <>{fallback}</>;

  /* No flag: we did not recognise it, and a wrong flag is worse than none. */
  if (resolved.kind === "text") {
    return (
      <span className={cn("inline-flex min-w-0 items-center", className)}>
        <span className={cn("truncate", textClassName)}>{resolved.text}</span>
      </span>
    );
  }

  if (flagOnly) {
    /* The name is not rendered, so here the flag is the only carrier of the
       information and does need a label. */
    return (
      <span
        className={cn("inline-flex items-center", className)}
        title={resolved.name}
      >
        <CountryFlag code={resolved.code} size={size} />
        <span className="sr-only">{resolved.name}</span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
      <CountryFlag code={resolved.code} size={size} />
      <span className={cn("truncate", textClassName)}>{resolved.name}</span>
    </span>
  );
}

export default CountryDisplay;
