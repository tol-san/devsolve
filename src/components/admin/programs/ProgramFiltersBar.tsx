import React from "react";
import { ArrowUpDown, Filter, LayoutGrid, Table as TableIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ActiveFilters,
  FilterBar,
  FilterControls,
  FilterRow,
  FilterSearch,
  FilterSelect,
  type ActiveFilter,
} from "@/components/ui/filter-bar";
import {
  ProgramSubmissionState,
  ProgramState,
} from "@/lib/types/admin/programAdminTypes";
import { cn } from "@/lib/utils";

interface ProgramFiltersBarProps {
  submissionStateFilter: ProgramSubmissionState | "ALL";
  onSubmissionStateChange: (state: ProgramSubmissionState | "ALL") => void;
  stateFilter: ProgramState | "ALL";
  onStateChange: (state: ProgramState | "ALL") => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  sort?: string;
  onSortChange?: (sort: string) => void;
  viewMode?: "grid" | "table";
  onViewModeChange?: (mode: "grid" | "table") => void;
  counts: {
    all: number;
    pendingReview: number;
    approved: number;
    rejected: number;
  };
}

const REVIEW_TABS: {
  key: ProgramSubmissionState | "ALL";
  label: string;
  countKey: keyof ProgramFiltersBarProps["counts"];
}[] = [
  { key: "ALL", label: "All Programs", countKey: "all" },
  { key: "PENDING_REVIEW", label: "Pending Review", countKey: "pendingReview" },
  { key: "APPROVED", label: "Approved", countKey: "approved" },
  { key: "REJECTED", label: "Rejected", countKey: "rejected" },
];

const LIFECYCLE_LABELS: Record<string, string> = {
  ALL: "Any state",
  DRAFT: "Draft",
  ACTIVE: "Active",
  PAUSED: "Paused",
  CLOSED: "Closed",
};

const SORT_LABELS: Record<string, string> = {
  "updatedAt,DESC": "Recently updated",
  "createdAt,DESC": "Newest created",
  "createdAt,ASC": "Oldest created",
  "name,ASC": "Name A-Z",
};

export const ProgramFiltersBar: React.FC<ProgramFiltersBarProps> = ({
  submissionStateFilter,
  onSubmissionStateChange,
  stateFilter,
  onStateChange,
  searchQuery,
  onSearchQueryChange,
  sort = "updatedAt,DESC",
  onSortChange,
  viewMode = "grid",
  onViewModeChange,
  counts,
}) => {
  const activeFilters: ActiveFilter[] = [
    ...(stateFilter !== "ALL"
      ? [
          {
            key: "state",
            label: LIFECYCLE_LABELS[stateFilter],
            clear: () => onStateChange("ALL"),
          },
        ]
      : []),
    ...(searchQuery.trim()
      ? [
          {
            key: "search",
            label: `"${searchQuery.trim()}"`,
            clear: () => onSearchQueryChange(""),
          },
        ]
      : []),
  ];

  return (
    <FilterBar>
      <ToggleGroup
        multiple={false}
        value={[submissionStateFilter]}
        onValueChange={(values) => {
          const next = values[values.length - 1] as
            | ProgramSubmissionState
            | "ALL"
            | undefined;
          if (next) {
            onSubmissionStateChange(next);
          }
        }}
        spacing={1}
        aria-label="Review state"
        className="w-full min-w-0 overflow-x-auto rounded-xl bg-muted p-1"
      >
        {REVIEW_TABS.map((tab) => {
          const isActive = submissionStateFilter === tab.key;
          return (
            <ToggleGroupItem
              key={tab.key}
              value={tab.key}
              className="h-9 shrink-0 cursor-pointer rounded-lg px-3 text-sm font-semibold text-muted-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-2xs"
            >
              <span>{tab.label}</span>
              <Badge
                variant={isActive ? "default" : "secondary"}
                className="rounded-full tabular-nums"
              >
                {counts[tab.countKey] ?? 0}
              </Badge>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>

      <FilterRow>
        <FilterSearch
          value={searchQuery}
          onChange={onSearchQueryChange}
          label="Search programs"
          placeholder="Search programs..."
        />

        <FilterControls>
          <FilterSelect
            icon={Filter}
            label="State"
            items={LIFECYCLE_LABELS}
            value={stateFilter}
            onValueChange={(value) => onStateChange(value as ProgramState | "ALL")}
          />
          <FilterSelect
            icon={ArrowUpDown}
            label="Sort by"
            items={SORT_LABELS}
            value={sort}
            onValueChange={(value) => onSortChange?.(value)}
          />

          {onViewModeChange && (
            <div
              role="group"
              aria-label="View mode"
              className="flex items-center gap-0.5 rounded-xl border border-border bg-muted/60 p-1 shrink-0"
            >
              <button
                type="button"
                onClick={() => onViewModeChange("grid")}
                aria-pressed={viewMode === "grid"}
                aria-label="Cards view"
                title="Cards view"
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all cursor-pointer",
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="size-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("table")}
                aria-pressed={viewMode === "table"}
                aria-label="Table view"
                title="Table view"
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all cursor-pointer",
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <TableIcon className="size-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          )}
        </FilterControls>
      </FilterRow>

      <ActiveFilters
        filters={activeFilters}
        onClearAll={() => {
          onStateChange("ALL");
          onSearchQueryChange("");
        }}
      />
    </FilterBar>
  );
};
