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
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

            {/* Breadcrumb Navigation */}
            <motion.nav
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4"
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
              className="space-y-2 max-w-3xl"
            >
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-[1.15]">
                Describe what went wrong
                <span className="text-primary">.</span>
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                Give clear context, reproduction steps, and error logs. The more specific
                your details are, the faster the community can replicate and solve it.
              </p>
            </motion.div>

            {/* Quick-Nav Stepper Bar: Evenly distributed 6-step nav */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-5 sm:pt-6 border-t border-border/40 mt-6"
            >
              {QUICK_NAV.map((nav) => {
                const Icon = nav.icon;
                return (
                  <button
                    key={nav.id}
                    type="button"
                    onClick={() => handleScrollTo(nav.id)}
                    className="group flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/70 p-2.5 text-xs backdrop-blur-xs transition-all hover:border-primary/40 hover:bg-card hover:shadow-xs cursor-pointer text-left"
                    title={`Jump to ${nav.label}`}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted text-[11px] font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {nav.num}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1">
                        <Icon className="size-3 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                        <span className="font-semibold text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                          {nav.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {nav.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </motion.div>

          </div>
        </div>

        {/* ── Form Body ───────────────────────────────────────────────── */}
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
