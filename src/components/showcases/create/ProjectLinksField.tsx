"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { GitBranch, Globe, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { hostOf, type CreateShowcaseFormValues } from "@/lib/validations/showcase";

type LinkField = {
  name: "repoUrl" | "liveUrl" | "videoUrl";
  label: string;
  placeholder: string;
  icon: LucideIcon;
};

const LINKS: LinkField[] = [
  {
    name: "repoUrl",
    label: "GitHub repo",
    placeholder: "github.com/you/project",
    icon: GitBranch,
  },
  {
    name: "liveUrl",
    label: "Live demo",
    placeholder: "yourproject.com",
    icon: Globe,
  },
  {
    name: "videoUrl",
    label: "Video demo",
    placeholder: "youtube.com/watch?v=…",
    icon: Video,
  },
];

export function ProjectLinksField() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<CreateShowcaseFormValues>();

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {LINKS.map((link) => {
        const Icon = link.icon;
        const raw = watch(link.name) ?? "";
        const host = hostOf(raw);
        const error = errors[link.name]?.message;

        return (
          <div key={link.name} className="space-y-2">
            <label
              htmlFor={link.name}
              className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
            >
              <Icon className="size-4 text-muted-foreground" />
              {link.label}
            </label>

            <Input
              id={link.name}
              inputMode="url"
              placeholder={link.placeholder}
              {...register(link.name)}
              className="h-11 rounded-xl border-border bg-background text-base"
            />

            {error ? (
              <p className="text-sm font-medium text-destructive">{error}</p>
            ) : host ? (
              <span className="inline-flex max-w-full items-center gap-1 truncate rounded-lg bg-muted px-2 py-0.5 text-sm font-medium text-muted-foreground">
                {host}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
