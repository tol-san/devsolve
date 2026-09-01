"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  id?: string;
  error?: boolean;
  max?: string;
  min?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  className,
  placeholder = "Select date",
  id,
  error,
  max,
  min,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const parsedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  const [viewDate, setViewDate] = useState(() => parsedDate || new Date());

  useEffect(() => {
    if (parsedDate) {
      setViewDate(new Date(parsedDate));
    }
  }, [parsedDate]);

  const currentYear = new Date().getFullYear();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Generate year options from 1920 to currentYear + 5
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear + 5; y >= 1920; y--) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  const toYYYYMMDD = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleDateSelect = (dayNum: number) => {
    const selected = new Date(year, month, dayNum);
    onChange(toYYYYMMDD(selected));
    setOpen(false);
  };

  const handleMonthChange = (newMonth: string) => {
    setViewDate(new Date(year, parseInt(newMonth, 10), 1));
  };

  const handleYearChange = (newYear: string) => {
    setViewDate(new Date(parseInt(newYear, 10), month, 1));
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const formattedDisplay = useMemo(() => {
    if (!parsedDate) return null;
    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [parsedDate]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const handleToday = () => {
    const today = new Date();
    setViewDate(today);
    onChange(toYYYYMMDD(today));
    setOpen(false);
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        id={id}
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full h-10 justify-between text-left font-normal rounded-xl bg-card border-border text-foreground px-3 hover:bg-accent/60 cursor-pointer shadow-2xs transition-colors",
              error && "border-destructive focus-visible:ring-destructive",
              !value && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <span className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground truncate">
          <CalendarIcon className="size-4 text-primary shrink-0" />
          {formattedDisplay || placeholder}
        </span>
        {value ? (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Clear date"
          >
            <X className="size-3.5 shrink-0" />
          </span>
        ) : (
          <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
        )}
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner align="start" sideOffset={6} className="isolate z-50 outline-none">
          <PopoverPrimitive.Popup className="w-80 rounded-2xl bg-popover text-popover-foreground p-4 border border-border shadow-xl space-y-4 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95">
            {/* Header Controls: Month Select & Year Select */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-1">
                {/* Month Picker */}
                <Select value={String(month)} onValueChange={(val) => val && handleMonthChange(val)}>
                  <SelectTrigger className="h-8 flex-1 text-xs font-bold rounded-lg bg-muted border-border text-foreground">
                    <SelectValue>{monthNames[month]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {monthNames.map((name, i) => (
                      <SelectItem key={i} value={String(i)} className="text-xs font-semibold">
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Year Picker */}
                <Select value={String(year)} onValueChange={(val) => val && handleYearChange(val)}>
                  <SelectTrigger className="h-8 w-22 text-xs font-bold rounded-lg bg-muted border-border text-foreground">
                    <SelectValue>{String(year)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={String(y)} className="text-xs font-semibold">
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prev / Next Month Arrow Buttons */}
              <div className="flex items-center gap-0.5">
                <Button type="button" variant="ghost" size="icon-sm" onClick={prevMonth} className="size-7 rounded-lg text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="size-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" onClick={nextMonth} className="size-7 rounded-lg text-muted-foreground hover:text-foreground">
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>

            {/* Days Grid */}
            <div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateCandidate = new Date(year, month, dayNum);
                  const dateCandidateStr = toYYYYMMDD(dateCandidate);

                  const isBeyondMax = Boolean(max && dateCandidateStr > max);
                  const isBeforeMin = Boolean(min && dateCandidateStr < min);
                  const isDayDisabled = isBeyondMax || isBeforeMin || disabled;

                  const isSelected =
                    parsedDate &&
                    parsedDate.getFullYear() === year &&
                    parsedDate.getMonth() === month &&
                    parsedDate.getDate() === dayNum;

                  const isToday =
                    new Date().getFullYear() === year &&
                    new Date().getMonth() === month &&
                    new Date().getDate() === dayNum;

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      disabled={isDayDisabled}
                      onClick={() => !isDayDisabled && handleDateSelect(dayNum)}
                      className={cn(
                        "size-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors relative",
                        isDayDisabled
                          ? "opacity-25 cursor-not-allowed pointer-events-none text-muted-foreground"
                          : "cursor-pointer",
                        !isDayDisabled && isSelected
                          ? "bg-primary text-primary-foreground shadow-xs font-bold"
                          : !isDayDisabled && isToday
                          ? "bg-primary/10 text-primary font-bold border border-primary/20"
                          : !isDayDisabled
                          ? "hover:bg-accent text-foreground"
                          : ""
                      )}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Action Shortcuts */}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="h-7 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Clear
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleToday}
                className="h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10"
              >
                Today
              </Button>
            </div>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
