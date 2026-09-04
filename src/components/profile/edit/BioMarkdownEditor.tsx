"use client";

import { useState, useRef } from "react";
import {
  Code2,
  Eye,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Quote,
  List,
  CheckSquare,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BioMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
}

export default function BioMarkdownEditor({
  value,
  onChange,
  error,
  maxLength = 500,
}: BioMarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSyntax = (before: string, after: string = "", defaultPlaceholder = "text") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selectedText = currentVal.substring(start, end);

    const replacement = selectedText
      ? `${before}${selectedText}${after}`
      : `${before}${defaultPlaceholder}${after}`;

    const nextValue = currentVal.substring(0, start) + replacement + currentVal.substring(end);

    if (nextValue.length <= maxLength) {
      onChange(nextValue);
      setTimeout(() => {
        textarea.focus();
        if (selectedText) {
          textarea.setSelectionRange(start + before.length, end + before.length);
        } else {
          textarea.setSelectionRange(
            start + before.length,
            start + before.length + defaultPlaceholder.length
          );
        }
      }, 0);
    }
  };

  const charPercentage = Math.min(100, Math.round((value.length / maxLength) * 100));

  return (
    <section id="section-bio" className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Code2 className="size-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Research Biography
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Introduce yourself, your security research focus, methodologies, or tech stack. Markdown supported.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-mono font-medium">
            <span
              className={cn(
                "font-bold",
                value.length > maxLength * 0.9
                  ? "text-rose-500"
                  : value.length > maxLength * 0.7
                  ? "text-amber-500"
                  : "text-foreground"
              )}
            >
              {value.length}
            </span>
            <span className="text-muted-foreground">/{maxLength}</span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-xs transition focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
          <div className="flex items-center gap-1 rounded-xl bg-muted/80 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "write"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Code2 className="size-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "preview"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye className="size-3.5" />
              <span>Live Preview</span>
            </button>
          </div>

          {activeTab === "write" && (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertSyntax("**", "**", "bold text")}
                title="Bold (Ctrl+B)"
                className="size-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Bold className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertSyntax("_", "_", "italic text")}
                title="Italic (Ctrl+I)"
                className="size-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Italic className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertSyntax("`", "`", "code")}
                title="Inline Code"
                className="size-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Code className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertSyntax("[", "](https://example.com)", "link title")}
                title="Insert Link"
                className="size-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <LinkIcon className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertSyntax("> ", "", "quote")}
                title="Blockquote"
                className="size-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Quote className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertSyntax("- ", "", "list item")}
                title="Bullet List"
                className="size-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <List className="size-3.5" />
              </Button>
            </div>
          )}
        </div>

        <div className="p-4 bg-background">
          {activeTab === "write" ? (
            <textarea
              ref={textareaRef}
              id="edit-bio"
              value={value}
              maxLength={maxLength}
              rows={8}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Write something about your security skills, accomplishments, research interests, or background..."
              className={cn(
                "min-h-[200px] w-full resize-y bg-transparent font-mono text-base text-foreground outline-none placeholder:text-muted-foreground/60 placeholder:font-sans",
                error && "text-rose-500"
              )}
            />
          ) : (
            <div className="min-h-[200px] w-full prose prose-base prose-slate dark:prose-invert max-w-none text-foreground">
              {value.trim() ? (
                <ReactMarkdown>{value}</ReactMarkdown>
              ) : (
                <div className="flex min-h-[180px] flex-col items-center justify-center text-center text-muted-foreground">
                  <Eye className="size-8 opacity-30 mb-2" />
                  <p className="text-sm italic">Nothing to preview yet.</p>
                  <p className="text-xs text-muted-foreground/70">
                    Switch to Write mode and enter your biography.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border bg-muted/30 px-3.5 sm:px-4 py-2 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="whitespace-nowrap shrink-0 font-medium text-muted-foreground/80">
              Styling tips:
            </span>
            <code className="rounded-md bg-muted/80 px-1.5 py-0.5 text-[11px] font-mono text-foreground font-semibold shrink-0">
              **bold**
            </code>
            <code className="rounded-md bg-muted/80 px-1.5 py-0.5 text-[11px] font-mono text-foreground font-semibold shrink-0">
              _italic_
            </code>
            <code className="rounded-md bg-muted/80 px-1.5 py-0.5 text-[11px] font-mono text-foreground font-semibold shrink-0">
              `code`
            </code>
            <code className="rounded-md bg-muted/80 px-1.5 py-0.5 text-[11px] font-mono text-foreground font-semibold shrink-0">
              [title](url)
            </code>
          </div>
          <span className="text-muted-foreground/70 text-[11px] font-mono whitespace-nowrap shrink-0 self-end sm:self-auto">
            {maxLength - value.length} characters left
          </span>
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
