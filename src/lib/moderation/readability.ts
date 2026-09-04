
const ALLOWED_TECH_TOKENS = new Set([
  "grpc",
  "graphql",
  "postgresql",
  "postgres",
  "oauth",
  "jwt",
  "uuid",
  "rxjs",
  "rtk",
  "redux",
  "zustand",
  "shadcn",
  "tailwindcss",
  "nextjs",
  "nuxtjs",
  "nestjs",
  "svelte",
  "nginx",
  "kafka",
  "redis",
  "docker",
  "kubernetes",
  "k8s",
  "devsolve",
  "html",
  "css",
  "json",
  "yaml",
  "http",
  "https",
  "rest",
  "sdk",
  "cli",
  "ide",
  "api",
  "gui",
  "wasm",
  "llvm",
  "fifo",
  "lifo",
  "crud",
  "ci/cd",
  "async",
  "await",
  "sync",
  "typedef",
  "struct",
  "typeof",
  "instanceof",
  "strengths",
  "catchphrase",
  "twelfths",
  "lengths",
  "knights",
  "rhythms",
  "rhythm",
  "glycyl",
  "syzygy",
]);

export interface ReadabilityIssue {
  type: "repeated_chars" | "consonant_cluster" | "low_vowel_ratio" | "excessive_symbols" | "unreadable_word";
  offendingSnippet: string;
  explanation: string;
}

function sanitizeTextForAnalysis(raw: string): string {
  return raw
    // Strip fenced code blocks: ```...```
    .replace(/```[\s\S]*?```/g, " ")
    // Strip inline code: `...`
    .replace(/`[^`]*`/g, " ")
    // Strip URLs: https://... or http://...
    .replace(/https?:\/\/[^\s]+/gi, " ")
    // Strip markdown image / link syntax: ![alt](url) or [text](url) -> keep text only
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1 ")
    // Normalize extra whitespace
    .replace(/\s+/g, " ")
    .trim();
}

function checkWordReadability(rawWord: string): ReadabilityIssue | null {
  const word = rawWord.trim();
  if (!word || word.length < 4) return null;

  const lower = word.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
  if (!lower) return null;

  if (ALLOWED_TECH_TOKENS.has(lower)) {
    return null;
  }

  const symbolMatches = word.match(/[^a-zA-Z0-9\-_'.,]/g);
  if (symbolMatches && word.length >= 6) {
    const symbolRatio = symbolMatches.length / word.length;
    if (symbolRatio >= 0.2) {
      return {
        type: "excessive_symbols",
        offendingSnippet: word,
        explanation: `Token "${word}" contains too many random symbols or punctuation.`,
      };
    }
  }

  const lettersOnly = lower.replace(/[^a-z]/g, "");
  if (lettersOnly.length < 5) return null;

  const consecutiveConsonantsMatch = lettersOnly.match(/[^aeiouy]{5,}/g);
  if (consecutiveConsonantsMatch) {
    const isUpperAcronym = /^[A-Z0-9_-]{1,6}$/.test(word);
    if (!isUpperAcronym) {
      return {
        type: "consonant_cluster",
        offendingSnippet: word,
        explanation: `Word "${word}" contains an abnormal sequence of consonants ("${consecutiveConsonantsMatch[0]}").`,
      };
    }
  }

  if (lettersOnly.length >= 7) {
    const vowelCount = (lettersOnly.match(/[aeiouy]/g) || []).length;
    const vowelRatio = vowelCount / lettersOnly.length;
    if (vowelRatio < 0.15) {
      const isUpperAcronym = /^[A-Z0-9_-]{1,7}$/.test(word);
      if (!isUpperAcronym) {
        return {
          type: "low_vowel_ratio",
          offendingSnippet: word,
          explanation: `Word "${word}" lacks normal word structure.`,
        };
      }
    }
  }

  return null;
}

export function findReadabilityIssues(value: string | null | undefined): ReadabilityIssue[] {
  if (!value || typeof value !== "string") return [];

  const issues: ReadabilityIssue[] = [];
  const sanitized = sanitizeTextForAnalysis(value);
  if (!sanitized) return [];

  const repeatMatch = sanitized.match(/(.)\1{4,}/);
  if (repeatMatch) {
    issues.push({
      type: "repeated_chars",
      offendingSnippet: repeatMatch[0],
      explanation: `Contains repeated characters ("${repeatMatch[0]}").`,
    });
  }

  const words = sanitized.split(/\s+/).filter(Boolean);

  for (const word of words) {
    const issue = checkWordReadability(word);
    if (issue) {
      issues.push(issue);
      if (issues.length >= 3) break;
    }
  }

  return issues;
}

export function isReadableText(value: unknown): boolean {
  if (typeof value !== "string") return true;
  if (!value.trim()) return true;

  const issues = findReadabilityIssues(value);
  return issues.length === 0;
}

export function readabilityMessage(label: string) {
  return {
    error: (issue: { input: unknown }) => {
      if (typeof issue.input !== "string") {
        return `${label} must be readable text.`;
      }
      const issues = findReadabilityIssues(issue.input);
      if (issues.length > 0) {
        const first = issues[0];
        if (first.type === "repeated_chars") {
          return `${label} contains too many repeated characters. Please provide meaningful text.`;
        }
        if (first.type === "excessive_symbols") {
          return `${label} contains unreadable symbols or keyboard mashing ("${first.offendingSnippet}"). Please check your text.`;
        }
        return `${label} appears to contain unreadable words or keyboard mashing ("${first.offendingSnippet}"). Please check your text.`;
      }
      return `${label} contains unreadable text. Please provide clear, readable wording.`;
    },
  };
}
