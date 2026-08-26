"use client";

import React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import cambodiaFlag from "../../public/cambodia.gif";
import { cn } from "@/lib/utils";
import {
  LOCALES,
  LOCALE_NAMES,
  LOCALE_SHORT,
  localise,
  type Locale,
} from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/I18nProvider";

/** Mirrors the cookie the proxy reads, so a choice survives a bare-URL visit. */
const LOCALE_COOKIE = "devsolve.locale";

/* Kept outside the component: the React Compiler lint treats a write to
   `document` inside one as mutating external state, and the write genuinely
   is a side effect on the document rather than component state. */
function rememberLocale(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

/* ─── Flags ───────────────────────────────────────────────────────────
   Not emoji: Windows ships no glyphs for regional indicator pairs, so 🇰🇭
   renders there as the bare letters "KH" — the one platform this project is
   developed on would be the only one that never sees a flag.

   Cambodia is the supplied artwork; the UK is drawn, since its geometry is
   exact at any size and it costs no request.
   ──────────────────────────────────────────────────────────────────── */

/** Cambodia, from `public/cambodia.gif`. Imported rather than referenced by
 *  URL so the intrinsic size travels with it and the build can fingerprint it. */
function FlagKH({ className }: { className?: string }) {
  return (
    <Image
      src={cambodiaFlag}
      alt=""
      aria-hidden
      /* The source is 1000×640 (1.5625) against a 3:2 box, so a hair is
         cropped rather than the flag being stretched off-proportion. */
      className={cn("object-cover", className)}
    />
  );
}

/** United Kingdom, for English. */
function FlagEN({ className }: { className?: string }) {
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

const FLAGS: Record<Locale, (p: { className?: string }) => React.ReactElement> = {
  en: FlagEN,
  km: FlagKH,
};

/**
 * Switches between the site's two languages.
 *
 * A single toggle rather than a menu: with exactly two locales a dropdown adds
 * a click and a decision to a choice that has only one possible outcome. The
 * button shows the language you are reading now and swaps on press.
 *
 * Switching rewrites the current path rather than sending the visitor home, so
 * someone reading a programme in English lands on the same programme in Khmer.
 * The cookie is written too, so the next bare URL they hit — a shared link, a
 * bookmark, the bare domain — resolves to the language they picked.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const next = LOCALES.find((code) => code !== locale) ?? locale;
  const Flag = FLAGS[locale];

  const toggle = () => {
    if (next === locale) return;
    rememberLocale(next);
    router.push(localise(pathname ?? "/", next));
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      /* Names the destination, not the current state — a screen reader user
         needs to know what pressing it does. */
      aria-label={`Switch to ${LOCALE_NAMES[next]}`}
      title={LOCALE_NAMES[next]}
      className={cn(
        "inline-flex h-9 xl:h-10 cursor-pointer items-center gap-1.5 xl:gap-2 rounded-full border border-slate-200/80 bg-white px-2 xl:px-2.5 text-xs xl:text-sm font-semibold text-slate-600 shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-100 dark:hover:border-blue-500/40 dark:hover:bg-neutral-800 dark:hover:text-blue-300 dark:focus-visible:ring-blue-500/30",
        className,
      )}
    >
      <Flag className="h-3.5 w-5 xl:h-4 xl:w-6 shrink-0 rounded-xs shadow-[0_0_0_1px_rgba(15,23,42,0.12)]" />
      <span className="tabular-nums">{LOCALE_SHORT[locale]}</span>
    </button>
  );
}

export default LanguageSwitcher;
