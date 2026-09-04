"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Key,
  Loader2,
  LogIn,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useKeycloakLogin, type IdpHint } from "@/hooks/useKeycloakLogin";
import { AuthHeroPanel } from "@/components/auth/AuthHeroPanel";
import { AuthHeaderActions } from "@/components/auth/AuthHeaderActions";
import { useLocalePath } from "@/lib/i18n/I18nProvider";

const HERO_BADGES = [
  {
    icon: ShieldCheck,
    label: "Secure by default",
    borderColorClass: "border-blue-200/80 dark:border-blue-400/30",
    iconColorClass: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Zap,
    label: "Pick up where you left off",
    borderColorClass: "border-emerald-200/80 dark:border-emerald-400/30",
    iconColorClass: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Sparkles,
    label: "One account, everywhere",
    borderColorClass: "border-indigo-200/80 dark:border-indigo-400/30",
    iconColorClass: "text-indigo-600 dark:text-indigo-400",
  },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { isLoggingIn, pendingIdpHint, handleLogin } = useKeycloakLogin();
  const localePath = useLocalePath();

  const getRedirectUrl = () => {
    if (typeof window === "undefined") return "/dashboard";
    const params = new URLSearchParams(window.location.search);
    return params.get("redirect") || "/dashboard";
  };

  const handleSocialSignIn = (provider: IdpHint) => {
    void handleLogin(getRedirectUrl(), provider);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void handleLogin(getRedirectUrl());
  };

  return (
    <div className="grid h-screen max-h-screen w-full grid-cols-1 overflow-hidden font-sans antialiased lg:grid-cols-2">
      <AuthHeroPanel
        imageSrcDark="/researcher-dark.jpg"
        imageSrcLight="/researcher-light.jpg"
        badges={HERO_BADGES}
        headline="Welcome back"
        description="Sign in to keep hunting, keep building, and keep your streak going."
        glowColor1="bg-blue-500/25"
        glowColor2="bg-purple-500/25"
        backHref="/"
        backLabel="Back to home"
      />

      <div className="relative flex h-screen max-h-screen w-full flex-col items-center justify-between overflow-y-auto p-6 sm:p-10 lg:p-12 xl:p-16">
        <div className="flex w-full items-center justify-between mb-4 sm:mb-6">
          <Link
            href={localePath("/")}
            className="lg:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4 text-blue-600 dark:text-blue-400" />
            <span>Back to home</span>
          </Link>
          <div className="ml-auto">
            <AuthHeaderActions />
          </div>
        </div>

        <div className="mx-auto my-auto flex w-full max-w-md flex-col justify-center">
          <div className="mb-6 text-center sm:text-left">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Sign in
            </h2>
            <p className="mt-1 text-sm font-medium text-muted-foreground sm:text-base">
              Welcome back — enter your details to continue.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Button
              type="button"
              disabled={isLoggingIn}
              onClick={() => handleSocialSignIn("google")}
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-card text-xs font-semibold text-slate-800 dark:text-foreground shadow-2xs transition-all hover:bg-slate-50 dark:hover:bg-muted/70 sm:h-12 sm:text-sm"
            >
              {pendingIdpHint === "google" ? (
                <Loader2 className="size-4 animate-spin text-blue-600" />
              ) : (
                <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
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
              )}
              <span>Google</span>
            </Button>

            <Button
              type="button"
              disabled={isLoggingIn}
              onClick={() => handleSocialSignIn("github")}
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-card text-xs font-semibold text-slate-800 dark:text-foreground shadow-2xs transition-all hover:bg-slate-50 dark:hover:bg-muted/70 sm:h-12 sm:text-sm"
            >
              {pendingIdpHint === "github" ? (
                <Loader2 className="size-4 animate-spin text-foreground" />
              ) : (
                <svg
                  className="size-4 fill-current text-slate-900 dark:text-foreground"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              )}
              <span>GitHub</span>
            </Button>
          </div>

          <div className="relative mb-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-border/60" />
            </div>
            <span className="relative z-10 px-3.5 py-0.5 text-xs font-medium text-muted-foreground bg-slate-50 dark:bg-card rounded-full border border-slate-200 dark:border-border">
              or sign in with Keycloak
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="identifier"
                className="mb-1.5 block text-xs font-semibold text-foreground sm:text-sm"
              >
                Email or username
              </Label>
              <div className="relative">
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  placeholder="you@example.com or tada122"
                  className="h-11 w-full rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-card hover:border-slate-400 dark:hover:border-muted-foreground/40 pl-10 pr-4 text-sm text-foreground transition-all placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <User className="size-4" />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <Label
                  htmlFor="password"
                  className="block text-xs font-semibold text-foreground sm:text-sm"
                >
                  Password
                </Label>
                <Link
                  href="#"
                  className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
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
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-card hover:border-slate-400 dark:hover:border-muted-foreground/40 pl-10 pr-11 text-sm text-foreground transition-all placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <Key className="size-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                name="remember"
                className="size-4 cursor-pointer rounded border-input text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-muted-foreground">
                Keep me signed in
              </span>
            </label>

            <Button
              type="submit"
              disabled={isLoggingIn}
              className="mt-2 flex h-11 sm:h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 dark:border dark:border-blue-400/30 text-sm sm:text-base font-semibold text-white shadow-md shadow-blue-600/20 dark:shadow-blue-500/15 transition-all active:scale-[0.99]"
            >
              {isLoggingIn && !pendingIdpHint ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LogIn className="size-4" />
                  Sign in
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href={localePath("/account-type")}
              className="font-bold text-blue-600 hover:underline dark:text-blue-400"
            >
              Create one
            </Link>
          </p>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
