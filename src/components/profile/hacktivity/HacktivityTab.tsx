import type { HacktivityActivity } from "@/lib/types/hacktivity/types";
import HacktivityItem from "./HacktivityItem";

interface HacktivityTabProps {
  activities: HacktivityActivity[];
}

export default function HacktivityTab({ activities }: HacktivityTabProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm font-medium text-muted-foreground">
        No activity yet. Resolved reports, disclosures, bounties and
        recognitions show up here.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card px-5 shadow-2xs">
      {activities.map((activity) => (
        <HacktivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
