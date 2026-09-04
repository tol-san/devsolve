"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Loader2, LockKeyhole, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";

interface LoginRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectTo: string;
  title?: string;
  description?: string;
}

export function LoginRequiredDialog({
  open,
  onOpenChange,
  redirectTo,
  title = "Sign in to post",
  description = "Posting to the community needs an account, so your work stays attached to your profile. It only takes a moment.",
}: LoginRequiredDialogProps) {
  const { isLoggingIn, handleLogin } = useKeycloakLogin();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5">
        <DialogHeader className="gap-3">
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/25"
          >
            <LockKeyhole className="size-5.5" />
          </motion.span>

          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2.5 sm:justify-start">
          <Button
            type="button"
            onClick={() => handleLogin(redirectTo)}
            disabled={isLoggingIn}
            className="h-11 rounded-xl bg-blue-600 px-5 text-base font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <LogIn className="size-4" />
                Log in
              </>
            )}
          </Button>

          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/account-type" />}
            className="h-11 rounded-xl border-slate-300 bg-white px-5 text-base font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Create an account
            <ArrowRight className="size-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
