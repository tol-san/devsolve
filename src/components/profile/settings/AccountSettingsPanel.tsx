"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ExternalLink,
  HelpCircle,
  KeyRound,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Toggle from "./Toggle";

interface AccountSettingsPanelProps {
  initialTwoFactorEnabled: boolean;
}

export default function AccountSettingsPanel({
  initialTwoFactorEnabled,
}: AccountSettingsPanelProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    initialTwoFactorEnabled
  );

  const handleManagePassword = () => {
    const issuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER;
    if (!issuer) {
      toast.error("Password management is unavailable right now.");
      return;
    }
    window.open(
      `${issuer.replace(/\/+$/, "")}/account`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="grid grid-cols-1 gap-6 lg:grid-cols-2"
    >
      <section className="flex flex-col justify-between space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 text-lg font-bold text-slate-900 dark:border-slate-800/80 dark:text-slate-100">
            <Lock className="size-5 text-slate-500 dark:text-slate-400" />
            <span>Security</span>
          </div>

          <div className="space-y-3 border-b border-slate-100 pb-4 dark:border-slate-800/80">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Change your account password
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={handleManagePassword}
              className="h-10 cursor-pointer rounded-full bg-slate-100 px-6 text-sm font-semibold text-slate-800 shadow-2xs transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <KeyRound size={15} />
              Change password
              <ExternalLink size={13} className="opacity-60" />
            </Button>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Opens your secure Keycloak account page in a new tab — DevSolve
              never stores your password.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Enable secure login (2FA)
              </span>
              <HelpCircle size={15} className="cursor-help text-slate-400" />
            </div>
            <Toggle
              checked={twoFactorEnabled}
              onChange={setTwoFactorEnabled}
              label="Enable secure login"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm font-medium leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
          DevSolve offers fast and secure login through our novel authentication
          technology and two-factor authentication.
        </div>
      </section>
    </motion.div>
  );
}
