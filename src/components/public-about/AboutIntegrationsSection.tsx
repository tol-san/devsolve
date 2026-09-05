"use client";

import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Sparkles, ShieldCheck, Zap, Database, Lock, Cpu, Search, Layers } from "lucide-react";
import { useInk } from "@/components/landing/SectionBackdrop";
import { OrbitingCirclesGlobe } from "@/components/ui/orbiting-circles-02";
import { useT } from "@/lib/i18n/I18nProvider";

const HIGHLIGHT_CAPABILITIES = [
  {
    icon: Lock,
    title: "Zero-Trust Security",
    desc: "PKCE S256 authentication with signed JWT bearer relays.",
  },
  {
    icon: Zap,
    title: "Real-Time Speed",
    desc: "Sub-millisecond Redis event streaming & in-memory caching.",
  },
  {
    icon: Database,
    title: "ACID Datastores",
    desc: "Strict relational integrity with replicated multi-tenant PostgreSQL.",
  },
  {
    icon: Search,
    title: "Instant Discovery",
    desc: "Sub-50ms typo-tolerant full-text search across all vulnerabilities.",
  },
];

export function AboutIntegrationsSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const ink = useInk();
  const t = useT();

  const kicker = t("aboutPage.integrations.kicker") || "System Infrastructure";
  const title =
    t("aboutPage.integrations.title") ||
    "Engineered with High-Performance Tech";
  const description =
    t("aboutPage.integrations.lede") ||
    "A resilient, decoupled ecosystem built with modern cloud-native standards — unifying high-throughput edge routing, zero-trust authentication, distributed datastores, and automated security pipelines.";

  return (
    <section
      id="system-architecture"
      ref={ref}
      className="relative overflow-hidden py-10 sm:py-16"
    >
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-blue-600 dark:text-blue-400 mb-4"
          >
            <Sparkles className="size-3.5" />
            <span>{kicker}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground"
            style={{ color: ink }}
          >
            {title}
            <span className="text-blue-600 dark:text-blue-400">.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            {description}
          </motion.p>
        </div>

        {/* Orbiting Circles Globe Animation - Pure Transparent & Floating */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative w-full overflow-hidden bg-transparent py-0 select-none"
        >
          <OrbitingCirclesGlobe />
        </motion.div>

        {/* Clean Infrastructure Capabilities Row with Interactive Hover Effects */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {HIGHLIGHT_CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.35 + i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative flex items-start gap-3.5 rounded-2xl border border-border/80 bg-card/85 p-4 sm:p-5 backdrop-blur-md shadow-2xs transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 dark:bg-card/75 cursor-default"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/20 dark:text-blue-400 dark:group-hover:bg-blue-500 dark:group-hover:text-white">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {cap.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default AboutIntegrationsSection;
