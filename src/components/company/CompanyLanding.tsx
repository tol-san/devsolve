"use client";

import Link from "next/link";
import { ArrowRight, FileSearch, Handshake, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useLocalePath, useT } from "@/lib/i18n/I18nProvider";

const BENEFITS = [
  { key: "scope", icon: FileSearch },
  { key: "triage", icon: ShieldCheck },
  { key: "recognition", icon: Handshake },
] as const;

export function CompanyLanding() {
  const t = useT();
  const lp = useLocalePath();

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-auto w-full max-w-7xl space-y-10 px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
    >
      <section className="max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
          {t("companyLanding.eyebrow")}
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t("companyLanding.title")}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
          {t("companyLanding.description")}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={lp("/register/company")}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("companyLanding.primaryAction")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href={lp("/programs")}
            className="inline-flex items-center rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            {t("companyLanding.secondaryAction")}
          </Link>
        </div>
      </section>

      <section
        aria-label={t("companyLanding.benefitsLabel")}
        className="grid gap-4 md:grid-cols-3"
      >
        {BENEFITS.map(({ key, icon: Icon }) => (
          <article
            key={key}
            className="rounded-2xl border border-border bg-card p-6 ring-1 ring-foreground/5 dark:ring-foreground/10"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-foreground">
              {t(`companyLanding.benefits.${key}.title`)}
            </h2>
            <p className="mt-2 text-base leading-7 text-muted-foreground">
              {t(`companyLanding.benefits.${key}.description`)}
            </p>
          </article>
        ))}
      </section>
    </motion.main>
  );
}
