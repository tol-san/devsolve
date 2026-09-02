import { Award, CheckCircle2, Coins, Megaphone } from "lucide-react";
import type { HacktivityActivity, Severity } from "@/lib/types/hacktivity/types";
import { formatDate } from "@/lib/format/datetime";
import { cn } from "@/lib/utils";

interface HacktivityItemProps {
  activity: HacktivityActivity;
}

const SEVERITY_COLOR: Record<Severity, string> = {
  CRITICAL: "text-red-600 dark:text-red-400",
  HIGH: "text-orange-600 dark:text-orange-400",
  MEDIUM: "text-amber-600 dark:text-amber-400",
  LOW: "text-blue-600 dark:text-blue-400",
  NONE: "text-muted-foreground",
};

const ICON = {
  REPORT_RESOLVED: {
    Glyph: CheckCircle2,
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  },
  RECOGNITION_AWARDED: {
    Glyph: Award,
    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  },
  BOUNTY_AWARDED: {
    Glyph: Coins,
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  },
  REPORT_DISCLOSED: {
    Glyph: Megaphone,
    tone: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
  },
} as const;

function titleCase(severity: Severity): string {
  return severity.charAt(0) + severity.slice(1).toLowerCase();
}

/** The program, named only when the row carries one. */
function Target({ activity }: { activity: HacktivityActivity }) {
  const name = activity.program?.name || activity.organization?.name;
  if (!name) return null;

  return (
    <>
      {" for "}
      <span className="font-bold text-foreground">{name}</span>
    </>
  );
}

/**
 * What happened, in the words of the event.
 *
 * The researcher is the subject of the page they are on, so the sentence
 * starts with the action rather than repeating their handle on every row.
 * A report is named only when `title` survived the disclosure check in
 * `toActivity` — an undisclosed finding is described, never titled.
 */
function Description({ activity }: { activity: HacktivityActivity }) {
  const severity = activity.severity;
  const severityText = severity && severity !== "NONE" && (
    <span className={cn("font-semibold", SEVERITY_COLOR[severity])}>
      {titleCase(severity)}
    </span>
  );

  switch (activity.eventType) {
    case "RECOGNITION_AWARDED": {
      const title =
        typeof activity.recognition === "string"
          ? activity.recognition
          : activity.recognition?.title;
      const desc =
        typeof activity.recognition === "object"
          ? activity.recognition?.description
          : undefined;

      return (
        <div className="space-y-1">
          <p className="text-sm text-foreground">
            Was recognised
            <Target activity={activity} />
            {title && (
              <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                {title}
              </span>
            )}
          </p>
          {desc && (
            <p className="text-xs text-muted-foreground italic">
              &ldquo;{desc}&rdquo;
            </p>
          )}
        </div>
      );
    }

    case "BOUNTY_AWARDED":
      return (
        <p className="text-sm text-foreground">
          Earned a bounty {severityText && <>for a {severityText} finding</>}
          <Target activity={activity} />
        </p>
      );

    case "REPORT_DISCLOSED":
      return (
        <p className="text-sm text-foreground">
          Disclosed {severityText ? <>a {severityText}</> : "a"} finding
          <Target activity={activity} />
          {activity.title && (
            <span className="mt-0.5 block font-medium text-muted-foreground">
              {activity.title}
            </span>
          )}
        </p>
      );

    case "REPORT_RESOLVED":
    default:
      return (
        <p className="text-sm text-foreground">
          Resolved {severityText ? <>a {severityText}</> : "a"} report
          <Target activity={activity} />
          {activity.title && (
            <span className="mt-0.5 block font-medium text-muted-foreground">
              {activity.title}
            </span>
          )}
        </p>
      );
  }
}

/** Money when it was paid, points when that is what the program gives. */
function RewardBadge({ reward }: { reward: HacktivityActivity["reward"] }) {
  if (reward.kind === "cash") {
    return (
      <span className="shrink-0 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
        {reward.currency === "USD" ? "$" : `${reward.currency} `}
        {reward.amount.toLocaleString()}
      </span>
    );
  }

  if (reward.kind === "points") {
    return (
      <span className="shrink-0 text-sm font-semibold text-muted-foreground">
        {reward.points.toLocaleString()} pts
      </span>
    );
  }

  return null;
}

export default function HacktivityItem({ activity }: HacktivityItemProps) {
  const { Glyph, tone } =
    ICON[activity.eventType as keyof typeof ICON] ?? ICON.REPORT_RESOLVED;

  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-4 last:border-0">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            tone,
          )}
        >
          <Glyph size={16} />
        </div>
        <div className="min-w-0">
          <Description activity={activity} />
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            {formatDate(activity.createdAt)}
            {activity.weakness?.cweId && (
              <span className="ml-2 font-mono">{activity.weakness.cweId}</span>
            )}
          </p>
        </div>
      </div>

      <RewardBadge reward={activity.reward} />
    </div>
  );
}
