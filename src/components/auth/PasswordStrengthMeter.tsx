"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/I18nProvider";

interface PasswordStrengthMeterProps {
  password?: string;
  className?: string;
}

export function PasswordStrengthMeter({
  password = "",
  className,
}: PasswordStrengthMeterProps) {
  const t = useT();

  const { score, label, colorClass } = useMemo(() => {
    if (!password) {
      return { score: 0, label: "", colorClass: "bg-muted" };
    }

    let currentScore = 0;
    if (password.length >= 8) currentScore += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) currentScore += 1;
    if (/\d/.test(password)) currentScore += 1;
    if (/[^a-zA-Z0-9]/.test(password)) currentScore += 1;

    switch (currentScore) {
      case 1:
        return {
          score: 1,
          label: t("auth.userRegister.strengthWeak"),
          colorClass: "bg-red-500",
        };
      case 2:
        return {
          score: 2,
          label: t("auth.userRegister.strengthFair"),
          colorClass: "bg-orange-500",
        };
      case 3:
        return {
          score: 3,
          label: t("auth.userRegister.strengthGood"),
          colorClass: "bg-amber-500",
        };
      case 4:
        return {
          score: 4,
          label: t("auth.userRegister.strengthStrong"),
          colorClass: "bg-emerald-500",
        };
      default:
        return { score: 0, label: "", colorClass: "bg-muted" };
    }
  }, [password, t]);

  if (!password) return null;

  return (
    <div className={cn("space-y-1.5 pt-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">
          {t("auth.userRegister.passwordStrength")}
        </span>
        <span
          className={cn(
            "font-bold transition-colors",
            score === 1 && "text-red-500",
            score === 2 && "text-orange-500",
            score === 3 && "text-amber-500",
            score === 4 && "text-emerald-500"
          )}
        >
          {label}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              step <= score ? colorClass : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}
