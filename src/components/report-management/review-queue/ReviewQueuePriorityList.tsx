import Image from "next/image";
import Link from "next/link";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import { reportListGridClass } from "@/components/report-management/report-list-layout";
import type {
  PriorityReviewItem,
  ReviewQueueLaneFilter,
  ReviewSeverity,
} from "@/components/report-management/review-queue/types";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function getTypeBadgeClass(type: "Bounty" | "Response") {
  return type === "Bounty"
    ? "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
    : "border-violet-200 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20";
}

function getQueueBadgeClass(queue: Exclude<ReviewQueueLaneFilter, "All">) {
  if (queue === "Pending Intake") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
  }

  if (queue === "Under Review") {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
}

function getSeverityBadgeClass(severity: ReviewSeverity | null) {
  if (severity === "Critical") return "border-red-200 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
  if (severity === "High") return "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
  if (severity === "Medium") return "border-sky-200 bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20";
  if (severity === "Low") return "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
  return "border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20";
}

const badgeBaseClass =
  "h-7 min-w-[92px] justify-center rounded-full px-3 text-[12px] font-medium";

type ReviewQueuePriorityListProps = {
  activeQueue: ReviewQueueLaneFilter;
  onQueueChange: (queue: ReviewQueueLaneFilter) => void;
  severityFilter: "All" | ReviewSeverity;
  onSeverityFilterChange: (severity: "All" | ReviewSeverity) => void;
  sortBy: "priority" | "recent";
  onSortByChange: (value: "priority" | "recent") => void;
  queueCounts: {
    all: number;
    pending: number;
    review: number;
    ready: number;
  };
  items: PriorityReviewItem[];
};

export function ReviewQueuePriorityList({
  activeQueue,
  onQueueChange,
  severityFilter,
  onSeverityFilterChange,
  sortBy,
  onSortByChange,
  queueCounts,
  items,
}: ReviewQueuePriorityListProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
              Priority Submissions
            </h2>
            <span className="inline-flex h-6 items-center rounded-full border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground">
              {items.length} reports
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Focus analyst attention on reports waiting for the next moderation step.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <QueueSelect
            label="Sort"
            value={sortBy}
            displayValue={sortBy === "priority" ? "Priority" : "Most recent"}
            options={[
              { label: "Priority", value: "priority" },
              { label: "Most recent", value: "recent" },
            ]}
            onChange={(value) => onSortByChange(value as "priority" | "recent")}
            minWidthClassName="min-w-[156px]"
          />

          <QueueSelect
            label="Severity"
            value={severityFilter}
            displayValue={severityFilter === "All" ? "All severities" : severityFilter}
            options={[
              { label: "All severities", value: "All" },
              { label: "Critical", value: "Critical" },
              { label: "High", value: "High" },
              { label: "Medium", value: "Medium" },
              { label: "Low", value: "Low" },
            ]}
            onChange={(value) =>
              onSeverityFilterChange(value as "All" | ReviewSeverity)
            }
            icon={<SlidersHorizontal className="size-4 text-muted-foreground" />}
            minWidthClassName="min-w-[184px]"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <QueueTab
          active={activeQueue === "All"}
          label="All"
          count={queueCounts.all}
          onClick={() => onQueueChange("All")}
        />
        <QueueTab
          active={activeQueue === "Pending Intake"}
          label="Pending Intake"
          count={queueCounts.pending}
          onClick={() => onQueueChange("Pending Intake")}
        />
        <QueueTab
          active={activeQueue === "Under Review"}
          label="Under Review"
          count={queueCounts.review}
          onClick={() => onQueueChange("Under Review")}
        />
        <QueueTab
          active={activeQueue === "Approval Ready"}
          label="Approval Ready"
          count={queueCounts.ready}
          onClick={() => onQueueChange("Approval Ready")}
        />
      </div>

      <div className="overflow-hidden rounded-[14px] bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs">
        {items.map((item) => {
          return (
            <ReviewQueueReportRow
              key={item.id}
              item={item}
              isLast={items.indexOf(item) === items.length - 1}
            />
          );
        })}
      </div>
    </section>
  );
}

