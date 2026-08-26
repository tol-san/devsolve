"use client";

import { motion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";

import { ProgramFiltersBar } from "@/components/programs/ProgramFiltersBar";
import type { CountryFilterOption } from "@/components/programs/ProgramFiltersBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  ProgramAssetFilter,
  ProgramIndustryFilter,
  ProgramSeverityFilter,
} from "@/hooks/useProgramFilters";
import { useT } from "@/lib/i18n/I18nProvider";

interface ProgramMobileFiltersProps {
  selectedAsset: ProgramAssetFilter;
  onAssetChange: (asset: ProgramAssetFilter) => void;
  selectedSeverity: ProgramSeverityFilter;
  onSeverityChange: (severity: ProgramSeverityFilter) => void;
  selectedIndustry: ProgramIndustryFilter;
  onIndustryChange: (industry: ProgramIndustryFilter) => void;
  country: string;
  onCountryChange: (country: string) => void;
  countryOptions: CountryFilterOption[];
  isLoadingCountries?: boolean;
  minReward: string;
  maxReward: string;
  onMinRewardChange: (value: string) => void;
  onMaxRewardChange: (value: string) => void;
  activeCount: number;
  totalCount: number;
  onResetFilters: () => void;
}

export function ProgramMobileFilters(props: ProgramMobileFiltersProps) {
  const t = useT();

  return (
    <div className="lg:hidden">
      <Dialog>
        <motion.div whileTap={{ scale: 0.98 }}>
          <DialogTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between rounded-xl bg-card"
              />
            }
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal data-icon="inline-start" aria-hidden="true" />
              {t("programs.mobileFilters.trigger")}
            </span>
            {props.activeCount > 0 ? (
              <Badge variant="secondary" className="tabular-nums">
                {props.activeCount} {t("programs.filters.active")}
              </Badge>
            ) : (
              <span className="text-sm font-medium text-muted-foreground">
                {t("programs.mobileFilters.optional")}
              </span>
            )}
          </DialogTrigger>
        </motion.div>

        <DialogContent
          showCloseButton={false}
          className="max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-lg"
        >
          <DialogHeader className="border-b border-border px-5 pt-5 pr-14 pb-4">
            <DialogTitle className="text-lg font-bold">
              {t("programs.mobileFilters.title")}
            </DialogTitle>
            <DialogDescription>
              {t("programs.mobileFilters.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-4 right-4 rounded-xl"
              />
            }
          >
            <X aria-hidden="true" />
            <span className="sr-only">{t("programs.mobileFilters.close")}</span>
          </DialogClose>

          <div className="overflow-y-auto p-4">
            <ProgramFiltersBar
              {...props}
              showHeader={false}
              idPrefix="mobile-program"
              className="gap-0"
            />
          </div>

          <DialogFooter className="flex-col border-t border-border bg-card px-4 py-4">
            {props.activeCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={props.onResetFilters}
                className="rounded-xl"
              >
                {t("programs.filters.clear")}
              </Button>
            ) : null}
            <DialogClose
              render={<Button type="button" className="rounded-xl" />}
            >
              {t("programs.mobileFilters.show")}{" "}
              {props.totalCount.toLocaleString()}{" "}
              {props.totalCount === 1
                ? t("programs.result")
                : t("programs.results")}
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
