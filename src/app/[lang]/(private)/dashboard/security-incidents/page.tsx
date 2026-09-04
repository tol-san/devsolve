"use client";

export const dynamic = "force-dynamic";

import React, { Suspense } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ShieldAlert, ArrowLeft, Shield } from "lucide-react";
import { SecurityIncidentsTable } from "@/components/security-incidents/SecurityIncidentsTable";

function SecurityIncidentsContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Link
              href="/dashboard"
              className="hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <span>/</span>
            <Link
              href="/dashboard/content-moderation"
              className="hover:text-foreground transition-colors"
            >
              Administration
            </Link>
            <span>/</span>
            <span className="text-foreground">Security Incidents</span>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              <ShieldAlert className="size-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Security & Malware Incidents
            </h1>
          </div>
          <p className="text-sm text-muted-foreground pt-0.5">
            Audit log of all file uploads refused and discarded by the VirusTotal fail-closed guard.
          </p>
        </div>
      </header>

      <SecurityIncidentsTable scope="admin" />
    </motion.div>
  );
}

export default function SecurityIncidentsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full animate-pulse space-y-6 pb-12">
          <div className="h-14 w-1/3 rounded-xl bg-muted" />
          <div className="h-96 w-full rounded-2xl bg-muted/60" />
        </div>
      }
    >
      <SecurityIncidentsContent />
    </Suspense>
  );
}
