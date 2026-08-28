import { ArrowDownUp } from "lucide-react";

import {
  FilterBar,
  FilterControls,
  FilterRow,
  FilterSearch,
  FilterSelect,
} from "@/components/ui/filter-bar";

const SORT_LABELS: Record<string, string> = {
  recent: "Recently updated",
  oldest: "Oldest updated",
  title: "Title A-Z",
};

type SavedDraftSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  sortBy: "recent" | "oldest" | "title";
  onSortChange: (value: "recent" | "oldest" | "title") => void;
  resultCount: number;
};

export function SavedDraftSearch({
  value,
  onChange,
  placeholder,
  sortBy,
  onSortChange,
  resultCount,
}: SavedDraftSearchProps) {
  return (
    <FilterBar className="p-0 shadow-none ring-0 dark:ring-0">
      <FilterRow>
        <FilterSearch
          value={value}
          onChange={onChange}
          label="Search drafts"
          placeholder={placeholder}
        />

        <FilterControls>
          <FilterSelect
            icon={ArrowDownUp}
            label="Sort by"
            items={SORT_LABELS}
            value={sortBy}
            onValueChange={(next) =>
              onSortChange(next as "recent" | "oldest" | "title")
            }
          />
        </FilterControls>
      </FilterRow>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
        <p className="text-sm font-medium text-muted-foreground">
          {resultCount} drafts in view
        </p>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Resume work faster
        </p>
      </div>
    </FilterBar>
  );
}
