"use client";

import { CountryFlag } from "@/components/shared/CountryFlag";
import { resolveCountry } from "@/lib/countries";
import { cn } from "@/lib/utils";

type CountryDisplayProps = {
  value: string | null | undefined;
  size?: 12 | 14 | 18 | 24;
  fallback?: React.ReactNode;
  flagOnly?: boolean;
  className?: string;
  textClassName?: string;
};

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

  if (resolved.kind === "text") {
    return (
      <span className={cn("inline-flex min-w-0 items-center", className)}>
        <span className={cn("truncate", textClassName)}>{resolved.text}</span>
      </span>
    );
  }

  if (flagOnly) {
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
