"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { CreateShowcaseForm } from "@/components/showcases/create/CreateShowcaseForm";

export default function PublicCreateShowcasePage() {
  return (
    /* The landing page's section shell — grid paper, drifting aurora, and the
       same slate ground the showcase section sits on. Motes and scan beams are
       off: they belong behind a page you read, not one you type into.

       Deliberately no `overflow-hidden`, unlike the landing sections: it would
       make this element the scroll container and the form's sticky sidebar
       would scroll away with the page. `SectionBackdrop` clips itself. */
    <section className="relative min-h-[calc(100dvh-var(--navbar-height))] py-10 text-foreground sm:py-14">
      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-12">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="border-b border-border pb-8"
        >
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
          >
            <Link
              href="/community"
              className="transition-colors hover:text-foreground"
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
            <span className="text-foreground">Showcase</span>
          </nav>

          <div className="mt-6 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              {/* The landing header motif: a hairline rule, an eyebrow, then
                  the headline closed with a blue full stop. */}
              <div className="mb-4 flex items-center gap-2.5">
                <span className="h-px w-8 bg-primary" />
                <span className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
                  New showcase
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl lg:text-5xl">
                Show what you built
                <span className="text-primary">.</span>
              </h1>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Publish the project alongside the build guide that made it work.
              Steps, code and diagrams stay together, so anyone landing on it can
              follow the whole thing end to end.
            </p>
          </div>
        </motion.header>

        <div className="mt-8">
          {/* Covers the routes into this page that skip the gated link — a
              pasted URL, a bookmark, back/forward. */}
          <RequireAuth
            title="Sign in to post a showcase"
            description="Publishing a showcase needs an account, so the project stays attached to your profile. It only takes a moment."
          >
            <CreateShowcaseForm
              successHref="/showcases"
              cancelHref="/community/create"
              stickyTop="calc(var(--navbar-height) + 1.5rem)"
            />
          </RequireAuth>
        </div>
      </div>
    </section>
  );
}
