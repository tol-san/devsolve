"use client";

import React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import cambodiaFlag from "../../public/cambodia.gif";
import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  LOCALES,
  LOCALE_NAMES,
  LOCALE_SHORT,
  localise,
  type Locale,
} from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/I18nProvider";

const LOCALE_COOKIE = "devsolve.locale";

function rememberLocale(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

export function FlagKH({ className }: { className?: string }) {
  return (
    <Image
      src={cambodiaFlag}
      alt=""
      aria-hidden
      className={cn("object-cover", className)}
    />
  );
}

export function FlagEN({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden focusable="false">
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="3.2" />
      <path d="M0 0l24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1.9" />
      <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5.4" />
      <path d="M12 0v16M0 8h24" stroke="#C8102E" strokeWidth="3.2" />
    </svg>
  );
}

export const FLAGS: Record<Locale, (p: { className?: string }) => React.ReactElement> = {
  en: FlagEN,
  km: FlagKH,
};

export { rememberLocale, LOCALE_COOKIE };

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleSelect = (code: Locale) => {
    if (code === locale) return;
    rememberLocale(code);
    router.push(localise(pathname ?? "/", code));
    router.refresh();
  };

  const CurrentFlag = FLAGS[locale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`Language selector (current: ${LOCALE_NAMES[locale]})`}
            title={`Switch language (current: ${LOCALE_SHORT[locale]})`}
            className={cn(
              "flex h-9 shrink-0 cursor-pointer items-center justify-center px-1 border-0 bg-transparent shadow-none transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-none",
              className,
            )}
          />
        }
      >
        <CurrentFlag className="h-5 w-7.5 shrink-0 object-cover rounded-xs" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-36 rounded-xl border border-border/80 bg-card/95 p-1 shadow-lg ring-1 ring-foreground/5 dark:ring-foreground/10 backdrop-blur-xl"
      >
        {LOCALES.map((code) => {
          const Flag = FLAGS[code];
          const isSelected = code === locale;

          return (
            <DropdownMenuItem
              key={code}
              onClick={() => handleSelect(code)}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                isSelected
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <div className="flex items-center gap-2">
                <Flag className="h-3.5 w-5 shrink-0 object-cover" />
                <span>{LOCALE_NAMES[code]}</span>
              </div>
              {isSelected && <Check className="size-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;
