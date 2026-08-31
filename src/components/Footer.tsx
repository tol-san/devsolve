"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { useLocalePath, useT } from "@/lib/i18n/I18nProvider";
import mptcLight from "../../public/mptc-lightmode.png";
import mptcDark from "../../public/mptc-darkmode.png";
import istadLight from "../../public/istad-lightmode.png";
import istadDark from "../../public/istad-darkmode.png";
import cbrdLight from "../../public/crbd-lightmode.png";
import cbrdDark from "../../public/crbd-darkmode.png";
import SectionBackdrop, {
  useIsDark,
} from "@/components/landing/SectionBackdrop";

/**
 * Site footer for the public pages.
 *
 * Every link here points at a route that exists. The previous version carried
 * five columns of which sixteen entries were `href="#"` — Features,
 * Documentation, Help and most of Company were headings over dead ends — plus
 * a social row aimed at the bare facebook.com / youtube.com / linkedin.com /
 * github.com homepages rather than any DevSolve account. Sections come back
 * when there is something to point them at.
 */

/** Grouped from the public routes the navbar already exposes. */
const footerNavSections = [
  {
    title: "PLATFORM",
    tKey: "footer.sections.platform",
    links: [
      { name: "Programs", tKey: "footer.links.programs", href: "/programs" },
      { name: "Problems", tKey: "footer.links.problems", href: "/problems" },
      { name: "Showcases", tKey: "footer.links.showcases", href: "/showcases" },
      { name: "Discussions", tKey: "footer.links.community", href: "/discussions" },
    ],
  },
  {
    title: "EXPLORE",
    tKey: "footer.sections.explore",
    links: [
      { name: "Hacktivity", tKey: "footer.links.hacktivity", href: "/hacktivity" },
      { name: "Leaderboard", tKey: "footer.links.leaderboard", href: "/leaderboard" },
      { name: "About", tKey: "footer.links.about", href: "/about" },
    ],
  },
  {
    title: "ACCOUNT",
    tKey: "footer.sections.account",
    links: [
      { name: "Sign in", tKey: "footer.links.signIn", href: "/login" },
      { name: "Create an account", tKey: "footer.links.createAccount", href: "/account-type" },
    ],
  },
];

/**
 * The programme's backers, each with its light and dark artwork.
 *
 * Imported rather than referenced by URL so the dimensions come from the files
 * themselves. Next reads them at build time and hands `<Image>` the real
 * width, height and blur data — no numbers to type, and none to get wrong.
 *
 * That mattered here: hand-written sizes had MPTC declared square against a
 * 5.18:1 lockup. With `w-auto`, the browser takes its aspect ratio from those
 * attributes, so a wide wordmark was being fitted into a square box and came
 * out a fraction of its proper size. Re-exported artwork also silently
 * invalidates any figure typed against the previous file.
 */
const partners = [
  {
    alt: "Ministry of Post and Telecommunications",
    light: mptcLight,
    dark: mptcDark,
  },
  { alt: "CBRD Fund", light: cbrdLight, dark: cbrdDark },
  { alt: "iSTAD", light: istadLight, dark: istadDark },
];

