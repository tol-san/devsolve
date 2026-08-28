"use client";

import React from "react";
import { Check, Loader2, TriangleAlert } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLazyGetProgramHandleAvailabilityQuery } from "@/lib/redux/services/program/programsApi";
import { cn } from "@/lib/utils";
import type { ProgramType, ProgramVisibility } from "./types";

interface Step1BasicInfoProps {
  programName: string;
  handle: string;
  description: string;
  programType: ProgramType;
  visibility: ProgramVisibility;
  policy: string;
  onNameChange: (val: string) => void;
  setHandle: (val: string) => void;
  setDescription: (val: string) => void;
  setProgramType: (val: ProgramType) => void;
  setVisibility: (val: ProgramVisibility) => void;
  setPolicy: (val: string) => void;
  formatHandle: (val: string) => string;
  /** Set when editing, so the program's own handle does not read as taken. */
  programId?: string;
}

export function Step1BasicInfo({
  programName,
  handle,
  description,
  programType,
  visibility,
  onNameChange,
  setHandle,
  setDescription,
  setProgramType,
  setVisibility,
  formatHandle,
  programId,
}: Step1BasicInfoProps) {
  /* One debounced call answers both questions the author has about a handle:
     whether it is well formed, and whether anyone already holds it. The
     upstream refuses malformed handles here too, returning the broken rule as
     `reason`, so there is nothing to pre-validate against a copy of the pattern
     that would drift the day the rule changes. */
  const [checkHandle, handleCheck] = useLazyGetProgramHandleAvailabilityQuery();
  const trimmedHandle = handle.trim();

  React.useEffect(() => {
    if (trimmedHandle.length < 2) return;

    const timer = setTimeout(() => {
      void checkHandle({
        handle: trimmedHandle,
        ...(programId ? { programId } : {}),
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [trimmedHandle, programId, checkHandle]);

  /* Only trust an answer that is about the handle currently in the box — a
     slower earlier request must not label what has since been typed. */
  const availability =
    handleCheck.data && handleCheck.originalArgs?.handle === trimmedHandle
      ? handleCheck.data
      : undefined;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground">
        Basic Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Program Name */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Program Name <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="ACME Web Application Security"
            value={programName}
            maxLength={255}
            onChange={(e) => onNameChange(e.target.value)}
            className="h-11 rounded-xl border-border bg-card text-foreground text-base focus-visible:ring-blue-500"
          />
        </div>

        {/* Handle */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Handle <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="acme-web-security"
              value={handle}
              maxLength={100}
              aria-describedby="program-handle-status"
              onChange={(e) => setHandle(formatHandle(e.target.value))}
              className={cn(
                "h-11 rounded-xl border-border bg-card pr-10 text-foreground text-base font-mono focus-visible:ring-blue-500",
                availability?.available === false &&
                  "border-rose-300 focus-visible:ring-rose-500 dark:border-rose-500/40",
              )}
            />

            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
              {handleCheck.isFetching ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground motion-reduce:animate-none" />
              ) : availability?.available === true ? (
                <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
              ) : availability?.available === false ? (
                <TriangleAlert className="size-4 text-rose-600 dark:text-rose-400" />
              ) : null}
            </span>
          </div>

          <p
            id="program-handle-status"
            aria-live="polite"
            className={cn(
              "text-sm",
              availability?.available === false
                ? "font-medium text-rose-600 dark:text-rose-400"
                : "text-muted-foreground",
            )}
          >
            {availability?.available === false
              ? /* The upstream's own words: the rule that refused it, rather
                   than our paraphrase of a pattern we would have to keep in
                   step with theirs. */
                (availability.reason ?? "That handle is not available.")
              : availability?.available === true
                ? `devsolve.app/programs/${availability.handle}`
                : "Lowercase letters, numbers and single hyphens."}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Description <span className="text-rose-500">*</span>
        </label>
        <Textarea
          rows={4}
          placeholder="Describe what hackers can test and what you're looking for..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-xl border-border bg-card text-foreground text-base focus-visible:ring-blue-500 resize-none p-3.5"
        />
      </div>

      {/* Program Type & Visibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Program Type */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Program Type
          </label>
          <Select
            value={programType}
            onValueChange={(val) => setProgramType(val as ProgramType)}
          >
            <SelectTrigger className="w-full h-11 rounded-xl border-border bg-card text-foreground text-sm font-medium">
              <SelectValue placeholder="Select Program Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BOUNTY">Bounty (Offers Cash Rewards)</SelectItem>
              <SelectItem value="RESPONSE">Response (Points / Reputation Only)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Visibility */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Visibility
          </label>
          <Select
            value={visibility}
            onValueChange={(val) => setVisibility(val as ProgramVisibility)}
          >
            <SelectTrigger className="w-full h-11 rounded-xl border-border bg-card text-foreground text-sm font-medium">
              <SelectValue placeholder="Select Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLIC">Public</SelectItem>
              <SelectItem value="PRIVATE">Private</SelectItem>
              <SelectItem value="INVITE_ONLY">Invite only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

    </div>
  );
}
