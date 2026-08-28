"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "motion/react";
import { Loader2 } from "lucide-react";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";
import { USER_FEATURES, COMPANY_FEATURES } from "@/lib/constants/auth";
import { AccountTypeCard } from "@/components/account-type/AccountTypeCard";
import {
  OrganizationArt,
  ResearcherArt,
} from "@/components/account-type/AccountTypeArt";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};



export default function AccountTypeSelectionPage() {
  const { isLoggingIn, handleLogin } = useKeycloakLogin();

  /* The backdrop is the auth layout's; this shell stays transparent so it
     shows through. */
  return (
    <div className="relative flex min-h-dvh flex-col text-foreground selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-500/30 dark:selection:text-blue-50">
      {/* ── Top bar ── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full border-b border-border"
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="Go to DevSolve homepage"
            className="group flex shrink-0 items-center transition-opacity hover:opacity-85"
          >
            <span className="relative block h-10 w-36">
              <Image
                src="/devsolve-logo.png"
                alt="DevSolve"
                fill
                priority
                sizes="150px"
                className="origin-left object-contain object-left scale-[1.15]"
              />
            </span>
          </Link>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">Already have an account?</span>
            <button
              type="button"
              onClick={() => handleLogin("/")}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-blue-400 dark:hover:bg-blue-500/10"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  Connecting…
                </>
              ) : (
                "Log in"
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Main ── */}
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <h1 className="text-3xl font-bold leading-[1.08] tracking-[-0.04em] text-foreground sm:text-4xl lg:text-5xl">
            How will you use DevSolve
            <span className="text-blue-600 dark:text-blue-400">?</span>
          </h1>

        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-10 grid w-full max-w-4xl grid-cols-1 items-stretch gap-5 sm:mt-12 md:grid-cols-2 md:gap-6"
        >
          <AccountTypeCard
            eyebrow="For builders"
            title="Developer & Researcher"
            art={<ResearcherArt />}
            features={USER_FEATURES}
            ctaLabel="Continue as developer"
            href="/register/user"
            accent="blue"
            variants={cardVariants}
          />

          <AccountTypeCard
            eyebrow="For companies"
            title="Organization"
            art={<OrganizationArt />}
            features={COMPANY_FEATURES}
            ctaLabel="Continue as organization"
            href="/register/company"
            accent="emerald"
            variants={cardVariants}
          />
        </motion.div>


      </main>
    </div>
  );
}
