"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useKeycloakLogin, type IdpHint } from "@/hooks/useKeycloakLogin";
import { useRegisterUserMutation } from "@/lib/redux/services/authApi";
import { CustomCountrySelect } from "@/components/auth/CustomCountrySelect";
import { useAutoDetectCountry } from "@/hooks/useAutoDetectCountry";
import { cn } from "@/lib/utils";

import {
  userRegisterSchema,
  type UserRegisterFormValues,
} from "@/lib/validations/auth";

export function UserRegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  /* Signing up with a provider and signing in with one are the same OIDC
     authorization request, so these buttons run the login redirect the rest of
     the app already uses — they never touch this form or /auth/register. */
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
    formState: { errors, isSubmitting, isValid },
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

  const handleCountryDetect = (name: string) => {
    setValue("country", name, { shouldValidate: true });
  };

  const { countriesList, countryCode, isDetecting, handleSetCountry } =
    useAutoDetectCountry(handleCountryDetect);

  const username = watch("username");
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const email = watch("email");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const agreeTerms = watch("agreeTerms");
  const countryValue = watch("country");

  const isFormComplete =
    Boolean(username?.trim()) &&
    Boolean(firstName?.trim()) &&
    Boolean(lastName?.trim()) &&
    Boolean(email?.trim()) &&
    Boolean(password) &&
    Boolean(confirmPassword) &&
    Boolean(agreeTerms) &&
    isValid;

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

      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Something went wrong. Please try again.";
      setApiError(message);
      console.error("Failed to register user:", err);
    }
  };

  /* Keycloak works out by itself whether this is a new account or a returning
     one, and the provider supplies name, email and avatar — so there is
     nothing to collect here and nothing to post. */
  const handleSocialSignIn = (provider: IdpHint) =>
    handleLogin("/dashboard", provider);

  return (
    <div className="w-full max-w-xl lg:max-w-2xl mx-auto my-auto flex flex-col justify-center">
      {/* Main Title Header */}
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
          Create your User account
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base mt-1 font-medium">
          Fill in your details to get started as a security researcher
        </p>
      </div>

      {/* Social Sign In Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
        {/* Google */}
        <Button
          type="button"
          onClick={() => handleSocialSignIn("google")}
          disabled={isSocialRedirecting}
          className="w-full h-11 sm:h-12 bg-card dark:bg-card hover:bg-muted/70 dark:hover:bg-muted/70 border border-border dark:border-border rounded-xl text-foreground font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
        >
          {pendingIdpHint === "google" ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>Continue with Google</span>
        </Button>

        {/* GitHub */}
        <Button
          type="button"
          onClick={() => handleSocialSignIn("github")}
          disabled={isSocialRedirecting}
          className="w-full h-11 sm:h-12 bg-card dark:bg-card hover:bg-muted/70 dark:hover:bg-muted/70 border border-border dark:border-border rounded-xl text-foreground font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
        >
          {pendingIdpHint === "github" ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <svg className="w-4 h-4 text-foreground fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          )}
          <span>Continue with GitHub</span>
        </Button>
      </div>

      {/* Divider */}
      <div className="relative mb-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <span className="relative z-10 px-3.5 py-0.5 text-xs font-medium text-muted-foreground bg-card rounded-full border border-border">
          or Sign up with Email
        </span>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Row 1: Username */}
          <div>
            <Label htmlFor="username" className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
              Username <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                placeholder="e.g. tada122"
                {...register("username")}
                className={cn(
                  "w-full h-11 pl-10 pr-4 bg-card border rounded-xl text-foreground text-sm placeholder:text-muted-foreground transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  errors.username ? "border-destructive focus:ring-destructive/30" : "border-border hover:border-muted-foreground/40"
                )}
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <User className="size-4" />
              </div>
            </div>
            {errors.username && (
              <p className="text-xs text-destructive mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Row 2: First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <Label htmlFor="firstName" className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
                First Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="firstName"
                  type="text"
                  placeholder="e.g. Data"
                  {...register("firstName")}
                  className={cn(
                    "w-full h-11 pl-10 pr-4 bg-card border rounded-xl text-foreground text-sm placeholder:text-muted-foreground transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                    errors.firstName ? "border-destructive focus:ring-destructive/30" : "border-border hover:border-muted-foreground/40"
                  )}
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <User className="size-4" />
                </div>
              </div>
              {errors.firstName && (
                <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <Label htmlFor="lastName" className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="lastName"
                  type="text"
                  placeholder="e.g. Battambang"
                  {...register("lastName")}
                  className={cn(
                    "w-full h-11 pl-10 pr-4 bg-card border rounded-xl text-foreground text-sm placeholder:text-muted-foreground transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                    errors.lastName ? "border-destructive focus:ring-destructive/30" : "border-border hover:border-muted-foreground/40"
                  )}
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <User className="size-4" />
                </div>
              </div>
              {errors.lastName && (
                <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Row 3: Email */}
          <div>
            <Label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
              Email <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="you@gmail.com"
                {...register("email")}
                className={cn(
                  "w-full h-11 pl-10 pr-4 bg-card border rounded-xl text-foreground text-sm placeholder:text-muted-foreground transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  errors.email ? "border-destructive focus:ring-destructive/30" : "border-border hover:border-muted-foreground/40"
                )}
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="size-4" />
              </div>
            </div>
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Row 4: Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <Label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  {...register("password")}
                  className={cn(
                    "w-full h-11 pl-10 pr-10 bg-card border rounded-xl text-foreground text-sm placeholder:text-muted-foreground transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                    errors.password ? "border-destructive focus:ring-destructive/30" : "border-border hover:border-muted-foreground/40"
                  )}
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Key className="size-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat password"
                  {...register("confirmPassword")}
                  className={cn(
                    "w-full h-11 pl-10 pr-10 bg-card border rounded-xl text-foreground text-sm placeholder:text-muted-foreground transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                    errors.confirmPassword ? "border-destructive focus:ring-destructive/30" : "border-border hover:border-muted-foreground/40"
                  )}
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <User className="size-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Row 5: Phone (optional) */}
          <div>
            <Label htmlFor="phone" className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
              Phone <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g. 866484857384"
              {...register("phone")}
              className={cn(
                "w-full h-11 px-4 bg-card border rounded-xl text-foreground text-sm placeholder:text-muted-foreground transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                errors.phone ? "border-destructive focus:ring-destructive/30" : "border-border hover:border-muted-foreground/40"
              )}
            />
            {errors.phone && (
              <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Row 6: Country / Region */}
          <div>
            <Label htmlFor="country" className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
              Country / Region
            </Label>
            <CustomCountrySelect
              value={countryValue || ""}
              countryCode={countryCode}
              countries={countriesList}
              isDetecting={isDetecting}
              onSelect={(country) => {
                handleSetCountry(country.name, country.code);
              }}
            />
          </div>

          {/* Row 7: Checkbox Terms */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                {...register("agreeTerms")}
                className="mt-0.5 w-4 h-4 rounded border-border bg-card text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs text-muted-foreground leading-snug">
                I agree to DevSolve&apos;s{" "}
                <Link href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-xs text-destructive mt-1 pl-6.5">{errors.agreeTerms.message}</p>
            )}
          </div>

          {/* API Error Banner */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <span className="mt-px shrink-0 text-destructive">⚠</span>
              <span>{apiError}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={!isFormComplete || isSubmitting || isApiLoading}
              className="w-full h-11 sm:h-12 bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 dark:border dark:border-blue-400/30 active:scale-[0.99] text-white font-semibold rounded-xl text-sm sm:text-base shadow-md shadow-blue-600/20 dark:shadow-blue-500/15 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting || isApiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Create Account</span>
                </>
              )}
            </Button>
          </div>
        </form>

      {/* Bottom Login Link */}
      <div className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/account-type" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}

