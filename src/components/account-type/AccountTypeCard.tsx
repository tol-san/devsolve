"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import type { FeatureItem } from "@/lib/constants/auth";

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
    cta: "bg-blue-600 hover:bg-blue-700 text-white",
    media: "",
    ring: "hover:shadow-[0_0_0_1px_rgba(37,99,235,0.4),0_18px_40px_-20px_rgba(37,99,235,0.45)] focus-visible:shadow-[0_0_0_1px_rgba(37,99,235,0.4),0_18px_40px_-20px_rgba(37,99,235,0.45)]",
  },
  emerald: {
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    mark: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    cta: "bg-emerald-600 hover:bg-emerald-700 text-white",
    media: "",
    ring: "hover:shadow-[0_0_0_1px_rgba(5,150,105,0.4),0_18px_40px_-20px_rgba(5,150,105,0.45)] focus-visible:shadow-[0_0_0_1px_rgba(5,150,105,0.4),0_18px_40px_-20px_rgba(5,150,105,0.45)]",
  },
};

/** Shadow-as-border at rest, per design.md. */
const RESTING_SHADOW =
  "shadow-[0_0_0_1px_rgba(30,41,59,0.08),0_8px_24px_-18px_rgba(30,41,59,0.4)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_24px_-18px_rgba(0,0,0,0.6)]";

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
          href={href}
          aria-label={`${title} — ${ctaLabel}`}
          className={`group flex h-full flex-col rounded-2xl bg-card dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 p-6 outline-none transition-all duration-200 sm:p-7 ${RESTING_SHADOW} ${tone.ring}`}
        >
          {/* ── Illustration ── */}
          <div
            className={`relative flex h-36 items-end justify-center overflow-hidden rounded-xl bg-slate-50 dark:bg-neutral-800/60 pb-2.5 pt-8 ring-1 ring-slate-100 dark:ring-neutral-800 transition-colors duration-300 ${tone.media}`}
          >
            {art}

            <span
              className={`absolute left-3 top-2.5 z-10 rounded-lg px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${tone.chip}`}
            >
              {eyebrow}
            </span>
          </div>

          {/* ── Copy ── */}
          <h2 className="mt-6 text-xl font-bold tracking-tight text-foreground dark:text-neutral-100 sm:text-2xl">
            {title}
          </h2>


          <ul className="mt-6 space-y-3 border-t border-slate-100 dark:border-neutral-800 pt-6">
            {features.map((item) => (
              <li key={item.text} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${tone.mark}`}
                >
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                </span>
                <span className="text-sm leading-relaxed text-slate-700 dark:text-neutral-300">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>

          {/* ── CTA, pinned to the bottom so both cards align ── */}
          <div className="mt-auto pt-7">
            <span
              className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-colors ${tone.cta}`}
            >
              {ctaLabel}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden
              />
            </span>

            {note && (
              <p className="mt-3 text-center text-xs leading-relaxed text-slate-400 dark:text-neutral-500">
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
