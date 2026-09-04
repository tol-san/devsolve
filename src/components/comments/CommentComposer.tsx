"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { findProfanity } from "@/lib/moderation/profanity";
import { cn } from "@/lib/utils";

const MAX_LENGTH = 5000;

export function CommentComposer({
  value,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  placeholder = "Add a comment…",
  submitLabel = "Comment",
  autoFocus,
  compact,
}: {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  placeholder?: string;
  submitLabel?: string;
  autoFocus?: boolean;
  compact?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  }, [value]);

  const trimmed = value.trim();
  const remaining = MAX_LENGTH - value.length;

  const flagged = useMemo(() => findProfanity(value), [value]);

  const canSubmit = trimmed.length > 0 && !isSubmitting && flagged.length === 0;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && canSubmit) {
      event.preventDefault();
      onSubmit();
    }
    if (event.key === "Escape" && onCancel) {
      event.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card transition-colors",
        focused ? "border-blue-600 ring-2 ring-blue-600/15" : "border-border",
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value.slice(0, MAX_LENGTH))}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={compact ? 2 : 3}
        autoFocus={autoFocus}
        maxLength={MAX_LENGTH}
        placeholder={placeholder}
        aria-label={placeholder}
        className="block w-full resize-none bg-transparent px-4 pt-3 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
      />

      {flagged.length > 0 && (
        <p
          role="status"
          className="flex items-start gap-2 px-4 pb-1 pt-1 text-sm font-medium text-rose-600 dark:text-rose-400"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Please reword this — {flagged.slice(0, 3).join(", ")}
            {flagged.length > 3 ? " and others" : ""}{" "}
            {flagged.length === 1 ? "is" : "are"} not allowed here.
          </span>
        </p>
      )}

      <div className="flex items-center justify-between gap-3 px-3 pb-3">
        <span
          className={cn(
            "pl-1 text-sm tabular-nums",
            remaining < 100 ? "text-rose-600" : "text-muted-foreground",
          )}
        >
          {remaining < 500 ? `${remaining} left` : "Ctrl + Enter to post"}
        </span>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-9 rounded-xl px-3 text-sm font-semibold"
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="h-9 cursor-pointer rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {isSubmitting ? (
              <Loader2
                data-icon="inline-start"
                className="animate-spin motion-reduce:animate-none"
              />
            ) : (
              <Send data-icon="inline-start" />
            )}
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
