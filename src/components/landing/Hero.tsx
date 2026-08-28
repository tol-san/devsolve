"use client";

import React, { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { AsciiHand } from "./AsciiHand";
import { PRIMARY } from "./SectionBackdrop";

/* A store that reports `false` to the server and `true` to the client, which
   is how you ask React "has this hydrated yet?" without a setState in an
   effect. The subscribe callback is module-level so it stays referentially
   stable and never resubscribes. */
const neverChanges = () => () => {};
const onClient = () => true;
const onServer = () => false;

/** Whether the first client render is behind us. */
function useHydrated() {
  return useSyncExternalStore(neverChanges, onClient, onServer);
}

/* ════════════════════════════════════════════════════════════════════
   HEADLINE
   ════════════════════════════════════════════════════════════════════ */

function RevealWords({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            /* No blur filter — it settles at blur(0px) and leaves every word
               on its own raster layer, softening the headline for good. */
            initial={{ opacity: 0, y: "0.9em" }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.75,
              delay: delay + i * 0.07,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════
   THE MARK — the logo the two hands reach toward
   ════════════════════════════════════════════════════════════════════ */

function CentreMark() {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative block h-14 w-52 sm:h-16 sm:w-60"
    >
      <Image
        src="/devsolve-logo.png"
        alt="DevSolve"
        fill
        priority
        sizes="240px"
        className="object-contain"
      />
    </motion.span>
  );
}

/* ════════════════════════════════════════════════════════════════════
   HERO
   Near-white paper, two dot-matrix hands reaching in from the edges, and
   one quiet column of type between them.
   ════════════════════════════════════════════════════════════════════ */

export function Hero() {
  const reduce = useReducedMotion();
  /* The drift is withheld until hydration is done, so the server render and
     the first client render agree on the markup — `useReducedMotion` already
     knows the answer on the client's first pass, and the server never can. */
  const drifts = useHydrated() && !reduce;

  return (
    // The negative margin cancels the layout's navbar padding so the paper
    // runs to the very top and the nav island floats over it.
    <section className="relative -mt-(--navbar-height) flex h-dvh flex-col overflow-hidden bg-[#F7F8FB] dark:bg-neutral-950">
      {/* ── The hands ──
          Anchored to the frame edges and vertically centred on the type, so
          the two of them close in on the mark without ever touching it. */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <motion.div
          className="absolute bottom-[6%] left-0 h-[17%] w-[62%] text-[#2563EB]/30 sm:bottom-auto sm:top-[54%] sm:h-[26%] sm:w-[42%] sm:-translate-y-1/2 sm:text-[#2563EB]/45 dark:text-[#60A5FA]/25 sm:dark:text-[#60A5FA]/35"
          animate={drifts ? { x: [0, 9, 0], y: [0, -7, 0] } : undefined}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        >
          <AsciiHand pose="adam" className="h-full w-full" delay={0.15} />
        </motion.div>

        <motion.div
          className="absolute bottom-[22%] right-0 h-[17%] w-[62%] text-[#2563EB]/30 sm:bottom-auto sm:top-[62%] sm:h-[26%] sm:w-[42%] sm:-translate-y-1/2 sm:text-[#2563EB]/45 dark:text-[#60A5FA]/25 sm:dark:text-[#60A5FA]/35"
          animate={drifts ? { x: [0, -9, 0], y: [0, 7, 0] } : undefined}
          transition={{ duration: 31, repeat: Infinity, ease: "easeInOut" }}
        >
          <AsciiHand pose="god" className="h-full w-full" flip delay={0.3} />
        </motion.div>
      </div>

      {/* ── The column ── */}
      <div className="pointer-events-none relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-(--navbar-height) sm:px-10">
        <CentreMark />

        <h1
          /* Colour is a class, not an inline style, so the dark variant can
             reach it. #1E293B is the brand secondary. */
          className="mt-6 max-w-3xl text-center font-semibold leading-[1.08] tracking-[-0.035em] text-[#1E293B] sm:mt-8 dark:text-neutral-50"
          style={{ fontSize: "clamp(28px, min(4vw, 6vh), 54px)" }}
        >
          {/* Two tones, as in the reference: the setup recedes, the promise
              lands. */}
          <span className="block text-slate-400 dark:text-neutral-500">
            <RevealWords text="Turn Found Bugs" delay={0.35} />
          </span>
          <span className="block">
            <RevealWords text="into Shipped Fixes" delay={0.55} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9, ease: "easeOut" }}
          className="mt-5 max-w-md text-center text-sm leading-[1.65] text-slate-500 dark:text-neutral-400"
        >
          Bounty programs, real vulnerability triage, and a community that
          solves problems in the open.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.02, ease: "easeOut" }}
          className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
        >
          <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0, scale: 0.98 }}>
            <Link
              href="/account-type"
              className="inline-flex items-center rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-[filter] hover:brightness-110"
              style={{
                backgroundColor: PRIMARY,
                boxShadow: "0 14px 30px -14px rgba(37,99,235,0.85)",
              }}
            >
              Join our world
            </Link>
          </motion.div>

          <Link
            href="/programs"
            className="text-sm font-medium text-slate-500 underline-offset-4 transition-colors hover:text-[#2563EB] hover:underline dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Browse programs
          </Link>
        </motion.div>
      </div>

      {/* ── The footline ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 1.3, ease: "easeOut" }}
        className="relative z-10 grid w-full shrink-0 grid-cols-1 items-end gap-3 px-6 pb-7 text-xs leading-relaxed text-slate-500 sm:grid-cols-3 sm:px-10 dark:text-neutral-500"
      >
        <p className="hidden sm:block">It starts with a single report.</p>
        <p className="max-w-xs justify-self-center text-center">
          A place for security work in the open. No noise. Just findings, fixes
          and the people behind them.
        </p>
        <p className="hidden justify-self-end sm:block">
          [ Scroll to explore ]
        </p>
      </motion.div>
    </section>
  );
}

export default Hero;
