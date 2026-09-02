"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompanyStep3Success() {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-card border border-border rounded-3xl p-8 sm:p-10 text-center shadow-xl shadow-blue-500/5 my-auto text-card-foreground"
    >
      {/* Animated Pending Icon */}
      <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        <div className="absolute inset-0 bg-blue-100/80 dark:bg-blue-500/20 rounded-full animate-ping opacity-75" />
        <div className="relative w-20 h-20 bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
          <Clock className="w-10 h-10 animate-pulse" />
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 tracking-tight">
        Company Registration Received!
      </h2>

      <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-amber-600 dark:text-amber-400 text-xs font-semibold mb-6">
        <Clock className="w-3.5 h-3.5" />
        <span>Verification Pending (24-48 hrs)</span>
      </div>

      <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-6 font-normal">
        Thank you for submitting your organization profile. Our security compliance team is reviewing your KYB &amp; domain verification request.
      </p>

      {/* Verification Steps List */}
      <div className="bg-muted/50 border border-border rounded-2xl p-5 max-w-md mx-auto text-left mb-8 space-y-3">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Next Verification Steps:
        </h4>
        <div className="flex items-start gap-3 text-xs sm:text-sm text-foreground font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>Domain ownership &amp; work email validation</span>
        </div>
        <div className="flex items-start gap-3 text-xs sm:text-sm text-foreground font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>KYB business registration review</span>
        </div>
        <div className="flex items-start gap-3 text-xs sm:text-sm text-foreground font-medium">
          <CheckCircle2 className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
          <span>Access grant &amp; program creation enablement</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto h-11 px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 cursor-pointer">
            Back to Home
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

