"use client";

import { useState } from "react";
import {
  Globe,
  Share2,
  ExternalLink,
  CheckCircle2,
  Link2,
} from "lucide-react";
import { SiGithub, SiX } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SocialLinksForm } from "@/lib/types/profile/types";

interface SocialLinksSectionProps {
  socialLinks: SocialLinksForm;
  onChange: (socialLinks: SocialLinksForm) => void;
  error?: string;
}

const inputClass =
  "h-11 rounded-xl border-border bg-background text-base text-foreground shadow-2xs transition focus:border-primary focus:ring-2 focus:ring-primary/20";

function normalizeUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function SocialLinksSection({
  socialLinks,
  onChange,
  error,
}: SocialLinksSectionProps) {
  const updateField = (key: keyof SocialLinksForm, val: string) => {
    onChange({
      ...socialLinks,
      [key]: val,
    });
  };

  const openTest = (url: string) => {
    const target = normalizeUrl(url);
    if (target) {
      window.open(target, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section id="section-social" className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Share2 className="size-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Social Profiles & Web
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your developer profiles, repositories, social handles, and personal websites.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* GitHub */}
        <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4 transition-colors hover:border-border/80">
          <div className="flex items-center justify-between">
            <label
              htmlFor="social-github"
              className="flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              <SiGithub className="size-4" />
              <span>GitHub</span>
            </label>
            {socialLinks.github && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => openTest(socialLinks.github)}
                title="Test GitHub Link"
                className="h-7 gap-1 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="size-3" />
                <span>Test</span>
              </Button>
            )}
          </div>
          <div className="relative">
            <Input
              id="social-github"
              value={socialLinks.github}
              onChange={(e) => updateField("github", e.target.value)}
              placeholder="https://github.com/username"
              className={inputClass}
            />
          </div>
        </div>

        {/* X / Twitter */}
        <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4 transition-colors hover:border-border/80">
          <div className="flex items-center justify-between">
            <label
              htmlFor="social-twitter"
              className="flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              <SiX className="size-3.5" />
              <span>X (formerly Twitter)</span>
            </label>
            {socialLinks.twitter && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => openTest(socialLinks.twitter)}
                title="Test X Link"
                className="h-7 gap-1 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="size-3" />
                <span>Test</span>
              </Button>
            )}
          </div>
          <div className="relative">
            <Input
              id="social-twitter"
              value={socialLinks.twitter}
              onChange={(e) => updateField("twitter", e.target.value)}
              placeholder="https://x.com/username"
              className={inputClass}
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4 transition-colors hover:border-border/80">
          <div className="flex items-center justify-between">
            <label
              htmlFor="social-linkedin"
              className="flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              <FaLinkedin className="size-4 text-[#0A66C2]" />
              <span>LinkedIn</span>
            </label>
            {socialLinks.linkedin && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => openTest(socialLinks.linkedin)}
                title="Test LinkedIn Link"
                className="h-7 gap-1 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="size-3" />
                <span>Test</span>
              </Button>
            )}
          </div>
          <div className="relative">
            <Input
              id="social-linkedin"
              value={socialLinks.linkedin}
              onChange={(e) => updateField("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className={inputClass}
            />
          </div>
        </div>

        {/* Personal Website */}
        <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4 transition-colors hover:border-border/80">
          <div className="flex items-center justify-between">
            <label
              htmlFor="social-website"
              className="flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              <Globe className="size-4 text-emerald-500" />
              <span>Personal Website / Portfolio</span>
            </label>
            {socialLinks.website && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => openTest(socialLinks.website)}
                title="Test Website Link"
                className="h-7 gap-1 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="size-3" />
                <span>Test</span>
              </Button>
            )}
          </div>
          <div className="relative">
            <Input
              id="social-website"
              value={socialLinks.website}
              onChange={(e) => updateField("website", e.target.value)}
              placeholder="https://yourportfolio.dev"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </section>
  );
}
