import React from "react";
import { ProgramDetail, SeverityLevel } from "@/lib/types/programs/types";
import { DollarSign, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const severityBadgeStyles: Record<SeverityLevel, string> = {
  CRITICAL: "bg-red-600 dark:bg-red-700 text-white shadow-xs",
  HIGH: "bg-orange-500 dark:bg-orange-600 text-white shadow-xs",
  MEDIUM: "bg-amber-500 dark:bg-amber-600 text-white shadow-xs",
  LOW: "bg-slate-600 dark:bg-slate-700 text-white shadow-xs",
  NONE: "bg-slate-400 dark:bg-slate-600 text-white shadow-xs",
};

const severityDescriptions: Record<SeverityLevel, string> = {
  CRITICAL: "Remote Code Execution (RCE), Authentication Bypass, Full Database Leak",
  HIGH: "Stored XSS, Account Takeover, Privilege Escalation, Broken Access Control",
  MEDIUM: "CSRF on critical actions, IDOR, Server-Side Request Forgery (SSRF)",
  LOW: "Reflected XSS, Open Redirect, Sensitive Information Disclosure",
  NONE: "Informational or low impact issues",
};

export function ProgramBountyMatrixTab({ program }: { program: ProgramDetail }) {
  const rewards = program?.rewards || [];

  return (
    <div className="bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 p-5 sm:p-8 space-y-6 shadow-xs">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            Bounty Reward Matrix
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Bounties are awarded based on CVSS severity rating and business impact.
        </p>
      </div>

      {rewards.length === 0 ? (
        program?.offersBounties && (program?.minimumBounty || program?.maximumBounty) ? (
          <div className="ring-1 ring-foreground/5 dark:ring-foreground/10 rounded-2xl p-4 sm:p-5 bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-black uppercase rounded-full tracking-wider w-fit shrink-0 bg-emerald-600 text-white">
                Bounty Range
              </span>
              <span className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                Standard reward range configured for this program.
              </span>
            </div>
            <p className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
              ${(program.minimumBounty ?? 0).toLocaleString()} – ${(program.maximumBounty ?? 0).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No specific reward tiers configured.
          </p>
        )
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {rewards.map((reward, idx) => {
            const severityKey = (reward.severity || "MEDIUM").toUpperCase() as SeverityLevel;
            const badgeStyle =
              severityBadgeStyles[severityKey] || "bg-slate-500 text-white";
            const description =
              severityDescriptions[severityKey] || "";

            const min = Number(reward.minAmount ?? 0);
            const max = Number(reward.maxAmount ?? 0);
            const points = Number(reward.points ?? 0);

            return (
              <div
                key={reward.id || `${severityKey}-${idx}`}
                className="ring-1 ring-foreground/5 dark:ring-foreground/10 rounded-2xl p-4 sm:p-5 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center px-2.5 py-1 text-xs font-black uppercase rounded-md tracking-wider shrink-0",
                        badgeStyle
                      )}
                    >
                      {severityKey}
                    </span>
                    {points > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2 py-0.5 rounded-md">
                        <Zap className="w-3 h-3 fill-amber-500" />
                        {points} pts
                      </span>
                    )}
                  </div>

                  <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    ${min.toLocaleString()} – ${max.toLocaleString()}
                  </p>
                </div>

                {description && (
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}