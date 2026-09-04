"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  Award,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ResearcherHoverCardProps = {
  name: string;
  initials?: string;
  email?: string;
  username?: string;
  userId?: string;
  reputation?: number;
  acceptedReports?: number;
  accuracyRate?: string;
  totalBounties?: string;
  bio?: string;
  location?: string;
  memberSince?: string;
  specialization?: string[];
  badges?: string[];
  className?: string;
  children?: React.ReactNode;
  showAvatar?: boolean;
  align?: "left" | "right" | "center";
};

export function ResearcherHoverCard({
  name,
  initials,
  email,
  username: customUsername,
  userId,
  reputation = 2450,
  acceptedReports = 48,
  accuracyRate = "96.4%",
  totalBounties = "$38,500",
  bio = "Full-stack security researcher & vulnerability analyst specializing in IDOR, authorization logic bypasses, and cloud infrastructure security.",
  location = "Phnom Penh, Cambodia",
  memberSince = "March 2024",
  specialization = ["API Security", "Access Control", "Cloud Sec"],
  badges = ["Top 5% Hunter", "High Signal", "Fast Triager"],
  className,
  children,
  showAvatar = true,
  align = "left",
}: ResearcherHoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const derivedUsername =
    customUsername ||
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]+/g, "_");

  const derivedInitials =
    initials ||
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const derivedEmail = email || `${derivedUsername}@devsolve.io`;
  const profileHref = `/profile/${encodeURIComponent(userId || derivedUsername)}`;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(true), 150);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children ? (
        <Link
          href={profileHref}
          className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600 dark:hover:text-blue-400 group cursor-pointer"
        >
          {children}
        </Link>
      ) : (
        <Link
          href={profileHref}
          className="inline-flex items-center gap-2 font-semibold text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors group cursor-pointer"
        >
          {showAvatar && (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-2xs group-hover:scale-105 transition-transform">
              {derivedInitials}
            </span>
          )}
          <span className="group-hover:underline underline-offset-4">{name}</span>
        </Link>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={cn(
              "absolute z-50 w-[calc(100vw-40px)] sm:w-80 max-w-[330px] rounded-2xl border border-border bg-card p-4.5 sm:p-5 shadow-2xl text-foreground ring-1 ring-border/80",
              align === "left" && "left-0 top-full mt-2",
              align === "right" && "right-0 top-full mt-2",
              align === "center" && "left-1/2 -translate-x-1/2 top-full mt-2"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-base shadow-sm ring-2 ring-blue-500/20">
                    {derivedInitials}
                  </div>
                  <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-card" title="Active on platform" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={profileHref}
                      className="font-bold text-sm sm:text-base text-foreground hover:text-blue-600 dark:hover:text-blue-400 truncate hover:underline"
                    >
                      {name}
                    </Link>
                    <CheckCircle2 className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    @{derivedUsername}
                  </p>
                </div>
              </div>

              <Badge
                variant="outline"
                className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
              >
                Researcher
              </Badge>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {bio}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {badges.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border/80"
                >
                  <Sparkles className="size-2.5 text-amber-500" />
                  {b}
                </span>
              ))}
            </div>

            <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-xl border border-border bg-muted/40 p-2.5 text-center">
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Reputation</p>
                <p className="text-xs font-bold text-foreground flex items-center justify-center gap-1">
                  <Trophy className="size-3 text-amber-500" />
                  {reputation.toLocaleString()}
                </p>
              </div>

              <div className="space-y-0.5 border-x border-border">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Resolved</p>
                <p className="text-xs font-bold text-foreground flex items-center justify-center gap-1">
                  <ShieldCheck className="size-3 text-emerald-500" />
                  {acceptedReports}
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Accuracy</p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {accuracyRate}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="size-3 shrink-0" />
                {location}
              </span>
              <span className="flex items-center gap-1 shrink-0">
                <Calendar className="size-3" />
                Joined {memberSince}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
              <Link href={profileHref} className="flex-1">
                <Button
                  size="sm"
                  className="w-full h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>View Full Profile</span>
                  <ExternalLink className="size-3" />
                </Button>
              </Link>

              <a href={`mailto:${derivedEmail}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-xl border-border bg-card hover:bg-muted font-semibold text-foreground text-xs gap-1 cursor-pointer"
                  title={`Email ${name}`}
                >
                  <Mail className="size-3.5" />
                </Button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
