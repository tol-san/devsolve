"use client";

import React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import cambodiaFlag from "../../public/cambodia.gif";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import {
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

  const nextLocale: Locale = locale === "en" ? "km" : "en";
  const CurrentFlag = FLAGS[locale];

  const handleToggle = () => {
    rememberLocale(nextLocale);
    router.push(localise(pathname ?? "/", nextLocale));
    router.refresh();
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      onClick={handleToggle}
      aria-label={`Switch language to ${LOCALE_NAMES[nextLocale]}`}
      title={`Switch language to ${LOCALE_NAMES[nextLocale]} (current: ${LOCALE_SHORT[locale]})`}
      className={cn(
        "group relative inline-flex size-9 sm:size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-foreground shadow-none transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={locale}
          initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotate: 8 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          <CurrentFlag className="h-4.5 w-6.5 shrink-0 object-cover rounded-[3px] border border-border/60 shadow-2xs overflow-hidden" />
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

export default LanguageSwitcher;
