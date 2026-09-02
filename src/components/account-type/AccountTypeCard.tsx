"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import type { FeatureItem } from "@/lib/constants/auth";

import { useLocalePath } from "@/lib/i18n/I18nProvider";

type Accent = "blue" | "emerald";

/* Flat accents only — the surface stays white and the hue appears as a
   hairline, a chip and the CTA fill. No gradients, per design.md. */
const ACCENTS: Record<
  Accent,
  {
    chip: string;
    mark: string;
    cta: string;
    media: string;
    /** Shadow-as-border in the accent, used on hover. */
    ring: string;
  }
> = {
  blue: {
    chip: "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    mark: "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    cta: "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 dark:shadow-blue-500/15",
    media: "",
    ring: "hover:ring-2 hover:ring-blue-500/40 focus-visible:ring-2 focus-visible:ring-blue-500/40",
  },
  emerald: {
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    mark: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    cta: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 dark:shadow-emerald-500/15",
    media: "",
    ring: "hover:ring-2 hover:ring-emerald-500/40 focus-visible:ring-2 focus-visible:ring-emerald-500/40",
  },
};

export interface AccountTypeCardProps {
  eyebrow: string;
  title: string;
  description?: string;
  /** Illustration for the media panel — see AccountTypeArt. */
  art: ReactNode;
  features: FeatureItem[];
  ctaLabel: string;
  href: string;
  /** What happens after this choice — sets expectations before the form. */
  note?: string;
  accent: Accent;
  variants: Variants;
}

export function AccountTypeCard({
  eyebrow,
  title,
  art,
  features,
  ctaLabel,
  href,
  note,
  accent,
  variants,
}: AccountTypeCardProps) {
  const tone = ACCENTS[accent];
  const localePath = useLocalePath();

  return (
    <motion.div variants={variants} className="h-full">
      {/* The whole card is the target — the CTA below is a visual affordance,
          not a second link, so there is one tab stop per choice. */}
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="h-full"
      >
        <Link
          href={localePath(href)}
          aria-label={`${title} — ${ctaLabel}`}
          className={`group flex h-full flex-col rounded-2xl bg-card border border-border p-6 sm:p-7 outline-none transition-all duration-200 shadow-2xs ${tone.ring}`}
        >
          {/* ── Illustration ── */}
          <div
            className={`relative flex h-36 items-end justify-center overflow-hidden rounded-xl bg-muted/40 pb-2.5 pt-8 ring-1 ring-border transition-colors duration-300 ${tone.media}`}
          >
            {art}

            <span
              className={`absolute left-3 top-2.5 z-10 rounded-lg px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${tone.chip}`}
            >
              {eyebrow}
            </span>
          </div>

          {/* ── Copy ── */}
          <h2 className="mt-6 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>

          <ul className="mt-6 space-y-3 border-t border-border pt-6">
            {features.map((item) => (
              <li key={item.text} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${tone.mark}`}
                >
                  <Check className="size-3" strokeWidth={3} aria-hidden />
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground font-medium">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>

          {/* ── CTA, pinned to the bottom so both cards align ── */}
          <div className="mt-auto pt-7">
            <span
              className={`flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer ${tone.cta}`}
            >
              {ctaLabel}
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden
              />
            </span>

            {note && (
              <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
                {note}
              </p>
            )}
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default AccountTypeCard;
