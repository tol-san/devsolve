"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
    >
      <Card className={CARD_CLASS} aria-labelledby="problem-tags-heading">
        <CardHeader className="border-b border-border/70 pb-4">
          <CardTitle>
            <h2
              id="problem-tags-heading"
              className="text-lg font-bold tracking-tight text-foreground"
            >
              Tags
            </h2>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            Add focused keywords. Press Enter, comma, or Add after each tag.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Field
            data-invalid={Boolean(serverError) || Boolean(tagDraftError)}
            data-disabled={submitting || tags.length >= MAX_TAGS || undefined}
          >
            <div className="flex items-center justify-between gap-3">
              <FieldLabel htmlFor="problem-tags" className="text-sm font-semibold text-foreground">
                Keywords
              </FieldLabel>
              <Badge variant="secondary" className="tabular-nums font-mono text-xs">
                {tags.length}/{MAX_TAGS}
              </Badge>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="problem-tags"
                value={tagDraft}
                maxLength={51}
                placeholder="e.g. oauth"
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
                className="h-12 w-full rounded-xl sm:w-auto cursor-pointer"
              >
                <Plus data-icon="inline-start" aria-hidden="true" />
                Add
              </Button>
            </div>
            <FieldDescription id="problem-tags-help">
              The leading # is optional and is removed before submission.
            </FieldDescription>
            <FieldError id="problem-tags-error">
              {tagDraftError ?? serverError}
            </FieldError>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                <AnimatePresence initial={false}>
                  {tags.map((tag) => (
                    <motion.div
                      key={tag}
                      layout
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Badge
                        variant="tag"
                        className="min-h-8 cursor-pointer px-3 hover:bg-tag/80"
                        render={
                          <button
                            type="button"
                            onClick={() => onRemoveTag(tag)}
                            aria-label={`Remove ${tag} tag`}
                            disabled={submitting}
                          />
                        }
                      >
                        {tag}
                        <X aria-hidden="true" className="ml-1 size-3.5" />
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
