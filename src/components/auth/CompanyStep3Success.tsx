"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle2, ShieldCheck, MailCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT, useLocalePath } from "@/lib/i18n/I18nProvider";

export function CompanyStep3Success() {
  const t = useT();
  const localePath = useLocalePath();

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-card border border-border rounded-3xl p-8 sm:p-10 text-center shadow-xl shadow-blue-500/5 my-auto text-card-foreground w-full"
    >
      {/* Animated Success Icon */}
      <div className="relative size-20 mx-auto mb-6 flex items-center justify-center">
        <div className="absolute inset-0 bg-emerald-100/80 dark:bg-emerald-500/20 rounded-full animate-ping opacity-75" />
        <div className="relative size-20 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-xs">
          <ShieldCheck className="size-10" />
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2 tracking-tight">
        {t("auth.companyRegister.successTitle")}
      </h2>

      <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-5">
        <MailCheck className="size-3.5" />
        <span>Verification Link Sent</span>
      </div>

      <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-6 font-normal">
        {t("auth.companyRegister.successSubtitle")} {t("auth.companyRegister.successDescription")}
      </p>

      {/* Verification Steps List */}
      <div className="bg-muted/40 border border-border rounded-2xl p-5 max-w-md mx-auto text-left mb-8 space-y-3">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          What happens next:
        </h4>
        <div className="flex items-start gap-3 text-xs sm:text-sm text-foreground font-medium">
          <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>Click the activation link sent to your work email</span>
        </div>
        <div className="flex items-start gap-3 text-xs sm:text-sm text-foreground font-medium">
          <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>Access your company security dashboard and invite teammates</span>
        </div>
        <div className="flex items-start gap-3 text-xs sm:text-sm text-foreground font-medium">
          <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>Launch your private or public bug bounty programs</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={localePath("/dashboard")} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto h-11 sm:h-12 px-7 bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 dark:border dark:border-blue-400/30 text-white font-semibold rounded-xl text-sm sm:text-base shadow-md shadow-blue-600/20 dark:shadow-blue-500/15 cursor-pointer flex items-center justify-center gap-2">
            <span>{t("auth.companyRegister.goToDashboard")}</span>
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
