"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Eye, EyeOff, Key, LogIn, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/**
 * Static sign-in form used by /test-login.
 *
 * Presentation only: no submit handler, no provider calls, no validation, no
 * redirects. Every control is inert so the screen can be dropped in front of
 * whichever flow ends up behind it. Styling mirrors `UserRegisterForm` so the
 * two screens read as one family.
 */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export function TestLoginForm() {
  // UI affordance only — reveals the field, nothing to do with signing in.
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-xl lg:max-w-2xl mx-auto my-auto flex flex-col justify-center"
    >
      {/* Main Title Header */}
      <motion.div variants={itemVariants} className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base mt-1 font-medium">
          Sign in to keep hunting, keep building, and keep your streak going
        </p>
      </motion.div>

      {/* Social Sign In Buttons */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6"
      >
        {/* Google */}
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            className="w-full h-11 sm:h-12 bg-card dark:bg-card hover:bg-muted/70 dark:hover:bg-muted/70 border border-border dark:border-border rounded-xl text-foreground font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </Button>
        </motion.div>

        {/* GitHub */}
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            className="w-full h-11 sm:h-12 bg-card dark:bg-card hover:bg-muted/70 dark:hover:bg-muted/70 border border-border dark:border-border rounded-xl text-foreground font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-foreground fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Divider */}
      <motion.div variants={itemVariants} className="relative mb-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <span className="relative z-10 px-3.5 py-0.5 text-xs font-medium text-muted-foreground bg-card rounded-full border border-border">
          or Sign in with Email
        </span>
      </motion.div>

      {/* No onSubmit target: this screen is presentation only. */}
      <form onSubmit={(event) => event.preventDefault()} className="space-y-4">
        {/* Email or Username */}
        <motion.div variants={itemVariants}>
          <Label
            htmlFor="identifier"
            className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5"
          >
            Email or Username <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              placeholder="you@gmail.com or tada122"
              className="w-full h-11 pl-10 pr-4 bg-card border border-border hover:border-muted-foreground/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-foreground text-sm placeholder:text-muted-foreground transition-all"
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <User className="size-4" />
            </div>
          </div>
        </motion.div>

        {/* Password */}
        <motion.div variants={itemVariants}>
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <Label
              htmlFor="password"
              className="block text-xs sm:text-sm font-semibold text-foreground"
            >
              Password <span className="text-destructive">*</span>
            </Label>
            <Link
              href="#"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full h-11 pl-10 pr-10 bg-card border border-border hover:border-muted-foreground/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-foreground text-sm placeholder:text-muted-foreground transition-all"
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Key className="size-4" />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {/* Cross-fade the two icons rather than hard-swapping them. */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={showPassword ? "hide" : "show"}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </motion.div>

        {/* Keep me signed in */}
        <motion.div variants={itemVariants} className="pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              name="remember"
              className="w-4 h-4 rounded border-border bg-card text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-muted-foreground leading-snug">
              Keep me signed in
            </span>
          </label>
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants} className="pt-2">
          <Button
            type="submit"
            className="w-full h-11 sm:h-12 bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 dark:border dark:border-blue-400/30 active:scale-[0.99] text-white font-semibold rounded-xl text-sm sm:text-base shadow-md shadow-blue-600/20 dark:shadow-blue-500/15 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
            Sign in
          </Button>
        </motion.div>
      </form>

      {/* Bottom Register Link */}
      <motion.div
        variants={itemVariants}
        className="mt-6 text-center text-xs sm:text-sm text-muted-foreground"
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/account-type"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline"
        >
          Create one
        </Link>
      </motion.div>
    </motion.div>
  );
}

