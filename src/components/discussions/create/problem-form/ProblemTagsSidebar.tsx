"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Hash, Plus, Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  CARD_CLASS,
  CONTROL_CLASS,
  MAX_TAGS,
  SUGGESTED_TAGS,
} from "./types-and-constants";

interface ProblemTagsSidebarProps {
  tags: string[];
  tagDraft: string;
  tagDraftError: string | null;
  serverError?: string;
  submitting: boolean;
  onTagDraftChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

export function ProblemTagsSidebar({
  tags,
  tagDraft,
  tagDraftError,
  serverError,
  submitting,
  onTagDraftChange,
  onAddTag,
  onRemoveTag,
}: ProblemTagsSidebarProps) {
  const normalizedPendingTag = tagDraft.trim().replace(/^#+/, "");
  const pendingTagLength = normalizedPendingTag.length;

  const unaddedSuggestions = SUGGESTED_TAGS.filter(
    (st) => !tags.includes(st) && st !== normalizedPendingTag,
  ).slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
    >
      <Card className={CARD_CLASS} aria-labelledby="problem-tags-heading">
        <CardHeader className="p-5 pb-3.5 border-b border-border/70">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Tag className="size-4" />
              </div>
              <div>
                <h2
                  id="problem-tags-heading"
                  className="text-base font-bold tracking-tight text-foreground"
                >
                  Keywords & Tags
                </h2>
                <p className="text-xs text-muted-foreground">
                  Press Enter or comma to add
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="tabular-nums font-mono text-xs"
            >
              {tags.length}/{MAX_TAGS}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-4 space-y-3.5">
          <Field
            className="gap-1.5"
            data-invalid={Boolean(serverError) || Boolean(tagDraftError)}
            data-disabled={submitting || tags.length >= MAX_TAGS || undefined}
          >
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <FieldLabel
                htmlFor="problem-tags"
                className="text-xs font-semibold text-foreground inline-flex items-center gap-1"
              >
                <Hash className="size-3 text-muted-foreground" />
                Add tag
              </FieldLabel>
              <span className="text-[11px] text-muted-foreground">
                Max {MAX_TAGS} tags
              </span>
            </div>

            <div className="flex gap-2">
              <Input
                id="problem-tags"
                value={tagDraft}
                maxLength={51}
                placeholder="e.g. oauth, auth, jwt"
                aria-invalid={Boolean(serverError) || Boolean(tagDraftError)}
                aria-describedby={
                  serverError || tagDraftError
                    ? "problem-tags-error"
                    : "problem-tags-help"
                }
                disabled={submitting || tags.length >= MAX_TAGS}
                className={cn(CONTROL_CLASS, "flex-1")}
                onChange={(event) => onTagDraftChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    onAddTag();
                  }
                  if (
                    event.key === "Backspace" &&
                    !tagDraft &&
                    tags.length
                  ) {
                    onRemoveTag(tags[tags.length - 1]);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={
                  submitting ||
                  tags.length >= MAX_TAGS ||
                  pendingTagLength === 0
                }
                onClick={onAddTag}
                className="h-11 px-3.5 rounded-xl cursor-pointer text-xs font-semibold"
              >
                <Plus className="size-3.5 mr-1" aria-hidden="true" />
                Add
              </Button>
            </div>

            <FieldDescription id="problem-tags-help">
              Leading # is stripped automatically. Max 50 characters per tag.
            </FieldDescription>

            <FieldError id="problem-tags-error">
              {tagDraftError ?? serverError}
            </FieldError>

            {/* Quick Suggestions */}
            {unaddedSuggestions.length > 0 && tags.length < MAX_TAGS && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-muted-foreground mr-0.5">
                  Suggested:
                </span>
                {unaddedSuggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      onTagDraftChange(sug);
                    }}
                    className="inline-flex items-center gap-0.5 rounded-md border border-border/60 bg-muted/30 px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors cursor-pointer"
                  >
                    #{sug}
                  </button>
                ))}
              </div>
            )}

            {/* Active Tag Pills */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border/50">
                <AnimatePresence initial={false}>
                  {tags.map((tag) => (
                    <motion.div
                      key={tag}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Badge
                        variant="secondary"
                        className="gap-1 py-1 pl-2 pr-1 rounded-lg border border-border/70 text-xs font-medium bg-secondary/70 hover:bg-secondary transition-colors"
                      >
                        <span className="text-muted-foreground font-mono">#</span>
                        <span className="text-foreground">{tag}</span>
                        <button
                          type="button"
                          aria-label={`Remove tag ${tag}`}
                          disabled={submitting}
                          onClick={() => onRemoveTag(tag)}
                          className="rounded-md p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                        >
                          <X className="size-3" aria-hidden="true" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Field>
        </CardContent>
      </Card>
    </motion.div>
  );
}
