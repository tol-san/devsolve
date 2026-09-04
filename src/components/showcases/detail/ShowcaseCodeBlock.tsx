"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import { Check, Code2, Copy, Moon, Sun, Terminal, WrapText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShowcaseCodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

function detectLanguage(code: string, fallback = "typescript"): string {
  if (/\b(export\s+(async\s+)?function|import\s+.*\s+from|interface\s+\w+|type\s+\w+\s*=|<ApiResponse|:\s*Promise<|:\s*(string|number|boolean|void))\b/.test(code)) {
    return "typescript";
  }
  if (/\b(const\s+\w+\s*=|let\s+\w+\s*=|function\s+\w+\(|console\.log)\b/.test(code)) {
    return "javascript";
  }
  if (/\b(def\s+\w+\(|elif\s+|__init__|import\s+\w+|from\s+\w+\s+import)\b/.test(code)) {
    return "python";
  }
  if (/^\s*(\{|\[)[\s\S]*("[\w-]+":)[\s\S]*(\}|\])\s*$/.test(code)) {
    return "json";
  }
  if (/\b(SELECT\s+.*\s+FROM|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)\b/i.test(code)) {
    return "sql";
  }
  if (/\b(curl\s+|npm\s+|pnpm\s+|yarn\s+|docker\s+|git\s+|sudo\s+)\b/.test(code)) {
    return "bash";
  }
  if (/^\s*<(!DOCTYPE|html|div|span|p|svg|table|template)\b/i.test(code)) {
    return "markup";
  }
  return fallback;
}

function formatLanguageName(lang: string): string {
  switch (lang.toLowerCase()) {
    case "typescript":
    case "ts":
      return "TypeScript";
    case "javascript":
    case "js":
      return "JavaScript";
    case "python":
    case "py":
      return "Python";
    case "json":
      return "JSON";
    case "sql":
      return "SQL";
    case "bash":
    case "sh":
    case "shell":
      return "Bash";
    case "markup":
    case "html":
    case "xml":
      return "HTML";
    case "css":
      return "CSS";
    default:
      return lang.charAt(0).toUpperCase() + lang.slice(1);
  }
}

export function ShowcaseCodeBlock({
  code,
  language: explicitLanguage,
  className,
}: ShowcaseCodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [themeOverride, setThemeOverride] = useState<"auto" | "light" | "dark">("auto");
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = useMemo(() => {
    if (themeOverride === "light") return false;
    if (themeOverride === "dark") return true;
    if (!mounted) return true; 
    return resolvedTheme === "dark";
  }, [themeOverride, mounted, resolvedTheme]);

  const { cleanCode, language } = useMemo(() => {
    if (!code) return { cleanCode: "", language: "typescript" };

    let normalized = code.replace(/\r\n/g, "\n").trim();

    const fenceMatch = normalized.match(/^```([a-zA-Z0-9_-]+)?\n([\s\S]*?)\n```$/);
    if (fenceMatch) {
      const extractedLang = fenceMatch[1]?.toLowerCase();
      normalized = fenceMatch[2].trim();
      return {
        cleanCode: normalized,
        language: explicitLanguage || extractedLang || detectLanguage(normalized),
      };
    }

    const detected = explicitLanguage || detectLanguage(normalized);
    return {
      cleanCode: normalized,
      language: detected,
    };
  }, [code, explicitLanguage]);

  const highlightedHtml = useMemo(() => {
    if (!cleanCode) return "";

    const grammar = Prism.languages[language] || Prism.languages.typescript || Prism.languages.javascript;
    try {
      return Prism.highlight(cleanCode, grammar, language);
    } catch {
      return cleanCode
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }
  }, [cleanCode, language]);

  const lines = useMemo(() => {
    if (!cleanCode) return [1];
    return cleanCode.split("\n");
  }, [cleanCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      toast.success("Code snippet copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code to clipboard");
    }
  };

  const handleToggleTheme = () => {
    setThemeOverride((prev) => {
      const currentlyDark = prev === "auto" ? (resolvedTheme === "dark") : prev === "dark";
      return currentlyDark ? "light" : "dark";
    });
  };

  if (!cleanCode) return null;

  return (
    <figure className={cn("space-y-1.5", className)}>
      <figcaption className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Code2 aria-hidden="true" className="size-3.5" />
        <span>Code Implementation</span>
      </figcaption>

      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border transition-colors duration-200",
          isDark
            ? "border-border/80 bg-[#0d1117] text-slate-100 shadow-md"
            : "border-border/90 bg-slate-50/95 text-slate-900 shadow-sm",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between border-b px-4 py-2.5 backdrop-blur-xs transition-colors duration-200",
            isDark
              ? "border-white/10 bg-white/[0.04]"
              : "border-border/60 bg-slate-200/50",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <div className="size-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50" />
              <div className="size-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50" />
              <div className="size-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50" />
            </div>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors",
                  isDark
                    ? "bg-white/10 text-slate-200"
                    : "bg-white text-slate-800 border border-border/60 shadow-2xs",
                )}
              >
                <Terminal className="size-3 text-primary" />
                {formatLanguageName(language)}
              </span>

              <span
                className={cn(
                  "text-[11px] font-mono",
                  isDark ? "text-slate-500" : "text-slate-500",
                )}
              >
                {lines.length} {lines.length === 1 ? "line" : "lines"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleTheme}
              title={isDark ? "Switch code view to Light mode" : "Switch code view to Dark mode"}
              aria-label={isDark ? "Switch code view to Light mode" : "Switch code view to Dark mode"}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer border",
                isDark
                  ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                  : "border-border/70 bg-white/90 text-slate-700 hover:bg-slate-100 shadow-2xs",
              )}
            >
              {isDark ? (
                <>
                  <Sun className="size-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="size-3.5 text-indigo-500" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setWrapLines(!wrapLines)}
              title={wrapLines ? "Disable word wrap" : "Enable word wrap"}
              aria-label={wrapLines ? "Disable word wrap" : "Enable word wrap"}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer border",
                wrapLines
                  ? "bg-primary/20 text-primary border-primary/30"
                  : isDark
                    ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    : "border-border/70 bg-white/90 text-slate-700 hover:bg-slate-100 shadow-2xs",
              )}
            >
              <WrapText className="size-3.5" />
              <span className="hidden md:inline">{wrapLines ? "Wrapped" : "Wrap"}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              title="Copy code to clipboard"
              aria-label="Copy code to clipboard"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                copied
                  ? isDark
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 font-semibold"
                    : "border-emerald-500/50 bg-emerald-50 text-emerald-700 font-semibold shadow-2xs"
                  : isDark
                    ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    : "border-border/70 bg-white/90 text-slate-700 hover:bg-slate-100 shadow-2xs",
              )}
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="relative flex text-[13px] sm:text-sm font-mono leading-relaxed overflow-x-auto">
          <div
            aria-hidden="true"
            className={cn(
              "select-none py-4 pl-3 pr-3 text-right font-mono border-r shrink-0 transition-colors duration-200",
              isDark
                ? "text-slate-500/60 border-white/10 bg-white/[0.02]"
                : "text-slate-400 border-border/60 bg-slate-100/50",
            )}
          >
            {lines.map((_, i) => (
              <div key={i} className="leading-relaxed">
                {i + 1}
              </div>
            ))}
          </div>

          <pre
            className={cn(
              "flex-1 p-4 font-mono leading-relaxed tab-size-2 transition-colors duration-200",
              isDark ? "text-slate-200" : "text-slate-800",
              wrapLines ? "whitespace-pre-wrap break-words" : "whitespace-pre overflow-x-auto",
            )}
          >
            <code
              className={cn(
                `language-${language}`,
                isDark ? "prism-dark" : "prism-light",
              )}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </pre>
        </div>
      </div>

      <style jsx global>{`
        /* ── Dark Mode Syntax Highlight (One Dark) ── */
        .prism-dark .token.keyword {
          color: #c678dd;
          font-weight: 600;
        }
        .prism-dark .token.function,
        .prism-dark .token.function-variable {
          color: #61afef;
        }
        .prism-dark .token.string,
        .prism-dark .token.template-string {
          color: #98c379;
        }
        .prism-dark .token.number,
        .prism-dark .token.boolean {
          color: #d19a66;
        }
        .prism-dark .token.comment {
          color: #7f848e;
          font-style: italic;
        }
        .prism-dark .token.operator {
          color: #e5c07b;
        }
        .prism-dark .token.punctuation {
          color: #abb2bf;
        }
        .prism-dark .token.builtin,
        .prism-dark .token.class-name {
          color: #56b6c2;
        }
        .prism-dark .token.property,
        .prism-dark .token.constant {
          color: #e06c75;
        }

        /* ── Light Mode Syntax Highlight (One Light) ── */
        .prism-light .token.keyword {
          color: #a626a4;
          font-weight: 600;
        }
        .prism-light .token.function,
        .prism-light .token.function-variable {
          color: #4078f2;
        }
        .prism-light .token.string,
        .prism-light .token.template-string {
          color: #50a14f;
        }
        .prism-light .token.number,
        .prism-light .token.boolean {
          color: #986801;
        }
        .prism-light .token.comment {
          color: #a0a1a7;
          font-style: italic;
        }
        .prism-light .token.operator {
          color: #0184bc;
        }
        .prism-light .token.punctuation {
          color: #383a42;
        }
        .prism-light .token.builtin,
        .prism-light .token.class-name {
          color: #c18401;
        }
        .prism-light .token.property,
        .prism-light .token.constant {
          color: #e45649;
        }
      `}</style>
    </figure>
  );
}
