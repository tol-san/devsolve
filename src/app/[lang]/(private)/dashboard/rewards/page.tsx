"use client";

import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  DollarSign,
  Award,
  CheckCircle2,
  Clock,
  Filter,
  ExternalLink,
  ShieldCheck,
  Download,
} from "lucide-react";
import {
  ActiveFilters,
  FilterBar,
  FilterControls,
  FilterRow,
  FilterSearch,
  FilterSelect,
  FilterTabs,
} from "@/components/ui/filter-bar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProgramPagination } from "@/components/programs/ProgramPagination";

export interface UserRewardItem {
  id: string;
  programName: string;
  programLogo?: string;
  reportId: string;
  reportTitle: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  rewardType: "BOUNTY" | "POINTS";
  amount: number;
  status: "PAID" | "PENDING" | "PROCESSING";
  awardedAt: string;
  transactionRef?: string;
}

const MOCK_REWARDS: UserRewardItem[] = Array.from({ length: 28 }, (_, index) => {
  const isBounty = index % 2 === 0;
  const isPaid = index % 3 !== 0;
  return {
    id: `rw-${101 + index}`,
    programName: index % 2 === 0 ? "CyberShield Inc." : "Spotify Audio Security Program",
    reportId: `REP-${8000 + index}`,
    reportTitle: `Security Vulnerability Report #${index + 1} - ${isBounty ? "Authorization Bypass" : "Stored XSS"}`,
    severity: index % 4 === 0 ? "CRITICAL" : index % 3 === 0 ? "HIGH" : "MEDIUM",
    rewardType: isBounty ? "BOUNTY" : "POINTS",
    amount: isBounty ? (index + 1) * 250 : (index + 1) * 50,
    status: isPaid ? "PAID" : "PENDING",
    awardedAt: `2026-03-${10 + (index % 18)}`,
  };
});

const REWARD_TYPE_TABS: {
  value: "ALL" | "BOUNTY" | "POINTS";
  label: string;
}[] = [
  { value: "ALL", label: "All rewards" },
  { value: "BOUNTY", label: "Bounties ($)" },
  { value: "POINTS", label: "Points" },
];

const REWARD_STATUS_LABELS: Record<string, string> = {
  ALL: "Any status",
  PAID: "Paid",
  PENDING: "Pending",
};

