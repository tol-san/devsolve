"use client";

import React, { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
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

export const CARD =
  "rounded-2xl bg-white shadow-[0_0_0_1px_rgba(30,41,59,0.08),0_2px_10px_rgba(30,41,59,0.05)] dark:bg-neutral-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_2px_10px_rgba(0,0,0,0.5)]";

export const CARD_HOVER =
  "transition-shadow hover:shadow-[0_0_0_1px_rgba(37,99,235,0.35),0_10px_28px_-14px_rgba(30,41,59,0.35)] dark:hover:shadow-[0_0_0_1px_rgba(96,165,250,0.45),0_10px_28px_-14px_rgba(0,0,0,0.7)]";

const ROLE_CHIP: Record<string, string> = {
  Mentor: "bg-primary text-primary-foreground",
  Leader: "bg-[#1E293B] text-white dark:bg-neutral-100 dark:text-neutral-900",
  "Sub Leader":
    "bg-slate-200 text-slate-700 dark:bg-neutral-700 dark:text-neutral-100",
  Member:
    "border border-slate-200 text-slate-500 dark:border-neutral-700 dark:text-neutral-400",
};

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

export function MemberCard({ member }: { member: TeamMember }) {
  const ink = useInk();
  const cardRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const socials = socialsFor(member);
  const chip = ROLE_CHIP[member.badge ?? "Member"] ?? ROLE_CHIP.Member;

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    gsap.to(cardRef.current, {
      rotateX,
      rotateY,
      scale: 1.02,
      transformPerspective: 1000,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.5,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`team-member-card group relative flex h-full w-full flex-col overflow-hidden rounded-3xl ${CARD} ${CARD_HOVER} will-change-transform`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="relative aspect-6/7 overflow-hidden bg-slate-100 dark:bg-neutral-800">
        <Image
          src={member.image}
          alt={member.name}
          quality={100}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />

        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-slate-950/75 to-transparent" />

        <span
          ref={badgeRef}
          className="absolute bottom-3.5 left-3.5 rounded-xl bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 backdrop-blur-md shadow-sm dark:bg-neutral-900/90 dark:text-neutral-200"
        >
          {member.subRole ?? "Full Stack"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <h4
            className="min-w-0 flex-1 truncate text-lg font-bold tracking-tight sm:text-xl"
            style={{ color: ink }}
          >
            {member.name}
          </h4>

          <span
            className={`shrink-0 rounded-xl px-2.5 py-1 text-xs font-bold ${chip}`}
          >
            {member.badge ?? "Member"}
          </span>
        </div>

        {member.quote && (
          <p className="mt-3 line-clamp-2 text-sm italic leading-relaxed text-slate-500 dark:text-neutral-400">
            &ldquo;{member.quote.replace(/^["'“”]+|["'“”]+$/g, "")}&rdquo;
          </p>
        )}

        {socials.length > 0 && (
          <div className="mt-auto flex items-center gap-2 border-t border-slate-200 pt-5 dark:border-neutral-800">
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
                  className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-[#2563EB] hover:text-white dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-blue-500 dark:hover:text-white"
                >
                  <Icon className="size-4" aria-hidden />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </article>
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
      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-bold tabular-nums text-slate-500 dark:bg-neutral-800 dark:text-neutral-400">
        {String(count).padStart(2, "0")}
      </span>
      <span className="h-px w-10 bg-slate-200 dark:bg-neutral-800 sm:w-16" />
    </div>
  );
}