export default function Footer() {
  const t = useT();
  const lp = useLocalePath();
  /* The partner artwork is theme-dependent — each backer ships a separate
     light and dark file — and next-themes only knows the theme after
     hydration, so the server render has to commit to the light files or the
     two disagree. `useIsDark` is the codebase's guard for exactly this: it
     reports `false` for one frame, then the real value. The DevSolve
     wordmark no longer needs it: it is one file in both themes. */
  const isDarkTheme = useIsDark();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    /* The brand rule along the top is the colour: a flat 4px band of the
       primary, which design.md allows where a gradient would not be. The page
       itself stays white.

       Everything below is dressed the way the landing sections are — the same
       grid-paper backdrop, the same rule-and-eyebrow headings, the same easing
       — so the page does not change language at the fold. The layout is
       untouched: brand and blurb left, three link columns right, backers, then
       the legal line. */
    <footer className="relative w-full overflow-hidden border-t border-slate-200/80 font-sans text-slate-700 dark:border-neutral-800 dark:text-neutral-300">
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        {/* Navigation leads, since that is what a footer is for: brand on the
            left, links on the right. The backers moved below it. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12"
        >
          <div className="flex flex-col items-start gap-5 lg:col-span-5">
            {/* `/devsolve-logo.png` is the logo as drawn: navy wordmark,
                #0059FC bulb, transparent background. No blend mode — there is
                no white box to hide, and multiplying only muddied it against
                the backdrop.

                Dark mode gets this same file, by choice: one artwork
                everywhere beats a matched pair that can drift. The cost is
                stated where it is decided, in `BrandLogo` — the navy sits at
                about 1.1:1 against the neutral-950 footer, so on dark the blue
                half of the lockup carries it and the navy half recedes. The
                remedy, if it is ever wanted, is a light plate behind the mark;
                a CSS recolour (`brightness-0 invert`) is not one, since it
                flattens the two blues and the bug into a single white. */}
            <Link href={lp("/")} aria-label={t("footer.home")} className="group block">
              <span className="relative block h-16 w-44 sm:h-20 sm:w-56">
                {/* Light Mode Logo */}
                <Image
                  src="/devsolve-logo.png"
                  alt="DevSolve"
                  fill
                  quality={90}
                  sizes="(min-width: 640px) 224px, 176px"
                  className="object-contain object-left transition-transform duration-200 group-hover:scale-[1.03] dark:hidden"
                />
                {/* Dark Mode Logo */}
                <Image
                  src="/devsolve-fulltext-logo-darkmode.png"
                  alt="DevSolve"
                  fill
                  quality={90}
                  sizes="(min-width: 640px) 224px, 176px"
                  className="hidden object-contain object-left transition-transform duration-200 group-hover:scale-[1.03] dark:block"
                />
              </span>
            </Link>

            {/* The landing's lede treatment: a size up from small print, with
                the same slightly tightened tracking its body copy carries. */}
            <p className="max-w-md text-base leading-relaxed tracking-[-0.01em] text-slate-600 dark:text-neutral-400">
              {t("footer.tagline")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-left sm:grid-cols-3 lg:col-span-7">
            {footerNavSections.map((section) => (
              <div key={section.title} className="flex flex-col gap-4">
                {/* The landing's section label: a hairline rule, then the word
                    spaced out in primary. It replaces the upright tick that was
                    this footer's own invention. */}
                <h3 className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="h-px w-6 shrink-0 bg-blue-600 dark:bg-blue-400"
                  />
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
                    {t(section.tKey) || section.title}
                  </span>
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      {/* Nudges toward the reader on hover, the way the
                          landing's list links do. */}
                      <Link
                        href={lp(link.href)}
                        prefetch={false}
                        className="inline-block text-sm font-medium tracking-[-0.01em] text-slate-600 transition-all duration-200 hover:translate-x-0.5 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                      >
                        {t(link.tKey) || link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Backers sit under the navigation, near the legal line, instead of
            heading the whole footer as a banner. */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 border-t border-slate-200/70 pt-10 dark:border-neutral-800/80"
        >
          {/* The same eyebrow as the columns, centred — rules on both sides so
              it reads as a divider rather than a heading with a stray dash. */}
          <h2 className="mb-8 flex items-center justify-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-6 bg-blue-600 dark:bg-blue-400"
            />
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
              {t("footer.sponsors")}
            </span>
            <span
              aria-hidden="true"
              className="h-px w-6 bg-blue-600 dark:bg-blue-400"
            />
          </h2>

          {/* Sized by height alone. A `max-w` cap here is what shrank MPTC:
              its lockup is 5.18:1, so at a 64px row it wants 332px of width,
              the cap pulled that back to 260px, and the height came down to
              50px with it while the 2.7:1 logos kept the full 64. */}
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
            {partners.map((partner) => {
              const art = isDarkTheme ? partner.dark : partner.light;

              return (
                <div
                  key={partner.alt}
                  className="flex h-12 items-center sm:h-16"
                >
                  <Image
                    key={art.src}
                    src={art}
                    alt={partner.alt}
                    quality={90}
                    sizes="(min-width: 640px) 340px, 260px"
                    className="h-full w-auto max-w-full object-contain"
                  />
                </div>
              );
            })}
          </div>
        </motion.section>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200/70 pt-6 text-sm text-slate-500 sm:flex-row dark:border-neutral-800/80 dark:text-neutral-500">
          {/* The blue full stop the landing puts after its headings. */}
          <p className="tracking-[-0.01em]">
            © {new Date().getFullYear()} DevSolve
            <span className="text-blue-600 dark:text-blue-400">.</span>{" "}
            {t("footer.rights")}
          </p>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            aria-label={t("footer.backToTop")}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.6)] transition-colors hover:bg-blue-700"
          >
            <ArrowUp className="size-4" />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
