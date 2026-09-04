"use client";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { motion } from "motion/react";
import {
  Bug,
  CheckCircle2,
  Code2,
  ShieldCheck,
  Trophy,
  UsersRound,
} from "lucide-react";

import {
  ABOUT_OFFERS,
  ABOUT_REASON_POINTS,
  ABOUT_ROLE_STRIP,
  ABOUT_STATS,
} from "@/components/public-about/mock-data";

const offerIcons = [ShieldCheck, UsersRound, Trophy];
const stripIcons = [UsersRound, ShieldCheck, Code2, Trophy];
const statIcons = [ShieldCheck, Bug, UsersRound, Trophy];

export function PublicAboutStory() {
  return (
    <section className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white px-6 py-12 shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-slate-900 lg:px-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.06),transparent_18%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_18%)]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300">
            Our Mission
          </p>
          <h2 className="mt-5 text-4xl font-bold tracking-[-0.05em] text-slate-900 dark:text-white sm:text-5xl">
            Empowering Innovation, Securing Tomorrow
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
            Our mission is to improve software security while empowering developers
            and students to learn, collaborate, and build their professional
            future.
          </p>
        </div>

        <div className="relative mt-12 rounded-[32px] border border-slate-200 bg-slate-50/70 p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-slate-950/50 sm:p-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex rounded-full border border-blue-200 bg-white px-3 py-1 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600 dark:border-blue-400/20 dark:bg-slate-900 dark:text-blue-300">
              What We Offer
            </p>
            <h3 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-slate-900 dark:text-white sm:text-4xl">
              Everything you need in one platform
            </h3>
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-3">
            {ABOUT_OFFERS.map((offer, index) => {
              const Icon = offerIcons[index];

              return (
                <motion.div
                  key={offer.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.28, delay: index * 0.06, ease: "easeOut" }}
                  className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900"
                >
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-950">
                    <Icon
                      className={`size-7 ${
                        offer.accent === "emerald"
                          ? "text-emerald-600 dark:text-emerald-300"
                          : offer.accent === "violet"
                            ? "text-violet-600 dark:text-violet-300"
                            : "text-blue-600 dark:text-blue-300"
                      }`}
                    />
                  </div>
                  <h4 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {offer.title}
                  </h4>
                  <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                    {offer.description}
                  </p>

                  <div className="mt-6 space-y-3">
                    {offer.points.map((point) => (
                      <div key={point} className="flex items-start gap-3">
                        <CheckCircle2
                          className={`mt-0.5 size-5 shrink-0 ${
                            offer.accent === "emerald"
                              ? "text-emerald-500"
                              : offer.accent === "violet"
                                ? "text-violet-500"
                                : "text-blue-500"
                          }`}
                        />
                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#10285f_0%,#0c1f49_58%,#081733_100%)] px-6 py-6 text-white shadow-[0_14px_34px_rgba(15,23,42,0.16)] lg:px-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.12),transparent_22%)]" />
        <div className="relative grid gap-4 lg:grid-cols-4">
          {ABOUT_ROLE_STRIP.map((item, index) => {
            const Icon = stripIcons[index];

            return (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-[24px] border border-white/10 bg-white/5 px-4 py-5 backdrop-blur-sm lg:border-r lg:border-white/10 lg:bg-transparent lg:px-5 lg:py-3 lg:last:border-r-0"
              >
                <Icon
                  className={`size-8 shrink-0 ${
                    index === 1
                      ? "text-emerald-300"
                      : index === 2
                        ? "text-violet-300"
                        : index === 3
                          ? "text-amber-300"
                          : "text-blue-300"
                  }`}
                />
                <div>
                  <p className="text-4xl font-bold tracking-tight">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-blue-50/80">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white px-6 py-10 shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-slate-900 lg:px-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.06),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.05),transparent_18%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_18%)]" />

        <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300">
              Why Choose DevSolve?
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-slate-900 dark:text-white sm:text-5xl">
              More than just a platform
            </h2>

            <div className="mt-6 space-y-4">
              {ABOUT_REASON_POINTS.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-300" />
                  <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-[560px] items-center justify-center">
            <div className="absolute left-6 top-10 size-7 rounded-full bg-blue-100 dark:bg-blue-500/18" />
            <div className="absolute right-10 top-20 h-24 w-24 rounded-full bg-blue-100/70 blur-3xl dark:bg-blue-500/16" />
            <div className="absolute left-12 bottom-8 h-24 w-24 rounded-full bg-emerald-100/70 blur-3xl dark:bg-emerald-500/16" />

            <div className="relative w-full rounded-[34px] border border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#edf4ff_100%)] px-6 py-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[linear-gradient(180deg,#101827_0%,#0b1321_100%)]">
              <div className="mx-auto max-w-[420px] rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900">
                <div className="mb-3 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-rose-400" />
                  <span className="size-2 rounded-full bg-amber-400" />
                  <span className="size-2 rounded-full bg-emerald-400" />
                </div>
                <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-6 py-10 text-center dark:border-white/6 dark:bg-slate-950">
                  <BrandLogo
                    align="center"
                    className="mx-auto h-[72px] w-[180px]"
                    sizes="180px"
                  />
                  <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    DevSolve
                  </p>
                  <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Build. Secure. Share. Together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white px-6 py-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-slate-900 lg:px-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(37,99,235,0.04),transparent_22%,rgba(16,185,129,0.04))] dark:bg-[linear-gradient(90deg,rgba(59,130,246,0.08),transparent_22%,rgba(16,185,129,0.06))]" />
        <div className="relative grid gap-4 lg:grid-cols-4">
          {ABOUT_STATS.map((item, index) => {
            const Icon = statIcons[index];

            return (
              <div
                key={item.label}
                className="flex items-start gap-4 rounded-[24px] border border-slate-200 bg-white/88 px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/72"
              >
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900">
                  <Icon
                    className={`size-7 ${
                      index === 1
                        ? "text-blue-600 dark:text-blue-300"
                        : index === 2
                          ? "text-blue-600 dark:text-blue-300"
                          : index === 3
                            ? "text-amber-500 dark:text-amber-300"
                            : "text-emerald-600 dark:text-emerald-300"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-4xl font-bold tracking-tight text-blue-600 dark:text-blue-300">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>
    </section>
  );
}
