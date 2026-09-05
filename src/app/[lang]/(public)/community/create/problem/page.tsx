"use client";

import React from "react";
import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import {
  ChevronRight,
  FileText,
  AlertCircle,
  Cpu,
  Paperclip,
  SendHorizonal,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { CreateProblemForm } from "@/components/discussions/create/CreateProblemForm";

const QUICK_NAV = [
  { id: "section-details", label: "Details", desc: "Title & markdown", icon: FileText, num: "01" },
  { id: "section-technologies", label: "Stack", desc: "Tools & versions", icon: Cpu, num: "02" },
  { id: "section-diagnosis", label: "Diagnosis", desc: "Repro & traces", icon: AlertCircle, num: "03" },
  { id: "section-attachments", label: "Evidence", desc: "Logs & files", icon: Paperclip, num: "04" },
  { id: "section-context", label: "Classification", desc: "Category & type", icon: SlidersHorizontal, num: "05" },
  { id: "section-submit", label: "Publish", desc: "Review & submit", icon: SendHorizonal, num: "06" },
];

export default function PublicCreateProblemPage() {
  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-[calc(100dvh-var(--navbar-height))]">

        {/* ── Hero Header ─────────────────────────────────────────────── */}
        <div className="border-b border-border/40">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

            {/* Breadcrumb */}
            <motion.nav
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-5"
            >
              <Link
                href="/community"
                className="transition-colors hover:text-foreground inline-flex items-center gap-1.5"
              >
                Community
              </Link>
              <ChevronRight className="size-3.5 text-muted-foreground/60" />
              <Link
                href="/community/create"
                className="transition-colors hover:text-foreground"
              >
                New post
              </Link>
              <ChevronRight className="size-3.5 text-muted-foreground/60" />
              <span aria-current="page" className="text-foreground font-semibold">
                Problem
              </span>
            </motion.nav>

            {/* Title row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
              className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
            >
              <div className="max-w-2xl">
                {/* Badge kicker */}
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                    <AlertCircle className="size-3" />
                    New Community Problem
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Sparkles className="size-3 text-amber-500" />
                    Autosave enabled
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-[1.15]">
                  Describe what went wrong
                  <span className="text-primary">.</span>
                </h1>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Give clear context, reproduction steps, and error logs. The more specific
                  your details are, the faster the community can replicate and solve it.
                </p>
              </div>

              {/* Quick-Nav Section Anchors (Desktop) */}
              <div className="hidden xl:flex flex-wrap items-center gap-2 shrink-0">
                {QUICK_NAV.map((nav) => {
                  const Icon = nav.icon;
                  return (
                    <button
                      key={nav.id}
                      type="button"
                      onClick={() => handleScrollTo(nav.id)}
                      className="group flex items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-3 py-2 text-xs backdrop-blur-xs transition-all hover:border-primary/40 hover:bg-card hover:shadow-xs cursor-pointer"
                      title={`Jump to ${nav.label}`}
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {nav.num}
                      </span>
                      <Icon className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-foreground leading-none">{nav.label}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">{nav.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Quick-Nav strip for mobile/tablet */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="xl:hidden mt-6 flex items-center gap-2 overflow-x-auto pb-1"
            >
              {QUICK_NAV.map((nav) => {
                const Icon = nav.icon;
                return (
                  <button
                    key={nav.id}
                    type="button"
                    onClick={() => handleScrollTo(nav.id)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border/70 bg-card/90 px-2.5 py-1.5 text-xs text-foreground font-medium transition-colors hover:border-primary/40 cursor-pointer"
                  >
                    <span className="text-[10px] font-mono text-muted-foreground">{nav.num}</span>
                    <Icon className="size-3 text-muted-foreground" />
                    <span>{nav.label}</span>
                  </button>
                );
              })}
            </motion.div>

          </div>
        </div>

        {/* ── Form Body ───────────────────────────────────────────────── */}
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
          >
            <RequireAuth
              title="Sign in to post a problem"
              description="Posting a problem needs an account, so answers reach you and the thread stays attached to your profile. It only takes a moment."
            >
              <CreateProblemForm
                successHref="/dashboard/my-community"
                cancelHref="/community/create"
                stickyTop="calc(var(--navbar-height) + 1.5rem)"
              />
            </RequireAuth>
          </motion.div>
        </div>

      </div>
    </MotionConfig>
  );
}
