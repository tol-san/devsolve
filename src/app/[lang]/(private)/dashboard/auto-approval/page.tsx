"use client";

export const dynamic = "force-dynamic";

import React, { Suspense } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Sparkles, ArrowLeft, Bot } from "lucide-react";
import { AutoApprovalSettings } from "@/components/admin/auto-approval/AutoApprovalSettings";

function AutoApprovalContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      {/* Dashboard Page Standard Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          {/* Breadcrumb Navigation */}
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
            <span className="text-foreground">AI Auto-Approval</span>
          </div>

          {/* Title & Subtext */}
          <div className="flex items-center gap-2.5 pt-1">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Bot className="size-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              AI Content Auto-Approval
            </h1>
          </div>
          <p className="text-sm text-muted-foreground pt-0.5">
            Configure automated AI quality and safety checks to instantly publish verified community submissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/content-moderation"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            <span>Moderation Queue</span>
          </Link>
        </div>
      </header>

      {/* Main Settings Component */}
      <AutoApprovalSettings />
    </motion.div>
  );
}

export default function AutoApprovalPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse w-full pb-12">
          <div className="h-16 rounded-xl bg-muted/60" />
          <div className="h-28 rounded-2xl bg-muted/60" />
          <div className="space-y-4">
            <div className="h-40 rounded-2xl bg-muted/60" />
            <div className="h-40 rounded-2xl bg-muted/60" />
          </div>
        </div>
      }
    >
      <AutoApprovalContent />
    </Suspense>
  );
}
