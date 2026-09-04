"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Code2, Copy, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-xl bg-slate-950 border border-slate-800 animate-pulse flex items-center justify-center text-slate-400 text-sm font-medium">
      Loading Code Editor...
    </div>
  ),
});

interface PocCodeEditorProps {
  value: string;
  onChange: (value?: string) => void;
  height?: number;
  error?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { id: "http", label: "HTTP / Burp" },
  { id: "shell", label: "cURL / Bash" },
  { id: "python", label: "Python" },
  { id: "javascript", label: "JavaScript" },
  { id: "sql", label: "SQL" },
  { id: "json", label: "JSON" },
];

export function PocCodeEditor({
  value,
  onChange,
  height = 280,
  error = false,
}: PocCodeEditorProps) {
  const [language, setLanguage] = useState<string>("http");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div
      className={`w-full rounded-xl border transition-colors overflow-hidden bg-slate-950 ${
        error
          ? "border-red-500 ring-1 ring-red-500"
          : "border-slate-800 focus-within:ring-2 focus-within:ring-blue-600"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-300">Payload Language:</span>
          <Select value={language} onValueChange={(val) => val && setLanguage(val)}>
            <SelectTrigger className="h-7 border-slate-700 bg-slate-800 text-xs font-medium text-slate-200">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!value}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Payload</span>
            </>
          )}
        </button>
      </div>

      <MonacoEditor
        height={height}
        language={language}
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
      />
    </div>
  );
}
