import { ThanksEntry } from "@/lib/types/profile/types";
import ThanksCard from "./ThanksCard";

interface HallOfThanksTabProps {
  entries: ThanksEntry[];
}

export default function HallOfThanksTab({ entries }: HallOfThanksTabProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm font-medium text-muted-foreground">
        No thank-you notes yet. Programs you&apos;ve helped will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <ThanksCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