function ReviewQueueReportRow({
  item,
  isLast,
}: {
  item: PriorityReviewItem;
  isLast: boolean;
}) {
  const visibleAssets = item.assets.slice(0, 2);
  const hiddenAssetsCount = Math.max(0, item.assets.length - visibleAssets.length);

  return (
    <Link
      href={`/dashboard/report-management/${item.id}`}
      aria-label={`Open queue item ${item.title}`}
      className={cn(
        "group block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/30",
        !isLast && "border-b border-border"
      )}
      onKeyDown={(event) => {
        if (event.key === " ") {
          event.preventDefault();
          event.currentTarget.click();
        }
      }}
    >
      <div className="px-6 py-5 transition-colors duration-200 group-hover:bg-muted/50">
        <div className={cn(reportListGridClass, "hidden lg:grid")}>
          <div className="min-w-0">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted border border-border">
                {item.logoSrc ? (
                  <Image
                    src={item.logoSrc}
                    alt={`${item.title} logo`}
                    width={48}
                    height={48}
                    className="size-11 object-contain"
                  />
                ) : (
                  <span className="text-sm font-semibold text-foreground">
                    {item.authorInitials}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="space-y-1.5">
                  <h3 className="truncate text-[17px] font-semibold leading-6 text-foreground">
                    {item.title}
                  </h3>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
                    <span>{item.reportId}</span>
                    <span className="text-muted-foreground/60">&bull;</span>
                    <span className="truncate">{item.reporter}</span>
                    <span className="text-muted-foreground/60">&bull;</span>
                    <span>{item.submittedAt}</span>
                  </p>
                </div>

                <p className="line-clamp-1 text-[14px] leading-6 text-muted-foreground">
                  {item.status}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {visibleAssets.map((asset) => (
              <span
                key={asset}
                className="inline-flex max-w-[165px] truncate rounded-full border border-border bg-muted px-3 py-1 text-[12px] font-medium text-foreground"
                title={asset}
              >
                {asset}
              </span>
            ))}
            {hiddenAssetsCount > 0 ? (
              <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-[12px] font-medium text-muted-foreground">
                +{hiddenAssetsCount} more
              </span>
            ) : null}
          </div>

          <div className="flex items-center justify-center">
            <Badge
              variant="outline"
              className={cn(badgeBaseClass, getTypeBadgeClass(item.reportType))}
            >
              {item.reportType}
            </Badge>
          </div>

          <div className="flex items-center justify-center">
            <Badge
              variant="outline"
              className={cn(
                badgeBaseClass,
                getQueueBadgeClass(item.queue)
              )}
            >
              {item.queue}
            </Badge>
          </div>

          <div className="flex items-center justify-center">
            <Badge
              variant="outline"
              className={cn(
                badgeBaseClass,
                getSeverityBadgeClass(item.severity)
              )}
            >
              {item.severity || "Disputed"}
            </Badge>
          </div>
        </div>

        <div className="space-y-3 lg:hidden">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted border border-border">
              {item.logoSrc ? (
                <Image
                  src={item.logoSrc}
                  alt={`${item.title} logo`}
                  width={44}
                  height={44}
                  className="size-10 object-contain"
                />
              ) : (
                <span className="text-sm font-semibold text-foreground">
                  {item.authorInitials}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div className="space-y-1.5">
                <h3 className="truncate text-[16px] font-semibold leading-6 text-foreground">
                  {item.title}
                </h3>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
                  <span>{item.reportId}</span>
                  <span className="text-muted-foreground/60">&bull;</span>
                  <span className="truncate">{item.reporter}</span>
                  <span className="text-muted-foreground/60">&bull;</span>
                  <span>{item.submittedAt}</span>
                </p>
              </div>

              <p className="line-clamp-1 text-[13px] leading-6 text-muted-foreground">
                {item.status}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(badgeBaseClass, getTypeBadgeClass(item.reportType))}
                >
                  {item.reportType}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(badgeBaseClass, getQueueBadgeClass(item.queue))}
                >
                  {item.queue}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(badgeBaseClass, getSeverityBadgeClass(item.severity))}
                >
                  {item.severity || "Disputed"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {visibleAssets.map((asset) => (
                  <span
                    key={asset}
                    className="inline-flex max-w-[165px] truncate rounded-full border border-border bg-muted px-3 py-1 text-[12px] font-medium text-foreground"
                    title={asset}
                  >
                    {asset}
                  </span>
                ))}
                {hiddenAssetsCount > 0 ? (
                  <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-[12px] font-medium text-muted-foreground">
                    +{hiddenAssetsCount} more
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function QueueSelect({
  label,
  value,
  displayValue,
  options,
  onChange,
  icon,
  minWidthClassName,
}: {
  label: string;
  value: string;
  displayValue: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  minWidthClassName?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-10 items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 text-left text-sm text-foreground shadow-none outline-none transition-colors hover:bg-muted cursor-pointer",
          minWidthClassName
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {icon}
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="text-muted-foreground">{label}:</span>
            <span className="truncate font-medium text-foreground">{displayValue}</span>
          </span>
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="rounded-2xl border border-border bg-card text-card-foreground p-1.5 shadow-md"
      >
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="rounded-xl px-3 py-2.5 text-foreground data-[checked]:bg-blue-500/10 data-[checked]:text-blue-600 dark:data-[checked]:text-blue-400 focus:bg-muted"
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function QueueTab({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-all duration-200 cursor-pointer",
        active
          ? "border-blue-600 bg-blue-600 text-white dark:bg-blue-600 dark:text-white"
          : "border-border bg-card text-foreground hover:bg-muted"
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
          active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
        )}
      >
        {count}
      </span>
    </button>
  );
}
