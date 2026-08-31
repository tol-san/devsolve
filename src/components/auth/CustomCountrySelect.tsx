"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { MapPin, ChevronDown, Loader2, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CountryOption } from "@/lib/redux/services/geoApi";

interface CustomCountrySelectProps {
  value: string;
  countryCode: string | null;
  countries: CountryOption[];
  onSelect: (country: CountryOption) => void;
  isDetecting: boolean;
}

export function CustomCountrySelect({
  value,
  countryCode,
  countries,
  onSelect,
  isDetecting,
}: CustomCountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries;
    const q = searchQuery.toLowerCase();
    return countries.filter((c) => c.name.toLowerCase().includes(q));
  }, [countries, searchQuery]);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-full h-11 px-3.5 bg-card hover:bg-muted/70 border border-border focus:border-blue-500 rounded-xl text-foreground text-sm flex items-center justify-between transition-all cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20",
          isOpen && "border-blue-500 ring-2 ring-blue-500/20"
        )}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {countryCode ? (
            <img
              src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
              alt="Country flag"
              className="w-5 h-3.5 object-cover rounded-2xs border border-border shadow-2xs shrink-0"
            />
          ) : (
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <span className={cn("truncate font-medium", !value && "text-muted-foreground font-normal")}>
            {value || "Select your country or region"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground ml-2">
          {isDetecting ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
          ) : (
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isOpen && "rotate-180 text-blue-600 dark:text-blue-400"
              )}
            />
          )}
        </div>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="absolute z-50 left-0 right-0 mt-1.5 bg-popover/95 backdrop-blur-md border border-border rounded-2xl shadow-xl p-2 max-h-72 flex flex-col overflow-hidden text-popover-foreground"
        >
          <div className="relative mb-2 px-1 pt-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country..."
              autoFocus
              className="w-full h-9 pl-9 pr-3 text-xs sm:text-sm bg-background/80 border border-border/80 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="overflow-y-auto space-y-0.5 max-h-52 pr-1">
            {filteredCountries.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                No country matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = value === c.name;
                return (
                  <button
                    key={`${c.code}-${c.name}`}
                    type="button"
                    onClick={() => {
                      onSelect(c);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-xs sm:text-sm rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer",
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold"
                        : "hover:bg-muted text-foreground font-medium"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                        alt={c.name}
                        className="w-5 h-3.5 object-cover rounded-2xs border border-border shadow-2xs shrink-0"
                      />
                      <span className="truncate">{c.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

