"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Link2, Trash2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validateIconFile } from "@/lib/validations/category";
import { cn } from "@/lib/utils";

export type IconIntent =
  | { kind: "keep" }
  | { kind: "file"; file: File }
  | { kind: "url"; url: string }
  | { kind: "remove" };

interface CategoryIconFieldProps {
  currentUrl?: string;
  value: IconIntent;
  onChange: (intent: IconIntent) => void;
}

export function CategoryIconField({
  currentUrl,
  value,
  onChange,
}: CategoryIconFieldProps) {
  const [mode, setMode] = useState<"upload" | "link">("upload");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkDraft, setLinkDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const objectUrl = useMemo(
    () => (value.kind === "file" ? URL.createObjectURL(value.file) : null),
    [value],
  );

  useEffect(() => {
    if (!objectUrl) return;
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  const accept = (file: File) => {
    const reason = validateIconFile(file);
    if (reason) {
      setError(reason);
      return;
    }
    setError(null);
    onChange({ kind: "file", file });
  };

  const preview =
    value.kind === "file"
      ? objectUrl
      : value.kind === "url"
        ? value.url
        : value.kind === "keep"
          ? (currentUrl ?? null)
          : null;

  const clear = () => {
    setLinkDraft("");
    setError(null);
    onChange(currentUrl ? { kind: "remove" } : { kind: "keep" });
  };

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-foreground">
          Icon
        </span>

        {!preview && (
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-0.5">
            {(["upload", "link"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-colors cursor-pointer",
                  mode === option
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {preview ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
          <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt=""
              className="size-full object-contain p-1.5"
              onError={() => setError("That image could not be loaded")}
            />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              {value.kind === "file"
                ? "New upload"
                : value.kind === "url"
                  ? "From URL"
                  : "Current icon"}
            </p>
            <p className="text-xs text-muted-foreground">
              {value.kind === "keep" ? "Unchanged" : "Applied when you save"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
              aria-label="Replace icon"
            >
              <Upload className="size-4" />
            </button>
            <button
              type="button"
              onClick={clear}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
              aria-label="Remove icon"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ) : mode === "link" ? (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={linkDraft}
              onChange={(event) => setLinkDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (linkDraft.trim())
                    onChange({ kind: "url", url: linkDraft.trim() });
                }
              }}
              placeholder="https://…/icon.svg"
              className="h-11 rounded-xl border-border bg-background text-foreground pl-9 text-sm focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <Button
            type="button"
            onClick={() =>
              linkDraft.trim() && onChange({ kind: "url", url: linkDraft.trim() })
            }
            className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            Use
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file) accept(file);
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border-2 border-dashed p-4 text-left transition-colors cursor-pointer",
            dragging
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/60",
          )}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-primary shadow-2xs">
            <ImagePlus className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-foreground">
              Drop an icon or click to browse
            </span>
            <span className="block text-xs text-muted-foreground">
              PNG, JPG, WebP or SVG · up to 1MB
            </span>
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) accept(file);
          event.target.value = "";
        }}
      />

      {error && <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
