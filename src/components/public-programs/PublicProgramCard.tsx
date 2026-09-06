"use client";

import Image from "next/image";
import { ArrowRight, CircleDot, Globe, Lock, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import type { ProgramItem } from "@/lib/types/programs/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PublicProgramCardProps = {
  program: ProgramItem;
  onSeeDetails: (program: ProgramItem) => void;
};

function statusClass(status: ProgramItem["status"]) {
  if (status === "Open") {
    return "text-emerald-600";
  }
  if (status === "Done") {
    return "text-sky-600";
  }
  return "text-slate-500";
}

export function PublicProgramCard({
  program,
  onSeeDetails,
}: PublicProgramCardProps) {
  const isBounty = program.type === "Bounty";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => onSeeDetails(program)}
      className="flex h-full flex-col rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] cursor-pointer"
    >
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {program.logoUrl ? (
                <Image
                  src={program.logoUrl}
                  alt={program.companyName}
                  width={44}
                  height={44}
                  className="size-9 object-contain"
                />
              ) : (
                <span className="text-sm font-bold text-slate-700">
                  {program.companyName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {program.companyName}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-blue-100 bg-blue-50 text-blue-600"
                >
                  {program.type}
                </Badge>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs font-medium",
                    statusClass(program.status)
                  )}
                >
                  <CircleDot className="size-3" />
                  {program.status}
                </span>
                {program.isPrivate ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                    <Lock className="size-3" />
                    Private
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {program.isNew ? (
            <Badge className="border-0 bg-slate-900 text-white">
              <Sparkles className="size-3" />
              New
            </Badge>
          ) : null}
        </div>

        <div className="space-y-2">
          <h2 className="line-clamp-2 text-[15px] font-semibold leading-6 text-slate-900">
            {program.title}
          </h2>
          <p className="line-clamp-3 min-h-[66px] text-sm leading-5.5 text-slate-500">
            {program.description}
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            In-scope assets
          </div>
          <div className="flex flex-wrap gap-1.5">
            {program.inScopeAssets.slice(0, 4).map((asset) => (
              <span
                key={asset}
                className="inline-flex max-w-[132px] truncate rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
                title={asset}
              >
                {asset}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Reward
            </div>
            <p
              className={cn(
                "mt-1 text-sm font-bold",
                isBounty ? "text-emerald-600" : "text-blue-600"
              )}
            >
              {program.rewardRange}
            </p>
          </div>

          <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
            <Globe className="size-3" />
            {(program.assetCategories || []).join(" / ")}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
