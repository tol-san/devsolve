import React from "react";
import { ArrowUpDown, Filter } from "lucide-react";
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

interface ProgramFiltersBarProps {
  submissionStateFilter: ProgramSubmissionState | "ALL";
  onSubmissionStateChange: (state: ProgramSubmissionState | "ALL") => void;
  stateFilter: ProgramState | "ALL";
  onStateChange: (state: ProgramState | "ALL") => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  sort?: string;
  onSortChange?: (sort: string) => void;
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
