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
      { name: "Documentation", tKey: "footer.links.docs", href: "https://docs.devsolve.app/", external: true },
      { name: "For companies", tKey: "footer.links.company", href: "/company" },
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
  const isDarkTheme = useIsDark();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative w-full overflow-hidden border-t border-border/80 bg-background/85 dark:bg-background/90 backdrop-blur-xl shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_-8px_24px_rgba(0,0,0,0.4)] font-sans text-foreground">
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12"
        >
          <div className="flex flex-col items-start gap-5 lg:col-span-5">
            <Link href={lp("/")} aria-label={t("footer.home")} className="group block">
              <span className="relative block h-20 w-56 sm:h-24 sm:w-64">
                <Image
                  src="/devsolve-logo.png"
                  alt="DevSolve"
                  fill
                  quality={90}
                  sizes="(min-width: 640px) 224px, 176px"
                  className="object-contain object-left transition-transform duration-200 group-hover:scale-[1.03] dark:hidden"
                />
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

            <p className="max-w-md text-base leading-relaxed tracking-[-0.01em] text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-left sm:grid-cols-3 lg:col-span-7">
            {footerNavSections.map((section) => (
              <div key={section.title} className="flex flex-col gap-4">
                <h3 className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="h-px w-6 shrink-0 bg-primary"
                  />
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                    {t(section.tKey) || section.title}
                  </span>
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      {"external" in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-sm font-medium tracking-[-0.01em] text-muted-foreground transition-all duration-200 hover:translate-x-0.5 hover:text-primary"
                        >
                          {t(link.tKey) || link.name}
                        </a>
                      ) : (
                        <Link
                          href={lp(link.href)}
                          prefetch={false}
                          className="inline-block text-sm font-medium tracking-[-0.01em] text-muted-foreground transition-all duration-200 hover:translate-x-0.5 hover:text-primary"
                        >
                          {t(link.tKey) || link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 border-t border-border/70 pt-10"
        >
          <h2 className="mb-8 flex items-center justify-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-6 bg-primary"
            />
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
              {t("footer.sponsors")}
            </span>
            <span
              aria-hidden="true"
              className="h-px w-6 bg-primary"
            />
          </h2>

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

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-6 text-sm text-muted-foreground sm:flex-row">
          <p className="tracking-[-0.01em]">
            © {new Date().getFullYear()} DevSolve
            <span className="text-primary">.</span>{" "}
            {t("footer.rights")}
          </p>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            aria-label={t("footer.backToTop")}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/25 transition-colors hover:bg-primary/90"
          >
            <ArrowUp className="size-4" />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
