"use client";

import { AnimatePresence, motion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/I18nProvider";

/* The filter state stores the API's own vocabulary, so a chip needs the same
   value-to-key mapping the filter panel uses to label its options. */
const TYPE_KEYS: Record<string, string> = {
  All: "all",
  Bounty: "bounty",
  Response: "response",
};

const ASSET_KEYS: Record<string, string> = {
  All: "all",
  URL: "url",
  WILDCARD: "wildcard",
  API: "api",
  MOBILE_APP: "mobile",
  SOURCE_CODE: "source",
  IP_RANGE: "ipRange",
  HARDWARE: "hardware",
  OTHER: "other",
};

interface FilterChip {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
}

export function ProgramActiveFilters({
  searchTerm,
  type,
  asset,
  severity,
  industry,
  minReward,
  maxReward,
  sort,
  onClearSearch,
  onClearType,
  onClearAsset,
  onClearSeverity,
  onClearIndustry,
  onClearReward,
  onClearSort,
  onResetAll,
}: {
  searchTerm: string;
  type: string;
  asset: string;
  severity: string;
  industry: string;
  minReward: string;
  maxReward: string;
  sort: string;
  onClearSearch: () => void;
  onClearType: () => void;
  onClearAsset: () => void;
  onClearSeverity: () => void;
  onClearIndustry: () => void;
  onClearReward: () => void;
  onClearSort: () => void;
  onResetAll: () => void;
}) {
  const t = useT();
  const chips: FilterChip[] = [];

  if (searchTerm.trim()) {
    chips.push({
      key: "search",
      label: t("programs.activeFilters.search"),
      value: `“${searchTerm.trim()}”`,
      onRemove: onClearSearch,
    });
  }
  if (type !== "All") {
    chips.push({
      key: "type",
      label: t("programs.activeFilters.type"),
      value: t(`programs.tabs.${TYPE_KEYS[type] ?? "all"}`),
      onRemove: onClearType,
    });
  }
  if (asset !== "All") {
    chips.push({
      key: "asset",
      label: t("programs.activeFilters.asset"),
      value: t(`programs.assets.${ASSET_KEYS[asset] ?? "other"}`),
      onRemove: onClearAsset,
    });
  }
  if (severity !== "All") {
    chips.push({
      key: "severity",
      label: t("programs.activeFilters.severity"),
      value: t(`programs.severities.${severity.toLowerCase()}`),
      onRemove: onClearSeverity,
    });
  }
  if (industry !== "All") {
    chips.push({
      key: "industry",
      label: t("programs.activeFilters.industry"),
      value: t(`programs.industries.${industry.toLowerCase()}`),
      onRemove: onClearIndustry,
    });
  }
  if (minReward || maxReward) {
    chips.push({
      key: "reward",
      label: t("programs.activeFilters.reward"),
      value: `${minReward || "0"} – ${maxReward || t("programs.activeFilters.anyAmount")}`,
      onRemove: onClearReward,
    });
  }
  if (sort !== "newest") {
    chips.push({
      key: "sort",
      label: t("programs.activeFilters.sort"),
      value:
        sort === "reward-high"
          ? t("programs.sort.rewardHigh")
          : t("programs.sort.name"),
      onRemove: onClearSort,
    });
  }

  return (
    <AnimatePresence initial={false}>
      {chips.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="flex flex-wrap items-center gap-2 px-1 pt-1">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <SlidersHorizontal aria-hidden="true" className="size-4" />
              {t("programs.activeFilters.label")}
            </span>

            <AnimatePresence initial={false} mode="popLayout">
              {chips.map((chip) => (
                <motion.div
                  key={chip.key}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={chip.onRemove}
                    aria-label={`${t("programs.activeFilters.remove")}: ${chip.label} ${chip.value}`}
                    className="max-w-64 rounded-lg"
                  >
                    <span className="truncate">
                      <span className="font-medium text-muted-foreground">
                        {chip.label}:
                      </span>{" "}
                      {chip.value}
                    </span>
                    <X data-icon="inline-end" aria-hidden="true" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onResetAll}
              className="ml-auto rounded-lg"
            >
              {t("programs.activeFilters.clearAll")}
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
