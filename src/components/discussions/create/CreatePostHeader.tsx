"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CreatePostHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeColor?: "blue" | "purple";
  backHref?: string;
  currentType?: "problem" | "showcase";
}

export function CreatePostHeader({
  title,
  subtitle = "Describe your problem or showcase to collaborate with the community.",
  badgeText,
  badgeColor,
  backHref = "/community",
  currentType,
}: CreatePostHeaderProps) {
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/dashboard") || backHref.startsWith("/dashboard");
  const problemHref = isDashboard ? "/dashboard/discussions/create/problem" : "/community/create/problem";
  const showcaseHref = isDashboard ? "/dashboard/discussions/create/showcase" : "/community/create/showcase";

  const activeType = currentType ?? (pathname.includes("/showcase") ? "showcase" : "problem");
  const activeBadgeColor = badgeColor ?? (activeType === "showcase" ? "purple" : "blue");

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href={backHref}
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "self-start text-sm font-semibold text-slate-600 hover:text-slate-900 gap-2 group px-2 -ml-2",
          })}
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Community</span>
        </Link>

        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 self-start sm:self-auto text-xs font-semibold">
          <Link
            href={problemHref}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeType === "problem"
                ? "bg-white text-blue-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Problem</span>
          </Link>
          <Link
            href={showcaseHref}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeType === "showcase"
                ? "bg-white text-blue-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Showcase</span>
          </Link>
        </div>
      </div>

      <div className="space-y-3 pb-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h1>
          {badgeText && (
            <Badge
              variant="outline"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg ${
                activeBadgeColor === "purple"
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              <span className={`size-1.5 rounded-full ${activeBadgeColor === "purple" ? "bg-purple-500 animate-pulse" : "bg-blue-500 animate-pulse"}`} />
              {badgeText}
            </Badge>
          )}
        </div>
        <p className="text-base text-slate-600 leading-relaxed">{subtitle}</p>
        <Separator className="bg-slate-200/80 mt-4" />
      </div>
    </div>
  );
}

