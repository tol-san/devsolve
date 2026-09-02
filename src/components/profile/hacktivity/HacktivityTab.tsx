import { AlertCircle } from "lucide-react";

import type { HacktivityActivity } from "@/lib/types/hacktivity/types";
import { Button } from "@/components/ui/button";
import HacktivityItem from "./HacktivityItem";

interface HacktivityTabProps {
  activities: HacktivityActivity[];
  /** The feed could not be read. Distinct from having nothing to show. */
  isError?: boolean;
  onRetry?: () => void;
}

export default function HacktivityTab({
  activities,
  isError,
  onRetry,
}: HacktivityTabProps) {
  /* "No activity yet" is a claim about the researcher. When the request
     failed we know nothing about them, so we say that instead — reporting a
     server fault as an empty profile reads as though they have done nothing. */
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <AlertCircle className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">
          This activity could not be loaded. The problem is on our side, not
          with this profile.
        </p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="rounded-lg font-semibold"
          >
            Try again
          </Button>
        )}
      </div>
    );
  }

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
