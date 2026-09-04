"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarDays,
  Globe,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Maximize2,
  Minimize2,
  Eye,
  User,
} from "lucide-react";
import { SiGithub, SiX } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa6";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import type { EditProfileFormData } from "@/lib/types/profile/types";

interface LiveProfilePreviewCardProps {
  values: EditProfileFormData;
}

const GENDER_LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

export default function LiveProfilePreviewCard({
  values,
}: LiveProfilePreviewCardProps) {
  const [isCompact, setIsCompact] = useState(false);

  const displayName = values.fullName?.trim() || "Your Name";
  const username = values.username || "username";
  const bio = values.bio?.trim();
  const location = values.location?.trim();
  const phone = values.phone?.trim();
  const gender = values.gender ? GENDER_LABELS[values.gender] : null;

  const social = values.socialLinks;
  const hasSocial = Boolean(
    social?.github || social?.twitter || social?.linkedin || social?.website
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-md transition-all">
      <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Live Public Preview
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsCompact(!isCompact)}
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title={isCompact ? "Expand view" : "Compact view"}
          >
            {isCompact ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
          </button>
        </div>
      </div>

      <div className={cn("relative w-full overflow-hidden transition-all duration-300", isCompact ? "h-24 sm:h-28" : "h-32 sm:h-40")}>
        {values.coverUrl ? (
          <>
            <Image
              src={values.coverUrl}
              alt="Profile Cover"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-card/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-purple-600/20 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-purple-500/10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.25),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.2),transparent_50%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 dark:opacity-20" />
          </div>
        )}
      </div>

      <div className="px-5 pb-6 sm:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="relative -mt-10 sm:-mt-12 size-20 sm:size-24 shrink-0 rounded-full border-4 border-card bg-muted shadow-md overflow-hidden ring-2 ring-primary/20 z-10">
              {values.avatarUrl ? (
                <Image
                  src={values.avatarUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl sm:text-3xl font-extrabold text-white">
                  {values.avatarInitials || "DS"}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 pt-1.5 sm:pt-2 space-y-0.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="truncate text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {displayName}
                </h3>
                <span title="Verified Researcher" className="inline-flex text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="size-4.5" />
                </span>
              </div>
              <p className="truncate text-xs sm:text-sm font-mono text-muted-foreground">
                @{username}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {location ? (
              <span className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground">
                <MapPin className="size-3 text-muted-foreground" />
                {location}
              </span>
            ) : null}

            {phone ? (
              <span className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground">
                <Phone className="size-3 text-muted-foreground" />
                {phone}
              </span>
            ) : null}

            {gender ? (
              <span className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground">
                <User className="size-3 text-muted-foreground" />
                {gender}
              </span>
            ) : null}

            <span className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <CalendarDays className="size-3" />
              Joined recently
            </span>
          </div>

          {!isCompact && (
            <div className="rounded-xl border border-border/70 bg-muted/25 p-3.5">
              {bio ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm text-foreground/90 leading-relaxed break-words">
                  <ReactMarkdown>{bio}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs sm:text-sm italic text-muted-foreground">
                  No bio written yet. Tell the community about your research and experience...
                </p>
              )}
            </div>
          )}

          {hasSocial && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/70">
              {social?.github && (
                <a
                  href={social.github.startsWith("http") ? social.github : `https://${social.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition hover:border-primary hover:text-primary"
                >
                  <SiGithub className="size-3" />
                  <span>GitHub</span>
                </a>
              )}
              {social?.twitter && (
                <a
                  href={social.twitter.startsWith("http") ? social.twitter : `https://${social.twitter}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition hover:border-primary hover:text-primary"
                >
                  <SiX className="size-3" />
                  <span>X / Twitter</span>
                </a>
              )}
              {social?.linkedin && (
                <a
                  href={social.linkedin.startsWith("http") ? social.linkedin : `https://${social.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition hover:border-primary hover:text-primary"
                >
                  <FaLinkedin className="size-3 text-[#0A66C2]" />
                  <span>LinkedIn</span>
                </a>
              )}
              {social?.website && (
                <a
                  href={social.website.startsWith("http") ? social.website : `https://${social.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition hover:border-primary hover:text-primary"
                >
                  <Globe className="size-3 text-emerald-500" />
                  <span>Website</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