export default function RewardsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "BOUNTY" | "POINTS">("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const stats = useMemo(() => {
    let totalCash = 0;
    let totalPoints = 0;
    let pendingCash = 0;
    let paidCount = 0;

    MOCK_REWARDS.forEach((item) => {
      if (item.rewardType === "BOUNTY") {
        if (item.status === "PAID") {
          totalCash += item.amount;
          paidCount++;
        } else if (item.status === "PENDING" || item.status === "PROCESSING") {
          pendingCash += item.amount;
        }
      } else if (item.rewardType === "POINTS") {
        if (item.status === "PAID") {
          totalPoints += item.amount;
          paidCount++;
        }
      }
    });

    return { totalCash, totalPoints, pendingCash, paidCount };
  }, []);

  const filteredRewards = useMemo(() => {
    return MOCK_REWARDS.filter((item) => {
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        const matchesProgram = item.programName.toLowerCase().includes(query);
        const matchesReport = item.reportTitle.toLowerCase().includes(query);
        const matchesId = item.reportId.toLowerCase().includes(query);
        if (!matchesProgram && !matchesReport && !matchesId) return false;
      }

      if (statusFilter !== "ALL" && item.status !== statusFilter) {
        return false;
      }

      if (typeFilter !== "ALL" && item.rewardType !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [searchTerm, statusFilter, typeFilter]);

  const totalCount = filteredRewards.length;
  const totalPages = Math.ceil(totalCount / rowsPerPage) || 1;

  const paginatedRewards = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredRewards.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRewards, currentPage, rowsPerPage]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20";
      case "HIGH":
        return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20";
      case "MEDIUM":
        return "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20";
      case "LOW":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="min-h-screen  w-full text-foreground font-sans py-6 antialiased">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-6  w-full"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              Rewards & Earnings History
            </h1>
            <p className="text-base text-muted-foreground mt-1 font-normal">
              Track your earnings, bounties awarded, and reputation points earned from accepted security reports.
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-xl bg-card text-foreground font-semibold text-sm gap-2 self-start sm:self-auto hover:bg-muted h-11 px-5"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
            Export Statement
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Total Earned
              </p>
              <h3 className="text-3xl font-extrabold text-foreground mt-0.5 tracking-tight">
                ${stats.totalCash.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="p-5 bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Pending Payouts
              </p>
              <h3 className="text-3xl font-extrabold text-foreground mt-0.5 tracking-tight">
                ${stats.pendingCash.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="p-5 bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Total Reputation
              </p>
              <h3 className="text-3xl font-extrabold text-foreground mt-0.5 tracking-tight">
                {stats.totalPoints} <span className="text-sm font-semibold text-muted-foreground">pts</span>
              </h3>
            </div>
          </div>

          <div className="p-5 bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                totals Reports
              </p>
              <h3 className="text-3xl font-extrabold text-foreground mt-0.5 tracking-tight">
                {stats.paidCount}
              </h3>
            </div>
          </div>
        </div>

        <FilterBar>
          <FilterTabs
            label="Reward type"
            value={typeFilter}
            onChange={(value) => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}
            tabs={REWARD_TYPE_TABS}
          />

          <FilterRow>
            <FilterSearch
              value={searchTerm}
              onChange={(value) => {
                setSearchTerm(value);
                setCurrentPage(1);
              }}
              label="Search rewards"
              placeholder="Search by program, report title or ID..."
            />

            <FilterControls>
              <FilterSelect
                icon={Filter}
                label="Status"
                items={REWARD_STATUS_LABELS}
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as "ALL" | "PAID" | "PENDING");
                  setCurrentPage(1);
                }}
              />
            </FilterControls>
          </FilterRow>

          <ActiveFilters
            filters={[
              ...(statusFilter !== "ALL"
                ? [
                    {
                      key: "status",
                      label: REWARD_STATUS_LABELS[statusFilter],
                      clear: () => setStatusFilter("ALL"),
                    },
                  ]
                : []),
              ...(searchTerm.trim()
                ? [
                    {
                      key: "search",
                      label: `"${searchTerm.trim()}"`,
                      clear: () => setSearchTerm(""),
                    },
                  ]
                : []),
            ]}
            onClearAll={() => {
              setStatusFilter("ALL");
              setSearchTerm("");
            }}
          />
        </FilterBar>

        <div className="bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs overflow-hidden">
          {paginatedRewards.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">No reward history found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                No rewards match your selected search or filter criteria.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-4 px-6">
                    Program &amp; Report
                  </TableHead>
                  <TableHead className="py-4 px-4">Severity</TableHead>
                  <TableHead className="py-4 px-4">Reward</TableHead>
                  <TableHead className="py-4 px-4">Status</TableHead>
                  <TableHead className="py-4 px-4">Date</TableHead>
                  <TableHead className="py-4 px-6 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRewards.map((item) => (
                  <TableRow key={item.id} className="group">
                    <TableCell className="py-5 px-6 whitespace-normal">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                          {item.programName}
                        </span>
                        <h4 className="text-lg font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {item.reportTitle}
                        </h4>
                        <span className="text-sm text-muted-foreground font-mono">
                          ID: {item.reportId}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-5 px-4 align-top sm:align-middle">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-bold rounded-md border ${getSeverityBadge(
                          item.severity
                        )}`}
                      >
                        {item.severity}
                      </span>
                    </TableCell>

                    <TableCell className="py-5 px-4 align-top sm:align-middle">
                      {item.rewardType === "BOUNTY" ? (
                        <div className="font-extrabold text-foreground text-xl">
                          ${item.amount.toLocaleString()}
                        </div>
                      ) : (
                        <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xl">
                          +{item.amount} pts
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="py-5 px-4 align-top sm:align-middle">
                      {item.status === "PAID" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                          <Clock className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="py-5 px-4 text-sm font-medium text-muted-foreground align-top sm:align-middle">
                      {item.awardedAt}
                    </TableCell>

                    <TableCell className="py-5 px-6 text-right align-top sm:align-middle">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 font-semibold text-sm"
                      >
                        View Report
                        <ExternalLink className="w-4 h-4 ml-1.5 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <ProgramPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          displayedCount={paginatedRewards.length}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(rows: number) => {
            setRowsPerPage(rows);
            setCurrentPage(1);
          }}
          onPageChange={setCurrentPage}
        />
      </motion.div>
    </div>
  );
}