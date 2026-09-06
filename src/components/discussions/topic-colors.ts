// Utility to assign distinct, consistent vibrant dot colors to discussion topics & categories

const PRESET_TOPIC_COLORS: Record<string, string> = {
  backend: "#3b82f6", // blue
  frontend: "#06b6d4", // cyan
  database: "#8b5cf6", // violet
  api: "#10b981", // emerald
  security: "#ef4444", // red
  showcase: "#ec4899", // pink
  problems: "#f59e0b", // amber
  devops: "#f97316", // orange
  mobile: "#6366f1", // indigo
  general: "#14b8a6", // teal
  faq: "#eab308", // yellow
  feedback: "#a855f7", // purple
  announcements: "#f43f5e", // rose
  audit: "#0284c7", // light blue
  authentication: "#10b981", // emerald
  authorization: "#8b5cf6", // violet
  network: "#3b82f6", // blue
  crypto: "#e11d48", // crimson
};

const PALETTE = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f97316", // orange
  "#14b8a6", // teal
  "#6366f1", // indigo
  "#f43f5e", // rose
];

export function getTopicColor(topicName?: string | null): string {
  if (!topicName) return PALETTE[0];
  const normalized = topicName.toLowerCase().trim();

  for (const [key, color] of Object.entries(PRESET_TOPIC_COLORS)) {
    if (normalized.includes(key)) {
      return color;
    }
  }

  // Deterministic hash to pick from palette
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}
