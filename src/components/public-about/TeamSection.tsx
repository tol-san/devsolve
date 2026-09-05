"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Mail, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FaGithub, FaLinkedin, FaTelegram } from "react-icons/fa6";
import type { IconType } from "react-icons";
import SectionBackdrop, { useInk } from "@/components/landing/SectionBackdrop";
import { useT } from "@/lib/i18n/I18nProvider";
import {
  SUPERVISORS,
  STUDENT_DEVELOPERS,
} from "@/lib/types/about/mock-data";
import type { TeamMember } from "@/lib/types/about/type";
import { cn } from "@/lib/utils";

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

// Compact Member Card with full 6/7 portrait display, role pill, badge, and quote
export function MemberCard({
  member,
  badgeLabel,
  roleLabel,
  index = 0,
}: {
  member: TeamMember;
  badgeLabel: string;
  roleLabel: string;
  index?: number;
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
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.06, 0.4),
        ease: "easeOut",
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-card/90 border border-border/80 shadow-xs backdrop-blur-md transition-all duration-300 hover:shadow-md hover:border-blue-500/35"
    >
      {/* 6/7 aspect ratio shows full portrait without cutting off */}
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

      {/* Card Details */}
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
            {badgeLabel}
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

function GroupLabel({ label, count }: { label: string; count: number }) {
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

export function TeamSection() {
  const ref = useRef<HTMLElement>(null);
  const ink = useInk();
  const t = useT();

  const kicker = t("aboutPage.team.kicker") || "Core Team";
  const title = t("aboutPage.team.title") || "Meet the people behind Devsolve";
  const lede =
    t("aboutPage.team.lede") ||
    "Guided by senior security educators and built by dedicated student engineers passionate about cybersecurity and software resilience.";
  const developersLabel =
    t("aboutPage.team.developersLabel") || "Our Team";

  const getBadgeLabel = (badge: string) => {
    switch (badge) {
      case "Mentor":
        return t("aboutPage.team.roles.mentor") || "Mentor";
      case "Leader":
        return t("aboutPage.team.roles.leader") || "Leader";
      case "Sub Leader":
        return t("aboutPage.team.roles.subLeader") || "Sub Leader";
      case "Full Stack":
      case "Member":
      default:
        return t("aboutPage.team.roles.fullStack") || "Full Stack";
    }
  };

  const getSubRoleLabel = (subRole?: string, isMentor?: boolean) => {
    if (isMentor) {
      return t("aboutPage.team.roles.mentor") || "Mentor";
    }
    return subRole || "Full Stack";
  };

  return (
    <section
      id="team"
      ref={ref}
      className="relative overflow-hidden py-16 sm:py-24 border-t border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
    >
      <SectionBackdrop seed={5} gridSize={88} />

      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-12">
        {/* 1. Intro Block + Supervisors (3-column layout) */}
        <div className="grid grid-cols-1 items-start justify-items-center gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
          {/* Team Intro Block */}
          <div className="team-intro-block flex h-full w-full max-w-[340px] flex-col justify-center py-2 sm:py-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <Users className="size-3.5" />
                <span>{kicker}</span>
              </div>

              <h2
                className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl leading-[1.12]"
                style={{ color: ink }}
              >
                {title}
                <span className="text-[#2563EB] dark:text-blue-400">.</span>
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-neutral-400">
                {lede}
              </p>
            </div>
          </div>

          {/* Supervisor Cards */}
          {SUPERVISORS.map((mentor, i) => (
            <div key={mentor.name} className="w-full max-w-[340px]">
              <MemberCard
                member={mentor}
                index={i}
                badgeLabel={getBadgeLabel(mentor.badge ?? "Mentor")}
                roleLabel={getSubRoleLabel(mentor.subRole, true)}
              />
            </div>
          ))}
        </div>

        {/* 2. Group Divider & Developers Grid */}
        <div className="mt-16">
          <GroupLabel label={developersLabel} count={STUDENT_DEVELOPERS.length} />

          <div className="mt-8 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
            {STUDENT_DEVELOPERS.map((member, i) => (
              <div key={member.name} className="w-full max-w-[340px]">
                <MemberCard
                  member={member}
                  index={i}
                  badgeLabel={getBadgeLabel(member.badge ?? "Member")}
                  roleLabel={getSubRoleLabel(member.subRole, false)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TeamSection;
