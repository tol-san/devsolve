"use client";

import React from "react";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProgramType } from "./types";

interface BountyMatrixState {
  critical: { min: string; max: string };
  high: { min: string; max: string };
  medium: { min: string; max: string };
  low: { min: string; max: string };
}

interface Step4BountyMatrixProps {
  programType: ProgramType;
  offerBounties: boolean;
  setOfferBounties: (val: boolean) => void;
  bountyMatrix: BountyMatrixState;
  setBountyMatrix: React.Dispatch<React.SetStateAction<BountyMatrixState>>;
  pointsMatrix: BountyMatrixState;
  setPointsMatrix: React.Dispatch<React.SetStateAction<BountyMatrixState>>;
}

export function Step4BountyMatrix({
  programType,
  offerBounties,
  setOfferBounties,
  bountyMatrix,
  setBountyMatrix,
  pointsMatrix,
  setPointsMatrix,
}: Step4BountyMatrixProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground">
        {programType === "BOUNTY" ? "Bounty Matrix" : "Response Matrix"}
      </h2>

      {/* Checkbox Offer Financial Bounties */}
      <div className="p-4 bg-muted/50 rounded-xl border border-border flex items-center gap-3">
        <input
          type="checkbox"
          id="offerBounties"
          checked={offerBounties}
          onChange={(e) => setOfferBounties(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded border-border focus:ring-blue-500 cursor-pointer"
        />
        <label
          htmlFor="offerBounties"
          className="text-sm font-semibold text-foreground cursor-pointer"
        >
          {programType === "BOUNTY"
            ? "Offer financial bounties (Bounty Program)"
            : "Offer reputation points (Response Program)"}
        </label>
      </div>

      {/* REWARD MATRIX TABLE (DYNAMIC $ vs pts) */}
      {offerBounties && (
        <div className="border border-border rounded-xl overflow-x-auto bg-card">
          <Table className="min-w-[320px] sm:min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="py-3 px-3 sm:py-3.5 sm:px-6">Severity</TableHead>
                <TableHead className="py-3 px-2 sm:py-3.5 sm:px-4">
                  Min ({programType === "BOUNTY" ? "$" : "pts"})
                </TableHead>
                <TableHead className="py-3 px-3 sm:py-3.5 sm:px-6">
                  Max ({programType === "BOUNTY" ? "$" : "pts"})
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* CRITICAL */}
              <TableRow>
                <TableCell className="py-3 px-3 sm:py-4 sm:px-6">
                  <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-md bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20">
                    CRITICAL
                  </span>
                </TableCell>
                <TableCell className="py-3 px-2 sm:py-4 sm:px-4">
                  <Input
                    type="number"
                    value={
                      programType === "BOUNTY"
                        ? bountyMatrix.critical.min
                        : pointsMatrix.critical.min
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (programType === "BOUNTY") {
                        setBountyMatrix({
                          ...bountyMatrix,
                          critical: { ...bountyMatrix.critical, min: val },
                        });
                      } else {
                        setPointsMatrix({
                          ...pointsMatrix,
                          critical: { ...pointsMatrix.critical, min: val },
                        });
                      }
                    }}
                    className="h-10 w-24 sm:w-32 rounded-xl text-sm sm:text-base font-semibold border-border bg-card text-foreground"
                  />
                </TableCell>
                <TableCell className="py-3 px-3 sm:py-4 sm:px-6">
                  <Input
                    type="number"
                    value={
                      programType === "BOUNTY"
                        ? bountyMatrix.critical.max
                        : pointsMatrix.critical.max
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (programType === "BOUNTY") {
                        setBountyMatrix({
                          ...bountyMatrix,
                          critical: { ...bountyMatrix.critical, max: val },
                        });
                      } else {
                        setPointsMatrix({
                          ...pointsMatrix,
                          critical: { ...pointsMatrix.critical, max: val },
                        });
                      }
                    }}
                    className="h-10 w-24 sm:w-32 rounded-xl text-sm sm:text-base font-semibold border-border bg-card text-foreground"
                  />
                </TableCell>
              </TableRow>

              {/* HIGH */}
              <TableRow>
                <TableCell className="py-3 px-3 sm:py-4 sm:px-6">
                  <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-md bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
                    HIGH
                  </span>
                </TableCell>
                <TableCell className="py-3 px-2 sm:py-4 sm:px-4">
                  <Input
                    type="number"
                    value={
                      programType === "BOUNTY"
                        ? bountyMatrix.high.min
                        : pointsMatrix.high.min
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (programType === "BOUNTY") {
                        setBountyMatrix({
                          ...bountyMatrix,
                          high: { ...bountyMatrix.high, min: val },
                        });
                      } else {
                        setPointsMatrix({
                          ...pointsMatrix,
                          high: { ...pointsMatrix.high, min: val },
                        });
                      }
                    }}
                    className="h-10 w-24 sm:w-32 rounded-xl text-sm sm:text-base font-semibold border-border bg-card text-foreground"
                  />
                </TableCell>
                <TableCell className="py-3 px-3 sm:py-4 sm:px-6">
                  <Input
                    type="number"
                    value={
                      programType === "BOUNTY"
                        ? bountyMatrix.high.max
                        : pointsMatrix.high.max
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (programType === "BOUNTY") {
                        setBountyMatrix({
                          ...bountyMatrix,
                          high: { ...bountyMatrix.high, max: val },
                        });
                      } else {
                        setPointsMatrix({
                          ...pointsMatrix,
                          high: { ...pointsMatrix.high, max: val },
                        });
                      }
                    }}
                    className="h-10 w-24 sm:w-32 rounded-xl text-sm sm:text-base font-semibold border-border bg-card text-foreground"
                  />
                </TableCell>
              </TableRow>

              {/* MEDIUM */}
              <TableRow>
                <TableCell className="py-3 px-3 sm:py-4 sm:px-6">
                  <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-md bg-sky-50 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20">
                    MEDIUM
                  </span>
                </TableCell>
                <TableCell className="py-3 px-2 sm:py-4 sm:px-4">
                  <Input
                    type="number"
                    value={
                      programType === "BOUNTY"
                        ? bountyMatrix.medium.min
                        : pointsMatrix.medium.min
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (programType === "BOUNTY") {
                        setBountyMatrix({
                          ...bountyMatrix,
                          medium: { ...bountyMatrix.medium, min: val },
                        });
                      } else {
                        setPointsMatrix({
                          ...pointsMatrix,
                          medium: { ...pointsMatrix.medium, min: val },
                        });
                      }
                    }}
                    className="h-10 w-24 sm:w-32 rounded-xl text-sm sm:text-base font-semibold border-border bg-card text-foreground"
                  />
                </TableCell>
                <TableCell className="py-3 px-3 sm:py-4 sm:px-6">
                  <Input
                    type="number"
                    value={
                      programType === "BOUNTY"
                        ? bountyMatrix.medium.max
                        : pointsMatrix.medium.max
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (programType === "BOUNTY") {
                        setBountyMatrix({
                          ...bountyMatrix,
                          medium: { ...bountyMatrix.medium, max: val },
                        });
                      } else {
                        setPointsMatrix({
                          ...pointsMatrix,
                          medium: { ...pointsMatrix.medium, max: val },
                        });
                      }
                    }}
                    className="h-10 w-24 sm:w-32 rounded-xl text-sm sm:text-base font-semibold border-border bg-card text-foreground"
                  />
                </TableCell>
              </TableRow>

              {/* LOW */}
              <TableRow>
                <TableCell className="py-3 px-3 sm:py-4 sm:px-6">
                  <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20">
                    LOW
                  </span>
                </TableCell>
                <TableCell className="py-3 px-2 sm:py-4 sm:px-4">
                  <Input
                    type="number"
                    value={
                      programType === "BOUNTY"
                        ? bountyMatrix.low.min
                        : pointsMatrix.low.min
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (programType === "BOUNTY") {
                        setBountyMatrix({
                          ...bountyMatrix,
                          low: { ...bountyMatrix.low, min: val },
                        });
                      } else {
                        setPointsMatrix({
                          ...pointsMatrix,
                          low: { ...pointsMatrix.low, min: val },
                        });
                      }
                    }}
                    className="h-10 w-24 sm:w-32 rounded-xl text-sm sm:text-base font-semibold border-border bg-card text-foreground"
                  />
                </TableCell>
                <TableCell className="py-3 px-3 sm:py-4 sm:px-6">
                  <Input
                    type="number"
                    value={
                      programType === "BOUNTY"
                        ? bountyMatrix.low.max
                        : pointsMatrix.low.max
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (programType === "BOUNTY") {
                        setBountyMatrix({
                          ...bountyMatrix,
                          low: { ...bountyMatrix.low, max: val },
                        });
                      } else {
                        setPointsMatrix({
                          ...pointsMatrix,
                          low: { ...pointsMatrix.low, max: val },
                        });
                      }
                    }}
                    className="h-10 w-24 sm:w-32 rounded-xl text-sm sm:text-base font-semibold border-border bg-card text-foreground"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {/* INFO BOX */}
      <div className="p-4 bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl flex items-start gap-3 text-blue-900 dark:text-blue-200">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm font-medium leading-relaxed">
          {programType === "BOUNTY"
            ? "Financial rewards are displayed on resolved reports and agreed on-platform. Actual payment transfers occur off-platform via email or direct communication."
            : "Points are rewarded upon valid vulnerability resolution and count towards researcher platform rankings."}
        </p>
      </div>
    </div>
  );
}
