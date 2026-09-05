"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  FaGithub,
  FaLinkedin,
  FaTelegram,
} from "react-icons/fa6";
import type { IconType } from "react-icons";
import { useInk } from "@/components/landing/SectionBackdrop";
import type { TeamMember } from "@/lib/types/about/type";
import { cn } from "@/lib/utils";

export const CARD =
  "rounded-2xl bg-white shadow-[0_0_0_1px_rgba(30,41,59,0.08),0_2px_10px_rgba(30,41,59,0.05)] dark:bg-neutral-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_2px_10px_rgba(0,0,0,0.5)]";

export const CARD_HOVER =
  "transition-shadow hover:shadow-[0_0_0_1px_rgba(37,99,235,0.35),0_10px_28px_-14px_rgba(30,41,59,0.35)] dark:hover:shadow-[0_0_0_1px_rgba(96,165,250,0.45),0_10px_28px_-14px_rgba(0,0,0,0.7)]";

type SocialLink = { href: string; icon: IconType | LucideIcon; label: string };

function socialsFor(member: TeamMember): SocialLink[] {
  const links: (SocialLink | null)[] = [
    member.github
      ? {
          href: member.github,
          icon: FaGithub,
          label: `${member.name} on GitHub`,
        }
      : null,
    member.linkedin
      ? {
          href: member.linkedin,
          icon: FaLinkedin,
          label: `${member.name} on LinkedIn`,
        }
      : null,
    member.telegram
      ? {
          href: member.telegram,
          icon: FaTelegram,
          label: `${member.name} on Telegram`,
        }
      : null,
    member.email
      ? {
          href: `mailto:${member.email}`,
          icon: Mail,
          label: `Email ${member.name}`,
        }
      : null,
  ];

  return links.filter((link): link is SocialLink => link !== null);
}

export function MemberCard({
  member,
  badgeLabel,
  roleLabel,
}: {
  member: TeamMember;
  badgeLabel?: string;
  roleLabel?: string;
}) {
  const ink = useInk();
  const socials = socialsFor(member);

  const isMentor = member.badge === "Mentor";
  const isLeader = member.badge === "Leader";
  const isSubLeader = member.badge === "Sub Leader";

  const chipStyle = isMentor
    ? "bg-blue-600 text-white shadow-xs"
    : isLeader
    ? "bg-[#1E293B] text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs"
    : isSubLeader
    ? "bg-blue-600/90 text-white shadow-xs"
    : "border border-slate-200 text-slate-600 dark:border-neutral-700 dark:text-neutral-300";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-card/90 border border-border/80 shadow-xs backdrop-blur-md transition-all duration-300 hover:shadow-md hover:border-blue-500/35"
    >
      <div
        className="relative aspect-[6/7] w-full overflow-hidden bg-slate-100 dark:bg-neutral-800"
        style={{ aspectRatio: "6 / 7" }}
      >
        <Image
          src={member.image}
          alt={member.name}
          unoptimized
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h4
            className="min-w-0 flex-1 truncate text-base sm:text-lg font-bold tracking-tight group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors"
            style={{ color: ink }}
          >
            {member.name}
          </h4>

          <span
            className={cn(
              "shrink-0 rounded-lg px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase",
              chipStyle
            )}
          >
            {badgeLabel || member.badge || "Member"}
          </span>
        </div>

        {member.quote && (
          <p className="mt-2.5 line-clamp-2 text-xs italic leading-relaxed text-slate-500 dark:text-neutral-400">
            &ldquo;{member.quote.replace(/^["'“”]+|["'“”]+$/g, "")}&rdquo;
          </p>
        )}

        {socials.length > 0 && (
          <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3 mt-3.5 dark:border-neutral-800">
            {socials.map((social) => {
              const Icon = social.icon;
              const isMail = social.href.startsWith("mailto:");

              return (
                <a
                  key={social.href}
                  href={social.href}
                  target={isMail ? undefined : "_blank"}
                  rel={isMail ? undefined : "noopener noreferrer"}
                  aria-label={social.label}
                  className="flex size-7.5 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-all hover:bg-[#2563EB] hover:text-white dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-blue-500 dark:hover:text-white"
                >
                  <Icon className="size-3.5" aria-hidden />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </motion.article>
  );
}

export function GroupLabel({ label, count }: { label: string; count: number }) {
  const ink = useInk();

  return (
    <div className="team-group-label flex items-center justify-center gap-4">
      <span className="h-px w-10 bg-slate-200 dark:bg-neutral-800 sm:w-16" />
      <span
        className="text-xs font-bold uppercase tracking-[0.22em]"
        style={{ color: ink }}
      >
        {label}
      </span>
      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold tabular-nums text-slate-600 dark:bg-neutral-800 dark:text-neutral-300 border border-slate-200/80 dark:border-neutral-700">
        {String(count).padStart(2, "0")}
      </span>
      <span className="h-px w-10 bg-slate-200 dark:bg-neutral-800 sm:w-16" />
    </div>
  );
}
