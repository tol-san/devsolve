"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { RefMDEditor } from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full animate-pulse items-center justify-center rounded-xl border border-border bg-muted text-base font-medium text-muted-foreground motion-reduce:animate-none dark:border-neutral-700 dark:bg-neutral-900">
      Loading Markdown Editor...
    </div>
  ),
});

interface MarkdownEditorProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value?: string) => void;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  inputRef?: (element: HTMLTextAreaElement | null) => void;
  placeholder?: string;
  height?: number;
  maxLength?: number;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  ariaDescribedBy?: string;
}

export function MarkdownEditor({
  id,
  name,
  value,
  onChange,
  onBlur,
  inputRef,
  placeholder = "Describe the root cause, affected parameters, and overall architecture vulnerability...",
  height = 480,
  maxLength,
  error = false,
  disabled = false,
  required = false,
  ariaDescribedBy,
}: MarkdownEditorProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div
      data-color-mode={
        resolvedTheme === "dark"
          ? "dark"
          : resolvedTheme === "light"
            ? "light"
            : "auto"
      }
      className={`w-full rounded-xl border transition-colors overflow-hidden ${
        error
          ? "border-red-500 ring-1 ring-red-500"
          : "border-border dark:border-neutral-700 focus-within:ring-2 focus-within:ring-blue-600"
      }`}
    >
      <MDEditor
        ref={(editor: RefMDEditor | null) =>
          inputRef?.(editor?.textarea ?? null)
        }
        value={value}
        onChange={onChange}
        height={height}
        preview="edit"
        textareaProps={{
          id,
          name,
          disabled,
          required,
          maxLength,
          onBlur,
          "aria-invalid": error,
          "aria-describedby": ariaDescribedBy,
          placeholder,
          style: {
            fontSize: "18px",
            lineHeight: "1.7",
          },
        }}
        className="!text-lg [&_textarea]:!text-[18px] [&_textarea]:!leading-relaxed [&_.w-md-editor-text-input]:!text-[18px] [&_.w-md-editor-text-input]:!leading-relaxed [&_.w-md-editor-text-pre]:!text-[18px] [&_.w-md-editor-text-pre]:!leading-relaxed [&_.w-md-editor-text-pre_code]:!text-[18px] [&_.wmde-markdown]:!text-[17px] [&_.wmde-markdown]:!leading-relaxed"
      />
    </div>
  );
}
