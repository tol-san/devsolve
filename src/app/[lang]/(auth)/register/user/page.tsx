"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { TrendingUp, Zap, Users, ArrowLeft } from "lucide-react";
import { AuthHeroPanel, type HeroBadge } from "@/components/auth/AuthHeroPanel";
import { UserRegisterForm } from "@/components/auth/UserRegisterForm";
import { AuthHeaderActions } from "@/components/auth/AuthHeaderActions";
import { useT, useLocalePath } from "@/lib/i18n/I18nProvider";

export default function UserRegisterPage() {
  const t = useT();
  const localePath = useLocalePath();

  const userHeroBadges: HeroBadge[] = useMemo(
    () => [
      {
        icon: TrendingUp,
        label: t("auth.userRegister.badgeDiscover"),
        borderColorClass: "border-blue-200/80 dark:border-blue-400/30",
        iconColorClass: "text-blue-600 dark:text-blue-400",
      },
      {
        icon: Zap,
        label: t("auth.userRegister.badgeReputation"),
        borderColorClass: "border-emerald-200/80 dark:border-emerald-400/30",
        iconColorClass: "text-emerald-600 dark:text-emerald-400",
      },
      {
        icon: Users,
        label: t("auth.userRegister.badgeCommunity"),
        borderColorClass: "border-indigo-200/80 dark:border-indigo-400/30",
        iconColorClass: "text-indigo-600 dark:text-indigo-400",
      },
    ],
    [t]
  );

  return (
    <div className="h-screen max-h-screen w-full grid grid-cols-1 lg:grid-cols-2 overflow-hidden font-sans antialiased">
      {/* LEFT PANEL - Full-Bleed 3D Hero Section (Hidden on Mobile/Responsive) */}
      <AuthHeroPanel
        imageSrcDark="/researcher-dark.jpg"
        imageSrcLight="/researcher-light.jpg"
        badges={userHeroBadges}
        headline={t("auth.userRegister.headline")}
        description={t("auth.userRegister.description")}
        glowColor1="bg-blue-500/25"
        glowColor2="bg-purple-500/25"
        backHref="/account-type"
        backLabel={t("auth.common.backToAccountType")}
      />

      {/* RIGHT PANEL - User Registration Form */}
      <div className="relative h-screen max-h-screen w-full p-6 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-between items-center overflow-y-auto">
        <div className="w-full flex items-center justify-between mb-4 sm:mb-6">
          <Link
            href={localePath("/account-type")}
            className="lg:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4 text-blue-600 dark:text-blue-400" />
            <span>{t("auth.common.backToAccountType")}</span>
          </Link>
          <div className="ml-auto">
            <AuthHeaderActions />
          </div>
        </div>

        <UserRegisterForm />
        <div className="h-4" />
      </div>
    </div>
  );
}
