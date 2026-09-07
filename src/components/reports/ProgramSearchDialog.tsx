"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  Search,
  X,
  Check,
  Shield,
  Coins,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ProgramSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  programs: any[];
  selectedProgramId?: string;
  onSelectProgram: (program: any) => void;
}

export function ProgramSearchDialog({
  isOpen,
  onClose,
  programs = [],
  selectedProgramId,
  onSelectProgram,
}: ProgramSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPrograms = useMemo(() => {
    if (!searchQuery.trim()) return programs;
    const q = searchQuery.toLowerCase().trim();

    return programs.filter((p) => {
      const name = (p.name || p.title || "").toLowerCase();
      const company = (p.companyName || p.organizationName || "").toLowerCase();
      const handle = (p.handle || "").toLowerCase();
      const desc = (p.description || p.summary || "").toLowerCase();

      return (
        name.includes(q) ||
        company.includes(q) ||
        handle.includes(q) ||
        desc.includes(q)
      );
    });
  }, [programs, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-auto max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/60 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
              <Building2 className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-foreground truncate">
                Select Target Program
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                Choose the security program covering the finding you discovered
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="p-4 sm:p-5 border-b border-border/80 bg-background/50 space-y-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search programs by name, company, or keywords..."
              className="h-11 pl-10 pr-9 border-border bg-card text-sm rounded-xl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              Available Programs ({filteredPrograms.length})
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-primary hover:underline cursor-pointer"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* Programs List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2 flex-1">
          {filteredPrograms.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Building2 className="size-10 text-muted-foreground mx-auto opacity-40" />
              <p className="text-sm font-semibold text-foreground">
                No programs found
              </p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                No programs matched &ldquo;{searchQuery}&rdquo;. Try another search term.
              </p>
            </div>
          ) : (
            filteredPrograms.map((prog) => {
              const isSelected =
                selectedProgramId &&
                (prog.id === selectedProgramId ||
                  String(prog.id).toLowerCase() ===
                    String(selectedProgramId).toLowerCase());
              const company =
                prog.companyName ||
                prog.organizationName ||
                "Organization";
              const title = prog.name || prog.title || "Security Program";
              const isPrivate =
                prog.visibility === "PRIVATE" ||
                prog.visibility === "INVITE_ONLY";
              const isBounty = prog.engagementType !== "RESPONSE";
              const maxBounty = prog.maximumBounty
                ? `$${Number(prog.maximumBounty).toLocaleString()}`
                : null;

              return (
                <button
                  key={prog.id}
                  type="button"
                  onClick={() => {
                    onSelectProgram(prog);
                    onClose();
                  }}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/[0.04] ring-1 ring-primary/30"
                      : "border-border/80 bg-card hover:bg-muted/70 hover:border-primary/40 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`flex size-10 items-center justify-center rounded-xl font-bold text-sm shrink-0 shadow-2xs transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                      }`}
                    >
                      <Building2 className="size-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {title}
                        </span>
                        {isPrivate ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                          >
                            Private
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
                          >
                            Public
                          </Badge>
                        )}
                        {isBounty && maxBounty && (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <Coins className="size-3" />
                            Up to {maxBounty}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {company}
                        {prog.handle && ` • @${prog.handle}`}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isSelected ? (
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xs">
                        <Check className="size-4 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-primary flex items-center gap-1">
                        <span>Select</span>
                        <ArrowUpRight className="size-3.5" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border bg-muted/40 p-3.5 sm:p-4 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl font-semibold text-xs sm:text-sm h-9 px-4"
          >
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
