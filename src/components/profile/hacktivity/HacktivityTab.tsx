import { HacktivityEntry } from "@/lib/types/profile/types";
import HacktivityItem from "./HacktivityItem";

interface HacktivityTabProps {
  entries: HacktivityEntry[];
}

export default function HacktivityTab({ entries }: HacktivityTabProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm font-medium text-muted-foreground">
        No activity yet. Resolved reports, badges, and rank changes will show up here.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card px-5 shadow-2xs">
      {entries.map((entry) => (
        <HacktivityItem key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
