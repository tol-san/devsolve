import { Filter } from "bad-words";

const ALLOWED_WORDS = [
  "god",
  "hell",
  "damn",
  "damned",
  "crap",
  "bloody",
  "screw",
  "screwed",
  "screwing",
  "knob",
  "balls",
  "prick",
  "tit",
  "tits",
  "willy",
  "willies",
  "bugger",
  "sod",
  "piss",
  "pissed",
];

let filter: Filter | null = null;

function profanityFilter(): Filter {
  if (!filter) {
    filter = new Filter();
    filter.removeWords(...ALLOWED_WORDS);
  }
  return filter;
}

export function findProfanity(value: string | null | undefined): string[] {
  if (!value) return [];

  const instance = profanityFilter();
  const seen = new Set<string>();

  for (const word of value.split(/[^\p{L}\p{N}'*]+/u)) {
    if (!word) continue;
    if (instance.isProfane(word) && !seen.has(word.toLowerCase())) {
      seen.add(word.toLowerCase());
    }
  }

  return [...seen];
}

export function containsProfanity(value: string | null | undefined): boolean {
  return Boolean(value) && profanityFilter().isProfane(value as string);
}

export function isCleanText(value: unknown): boolean {
  return typeof value !== "string" || !containsProfanity(value);
}

export function profanityMessage(label: string) {
  return {
    error: (issue: { input: unknown }) => {
      const found =
        typeof issue.input === "string" ? findProfanity(issue.input) : [];
      const listed = found.slice(0, 3).join(", ");

      return listed
        ? `${label} contains language that is not allowed here: ${listed}. Please reword it.`
        : `${label} contains language that is not allowed here. Please reword it.`;
    },
  };
}
