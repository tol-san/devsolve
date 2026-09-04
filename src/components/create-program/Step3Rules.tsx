"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Step3RulesProps {
  rulesOfEngagement: string;
  setRulesOfEngagement: (val: string) => void;
  excludedTypes: string[];
  setExcludedTypes: (types: string[]) => void;
  newExcludedInput: string;
  setNewExcludedInput: (val: string) => void;
  handleAddExcludedType: () => void;
  pocRequirements: string;
  setPocRequirements: (val: string) => void;
}

export function Step3Rules({
  rulesOfEngagement,
  setRulesOfEngagement,
  excludedTypes,
  setExcludedTypes,
  newExcludedInput,
  setNewExcludedInput,
  handleAddExcludedType,
  pocRequirements,
  setPocRequirements,
}: Step3RulesProps) {
  const handleBulletKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    value: string,
    onChange: (val: string) => void
  ) => {
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;

    if (e.key === "Enter") {
      e.preventDefault();
      const bullet = "\n• ";
      const newValue = value.substring(0, start) + bullet + value.substring(end);
      onChange(newValue);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + bullet.length;
      }, 0);
    } else if (e.key === "Backspace") {
      if (start === end && start >= 2 && value.substring(start - 2, start) === "• ") {
        e.preventDefault();
        const newValue = value.substring(0, start - 2) + value.substring(end);
        onChange(newValue);

        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start - 2;
        }, 0);
      }
    }
  };

  const handleBulletChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    onChange: (val: string) => void
  ) => {
    const val = e.target.value;
    if (!val) {
      onChange("• ");
      return;
    }
    const lines = val.split("\n");
    const formatted = lines.map((line) => {
      if (line.trim() === "") return line;
      if (line.startsWith("• ")) return line;
      if (line.startsWith("•")) return `• ${line.slice(1).trimStart()}`;
      if (line.startsWith("- ")) return `• ${line.slice(2)}`;
      if (line.startsWith("-")) return `• ${line.slice(1).trimStart()}`;
      return `• ${line}`;
    });
    onChange(formatted.join("\n"));
  };

  const ensureBulletOnFocus = (
    value: string,
    onChange: (val: string) => void
  ) => {
    if (!value.trim()) {
      onChange("• ");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground">
        Rules & Exclusions
      </h2>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Rules of Engagement
        </label>
        <Textarea
          rows={5}
          value={rulesOfEngagement}
          onChange={(e) => handleBulletChange(e, setRulesOfEngagement)}
          onKeyDown={(e) => handleBulletKeyDown(e, rulesOfEngagement, setRulesOfEngagement)}
          onFocus={() => ensureBulletOnFocus(rulesOfEngagement, setRulesOfEngagement)}
          placeholder="• Enter rule..."
          className="rounded-xl border-border bg-card text-foreground text-base focus-visible:ring-blue-500 font-mono resize-none p-3.5"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Excluded Vulnerability Types ({excludedTypes.length})
        </label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="e.g. DDoS attacks, Spam, Self-XSS"
            value={newExcludedInput}
            onChange={(e) => setNewExcludedInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              (e.preventDefault(), handleAddExcludedType())
            }
            className="h-11 rounded-xl border-border bg-card text-foreground text-base focus-visible:ring-blue-500 flex-1"
          />
          <Button
            type="button"
            onClick={handleAddExcludedType}
            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm h-11 px-6 cursor-pointer dark:bg-amber-500 dark:hover:bg-amber-600"
          >
            Add
          </Button>
        </div>

        {excludedTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {excludedTypes.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted text-foreground rounded-lg text-xs font-semibold border border-border"
              >
                {item}
                <button
                  type="button"
                  onClick={() =>
                    setExcludedTypes(
                      excludedTypes.filter((_, i) => i !== idx),
                    )
                  }
                  className="hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Proof of Concept (PoC) Requirements
        </label>
        <Textarea
          rows={4}
          value={pocRequirements}
          onChange={(e) => handleBulletChange(e, setPocRequirements)}
          onKeyDown={(e) => handleBulletKeyDown(e, pocRequirements, setPocRequirements)}
          onFocus={() => ensureBulletOnFocus(pocRequirements, setPocRequirements)}
          placeholder="• Enter PoC requirement..."
          className="rounded-xl border-border bg-card text-foreground text-base focus-visible:ring-blue-500 font-mono resize-none p-3.5"
        />
      </div>
    </div>
  );
}
