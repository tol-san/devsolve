"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Shield, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import type { ProgramType, ScopeTarget } from "./types";

interface CreateProgramPreviewProps {
  programName: string;
  description: string;
  programType: ProgramType;
  activeInScope: ScopeTarget[];
  getRewardRange: () => string;
}

export function CreateProgramPreview({
  programName,
  description,
  programType,
  activeInScope,
  getRewardRange,
}: CreateProgramPreviewProps) {
  /* The membership, not `/organizations/me`: a member creating a program has
     no access to the organization's own record. */
  const { membership } = useCompanyAccess();
  const organization = membership
    ? {
        name: membership.organizationName,
        logoUrl: membership.organizationLogoUrl ?? undefined,
      }
    : undefined;
  const [imageError, setImageError] = useState(false);

  const logoUrl = !imageError && organization?.logoUrl ? organization.logoUrl : null;
  const companyName = organization?.name || "My Organization";

  const initials = companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "CO";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Live Card Preview
        </span>
      </div>

      <div className="bg-card text-card-foreground rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 p-4 sm:p-6 shadow-xs space-y-5">
        {/* Header: Logo, Org Name, Badge & Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Real Logo / Initials */}
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center border border-border shrink-0 overflow-hidden text-muted-foreground shadow-xs">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={companyName}
                  className="w-full h-full object-cover"
                  width={40}
                  height={40}
                  onError={() => setImageError(true)}
                  unoptimized
                />
              ) : (
                <span className="text-xs font-extrabold text-foreground tracking-wider">
                  {initials}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-foreground leading-tight">
                  {companyName}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {programType === "BOUNTY" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                    Bounty
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                    Response
                  </span>
                )}
                <span className="text-xs text-muted-foreground font-medium">
                  •
                </span>
                <span className="text-xs text-muted-foreground font-medium capitalize">
                  open
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Program Title & Short Description */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-foreground leading-snug">
            {programName || "Program Name Security"}
          </h3>
          <p className="text-xs text-muted-foreground font-normal leading-relaxed line-clamp-3">
            {description ||
              "Protecting core infrastructure, including checkout, merchant services, and peer-to-peer transfers..."}
          </p>
        </div>

        {/* In-Scope Assets Pills */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            IN-SCOPE ASSETS
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {activeInScope.length > 0 ? (
              activeInScope.slice(0, 2).map((item) => (
                <span
                  key={item.id}
                  className="px-2.5 py-1 rounded-lg bg-muted text-foreground text-xs font-mono font-medium border border-border"
                >
                  {item.target}
                </span>
              ))
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-mono border border-border">
                *.example.com
              </span>
            )}

            {activeInScope.length > 2 && (
              <span className="px-2 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-semibold">
                +{activeInScope.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Footer / Rewards & Action */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block">
              Rewards
            </span>
            <span
              className={`text-base font-extrabold ${
                programType === "BOUNTY"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            >
              {getRewardRange()}
            </span>
          </div>

          {programType === "BOUNTY" ? (
            <Button
              type="button"
              size="sm"
              className="bg-foreground text-background hover:bg-foreground/90 text-xs font-bold rounded-xl px-4 h-9 cursor-pointer"
            >
              See Details
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-muted text-xs font-semibold rounded-xl px-4 h-9 cursor-pointer"
            >
              See Details
              <ArrowRight className="w-3.5 h-3.5 ml-1 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
