import { useState } from "react";
import {
  AssetType,
  ProgramType,
  SeverityLevel,
} from "@/lib/types/programs/types";

export type ProgramAssetFilter = "All" | AssetType;
export type ProgramSort = "newest" | "reward-high" | "name";
export type ProgramSeverityFilter = "All" | SeverityLevel;
export type ProgramIndustryFilter =
  | "All"
  | "TECHNOLOGY"
  | "FINANCE"
  | "HEALTHCARE"
  | "ECOMMERCE"
  | "GOVERNMENT"
  | "EDUCATION"
  | "OTHER";

export function useProgramFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<ProgramType>("All");
  const [selectedAsset, setSelectedAsset] =
    useState<ProgramAssetFilter>("All");
  const [selectedSeverity, setSelectedSeverity] =
    useState<ProgramSeverityFilter>("All");
  const [selectedIndustry, setSelectedIndustry] =
    useState<ProgramIndustryFilter>("All");
  const [minReward, setMinReward] = useState("");
  const [maxReward, setMaxReward] = useState("");
  const [sort, setSort] = useState<ProgramSort>("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleTypeChange = (type: ProgramType) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleAssetChange = (asset: ProgramAssetFilter) => {
    setSelectedAsset(asset);
    setCurrentPage(1);
  };

  const handleSortChange = (value: ProgramSort) => {
    setSort(value);
    setCurrentPage(1);
  };

  const handleSeverityChange = (severity: ProgramSeverityFilter) => {
    setSelectedSeverity(severity);
    setCurrentPage(1);
  };

  const handleIndustryChange = (industry: ProgramIndustryFilter) => {
    setSelectedIndustry(industry);
    setCurrentPage(1);
  };

  const handleResetExploreFilters = () => {
    setSelectedAsset("All");
    setSelectedSeverity("All");
    setSelectedIndustry("All");
    setMinReward("");
    setMaxReward("");
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedType("All");
    setSelectedAsset("All");
    setSelectedSeverity("All");
    setSelectedIndustry("All");
    setMinReward("");
    setMaxReward("");
    setSort("newest");
    setCurrentPage(1);
  };

  const activeExploreFilterCount = [
    selectedAsset !== "All",
    selectedSeverity !== "All",
    selectedIndustry !== "All",
    minReward !== "" || maxReward !== "",
  ].filter(Boolean).length;

  return {
    searchTerm,
    selectedType,
    selectedAsset,
    selectedSeverity,
    selectedIndustry,
    minReward,
    setMinReward,
    maxReward,
    setMaxReward,
    sort,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    handleSearchChange,
    handleClearSearch,
    handleTypeChange,
    handleAssetChange,
    handleSeverityChange,
    handleIndustryChange,
    handleResetExploreFilters,
    handleSortChange,
    handleResetFilters,
    activeExploreFilterCount,
  };
}
