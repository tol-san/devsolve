"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Code2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-56 w-full animate-pulse items-center justify-center bg-muted text-sm font-medium text-muted-foreground">
      Loading editor…
    </div>
  ),
});

export const CODE_LANGUAGES = [
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "tsx", label: "TSX / JSX" },
  { id: "java", label: "Java" },
  { id: "python", label: "Python" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "php", label: "PHP" },
  { id: "sql", label: "SQL" },
  { id: "shell", label: "Shell / Bash" },
  { id: "yaml", label: "YAML" },
  { id: "json", label: "JSON" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "dockerfile", label: "Dockerfile" },
  { id: "markdown", label: "Markdown" },
] as const;

const CODE_LANGUAGE_ITEMS = CODE_LANGUAGES.map((lang) => ({
  value: lang.id,
  label: lang.label,
}));

interface CodeSnippetFieldProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  onLanguageChange: (language: string) => void;
}

export function CodeSnippetField({
  value,
  language,
  onChange,
  onLanguageChange,
}: CodeSnippetFieldProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted px-3 py-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Code2 className="size-4 text-primary" />
          Code snippet
        </span>

        <Select
          items={CODE_LANGUAGE_ITEMS}
          value={language}
          onValueChange={(value) => value && onLanguageChange(value)}
        >
          <SelectTrigger className="h-8 w-40 rounded-lg border-border bg-background text-sm font-medium text-foreground">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectGroup>
              {CODE_LANGUAGES.map((lang) => (
                <SelectItem
                  key={lang.id}
                  value={lang.id}
                  className="cursor-pointer rounded-lg py-2 text-sm font-medium"
                >
                  {lang.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <MonacoEditor
        height={220}
        language={language}
        theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
        value={value}
        onChange={(next) => onChange(next ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          tabSize: 2,
          wordWrap: "on",
          renderLineHighlight: "none",
          scrollbar: { vertical: "auto", horizontal: "auto" },
        }}
      />
    </div>
  );
}
