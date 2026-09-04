"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Key,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  Phone,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useKeycloakLogin, type IdpHint } from "@/hooks/useKeycloakLogin";
import { useRegisterUserMutation } from "@/lib/redux/services/authApi";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { useAutoDetectCountry } from "@/hooks/useAutoDetectCountry";
import { useT, useLocalePath } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

import {
  userRegisterSchema,
  type UserRegisterFormValues,
} from "@/lib/validations/auth";

export function UserRegisterForm() {
  const router = useRouter();
  const t = useT();
  const localePath = useLocalePath();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    isLoggingIn: isSocialRedirecting,
    pendingIdpHint,
    handleLogin,
  } = useKeycloakLogin();

  const [registerUser, { isLoading: isApiLoading }] = useRegisterUserMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserRegisterFormValues>({
    resolver: zodResolver(userRegisterSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      country: "",
      agreeTerms: false,
    },
  });

  const handleCountryDetect = useCallback(
    (code: string) => {
      setValue("country", code, { shouldValidate: true });
    },
    [setValue],
  );

  const { isDetecting } = useAutoDetectCountry(handleCountryDetect);

  const password = watch("password");
  const countryValue = watch("country");

  const onSubmit = async (data: UserRegisterFormValues) => {
    setApiError(null);
    try {
      await registerUser({
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
        confirmPassword: data.confirmPassword,
        accountType: "USER",
      }).unwrap();

      void handleLogin("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Registration failed. Please verify your details and try again.";
      setApiError(message);
      console.error("Failed to register user:", err);
    }
  };

  const handleSocialSignIn = (provider: IdpHint) =>
    handleLogin("/dashboard", provider);

  return (
    <div className="w-full max-w-xl lg:max-w-2xl mx-auto my-auto flex flex-col justify-center">
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
          {t("auth.userRegister.title")}
        </h2>
        <p className="text-slate-600 dark:text-muted-foreground text-sm sm:text-base mt-1 font-medium">
          {t("auth.userRegister.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
        <Button
          type="button"
          onClick={() => handleSocialSignIn("google")}
          disabled={isSocialRedirecting}
          className="w-full h-11 sm:h-12 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted/70 border border-slate-300 dark:border-border rounded-xl text-slate-800 dark:text-foreground font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
        >
          {pendingIdpHint === "google" ? (
            <Loader2 className="size-4 animate-spin text-blue-600" />
          ) : (
            <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
          onClick={() => handleSocialSignIn("github")}
          disabled={isSocialRedirecting}
          className="w-full h-11 sm:h-12 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted/70 border border-slate-300 dark:border-border rounded-xl text-slate-800 dark:text-foreground font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
        >
          {pendingIdpHint === "github" ? (
            <Loader2 className="size-4 animate-spin text-foreground" />
          ) : (
            <svg
              className="size-4 shrink-0 fill-current text-slate-900 dark:text-foreground"
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
        <span className="relative z-10 px-3.5 py-0.5 text-xs font-medium text-slate-600 dark:text-muted-foreground bg-slate-50 dark:bg-card rounded-full border border-slate-200 dark:border-border">
          {t("auth.common.orRegisterWithEmail")}
        </span>
      </div>

      {apiError && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive font-medium shadow-xs">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label
            htmlFor="username"
            className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
          >
            {t("auth.userRegister.username")}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="username"
              type="text"
              autoComplete="username"
              placeholder={t("auth.userRegister.usernamePlaceholder")}
              {...register("username")}
              className={cn(
                "w-full h-11 sm:h-12 pl-10 pr-4 bg-white dark:bg-card border rounded-xl text-slate-900 dark:text-foreground text-sm placeholder:text-slate-400 dark:placeholder:text-muted-foreground transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                errors.username
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-slate-300 dark:border-border hover:border-slate-400 dark:hover:border-muted-foreground/40"
              )}
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <User className="size-4" />
            </div>
          </div>
          {errors.username && (
            <p className="text-xs text-destructive mt-1 font-medium">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="firstName"
              className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
            >
              {t("auth.userRegister.firstName")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder={t("auth.userRegister.firstNamePlaceholder")}
                {...register("firstName")}
                className={cn(
                  "w-full h-11 sm:h-12 pl-10 pr-4 bg-white dark:bg-card border rounded-xl text-slate-900 dark:text-foreground text-sm placeholder:text-slate-400 dark:placeholder:text-muted-foreground transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  errors.firstName
                    ? "border-destructive focus:ring-destructive/30"
                    : "border-slate-300 dark:border-border hover:border-slate-400 dark:hover:border-muted-foreground/40"
                )}
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <User className="size-4" />
              </div>
            </div>
            {errors.firstName && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="lastName"
              className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
            >
              {t("auth.userRegister.lastName")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder={t("auth.userRegister.lastNamePlaceholder")}
                {...register("lastName")}
                className={cn(
                  "w-full h-11 sm:h-12 pl-10 pr-4 bg-white dark:bg-card border rounded-xl text-slate-900 dark:text-foreground text-sm placeholder:text-slate-400 dark:placeholder:text-muted-foreground transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  errors.lastName
                    ? "border-destructive focus:ring-destructive/30"
                    : "border-slate-300 dark:border-border hover:border-slate-400 dark:hover:border-muted-foreground/40"
                )}
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <User className="size-4" />
              </div>
            </div>
            {errors.lastName && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="email"
              className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
            >
              {t("auth.userRegister.email")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("auth.userRegister.emailPlaceholder")}
                {...register("email")}
                className={cn(
                  "w-full h-11 sm:h-12 pl-10 pr-4 bg-white dark:bg-card border rounded-xl text-slate-900 dark:text-foreground text-sm placeholder:text-slate-400 dark:placeholder:text-muted-foreground transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  errors.email
                    ? "border-destructive focus:ring-destructive/30"
                    : "border-slate-300 dark:border-border hover:border-slate-400 dark:hover:border-muted-foreground/40"
                )}
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="size-4" />
              </div>
            </div>
            {errors.email && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="phone"
              className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
            >
              {t("auth.userRegister.phone")}
            </Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder={t("auth.userRegister.phonePlaceholder")}
                {...register("phone")}
                className="w-full h-11 sm:h-12 pl-10 pr-4 bg-white dark:bg-card border border-slate-300 dark:border-border hover:border-slate-400 dark:hover:border-muted-foreground/40 rounded-xl text-slate-900 dark:text-foreground text-sm placeholder:text-slate-400 dark:placeholder:text-muted-foreground transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Phone className="size-4" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label
            htmlFor="country"
            className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
          >
            {t("auth.userRegister.country")}
          </Label>
          <CountrySelect
            id="country"
            value={countryValue}
            isDetecting={isDetecting}
            onChange={(code) =>
              setValue("country", code, { shouldValidate: true })
            }
          />
          <p className="mt-1.5 text-xs text-slate-500 dark:text-muted-foreground">
            {t("auth.userRegister.countryHint")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="password"
              className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
            >
              {t("auth.common.password")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={t("auth.userRegister.passwordPlaceholder")}
                {...register("password")}
                className={cn(
                  "w-full h-11 sm:h-12 pl-10 pr-11 bg-white dark:bg-card border rounded-xl text-slate-900 dark:text-foreground text-sm placeholder:text-slate-400 dark:placeholder:text-muted-foreground transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  errors.password
                    ? "border-destructive focus:ring-destructive/30"
                    : "border-slate-300 dark:border-border hover:border-slate-400 dark:hover:border-muted-foreground/40"
                )}
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Key className="size-4" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={
                  showPassword
                    ? t("auth.common.hidePassword")
                    : t("auth.common.showPassword")
                }
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.password.message}
              </p>
            )}
            <PasswordStrengthMeter password={password} />
          </div>

          <div>
            <Label
              htmlFor="confirmPassword"
              className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
            >
              {t("auth.common.confirmPassword")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={t("auth.userRegister.confirmPasswordPlaceholder")}
                {...register("confirmPassword")}
                className={cn(
                  "w-full h-11 sm:h-12 pl-10 pr-11 bg-white dark:bg-card border rounded-xl text-slate-900 dark:text-foreground text-sm placeholder:text-slate-400 dark:placeholder:text-muted-foreground transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  errors.confirmPassword
                    ? "border-destructive focus:ring-destructive/30"
                    : "border-slate-300 dark:border-border hover:border-slate-400 dark:hover:border-muted-foreground/40"
                )}
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Key className="size-4" />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                aria-label={
                  showConfirmPassword
                    ? t("auth.common.hidePassword")
                    : t("auth.common.showPassword")
                }
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
          {t("auth.userRegister.passwordRequirement")}
        </p>

        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("agreeTerms")}
              className="size-4 mt-0.5 cursor-pointer rounded border-input text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs sm:text-sm text-slate-600 dark:text-muted-foreground leading-snug">
              {t("auth.common.agreeToTerms")}{" "}
              <Link
                href={localePath("/about")}
                className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                {t("auth.common.termsOfService")}
              </Link>{" "}
              {t("auth.common.and")}{" "}
              <Link
                href={localePath("/about")}
                className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                {t("auth.common.privacyPolicy")}
              </Link>
              .
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-xs text-destructive mt-1 font-medium">
              {errors.agreeTerms.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || isApiLoading}
          className="mt-4 flex h-11 sm:h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 dark:border dark:border-blue-400/30 text-sm sm:text-base font-semibold text-white shadow-md shadow-blue-600/20 dark:shadow-blue-500/15 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {isSubmitting || isApiLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{t("auth.userRegister.submitting")}</span>
            </>
          ) : (
            <>
              <UserPlus className="size-4" />
              <span>{t("auth.userRegister.submitButton")}</span>
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm font-medium text-slate-600 dark:text-muted-foreground">
        {t("auth.common.alreadyHaveAccount")}{" "}
        <Link
          href={localePath("/login")}
          className="font-bold text-blue-600 hover:underline dark:text-blue-400"
        >
          {t("auth.common.logIn")}
        </Link>
      </p>
    </div>
  );
}
