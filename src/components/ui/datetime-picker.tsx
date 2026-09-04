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
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value?: string; 
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function DateTimePicker({
  value,
  onChange,
  className,
  placeholder = "Select date and time",
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  const parsedDate = useMemo(() => {
    if (!value) return new Date();
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [value]);

  const [viewDate, setViewDate] = useState(() => new Date(parsedDate));
  const [hours, setHours] = useState(() => parsedDate.getHours());
  const [minutes, setMinutes] = useState(() => parsedDate.getMinutes());

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewDate(new Date(d));
        setHours(d.getHours());
        setMinutes(d.getMinutes());
      }
    }
  }, [value]);

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

  const toLocalISO = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const handleDateSelect = (dayNum: number) => {
    const selected = new Date(year, month, dayNum, hours, minutes);
    onChange(toLocalISO(selected));
  };

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    setHours(newHours);
    setMinutes(newMinutes);
    const day = parsedDate.getDate();
    const selected = new Date(year, month, day, newHours, newMinutes);
    onChange(toLocalISO(selected));
  };

  const formattedDisplay = useMemo(() => {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [value]);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full h-10 justify-between text-left font-normal rounded-xl bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 px-3 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer shadow-2xs",
              !value && "text-slate-400 dark:text-slate-500",
              className
            )}
          />
        }
      >
        <span className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
          <CalendarIcon className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
          {formattedDisplay || placeholder}
        </span>
        <Clock className="size-3.5 text-slate-400 shrink-0 ml-2" />
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner align="start" sideOffset={6} className="isolate z-50 outline-none">
          <PopoverPrimitive.Popup className="w-80 rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {monthNames[month]} {year}
              </span>
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon-sm" onClick={prevMonth} className="size-7 rounded-lg">
                  <ChevronLeft className="size-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" onClick={nextMonth} className="size-7 rounded-lg">
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
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
                  const isSelected =
                    parsedDate.getFullYear() === year &&
                    parsedDate.getMonth() === month &&
                    parsedDate.getDate() === dayNum;

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => handleDateSelect(dayNum)}
                      className={cn(
                        "size-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer",
                        isSelected
                          ? "bg-blue-600 text-white shadow-xs font-bold"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      )}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Clock className="size-3.5 text-slate-400" />
                Time
              </div>
              <div className="flex items-center gap-1.5">
                <Select
                  value={String(hours)}
                  onValueChange={(val) => handleTimeChange(Number(val), minutes)}
                >
                  <SelectTrigger className="h-8 w-16 px-2 text-xs font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder={String(hours).padStart(2, "0")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 min-w-16">
                    {Array.from({ length: 24 }).map((_, h) => (
                      <SelectItem key={h} value={String(h)} className="text-xs font-semibold">
                        {String(h).padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="text-xs font-bold text-slate-400">:</span>

                <Select
                  value={String(minutes)}
                  onValueChange={(val) => handleTimeChange(hours, Number(val))}
                >
                  <SelectTrigger className="h-8 w-16 px-2 text-xs font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder={String(minutes).padStart(2, "0")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 min-w-16">
                    {[0, 15, 30, 45].map((m) => (
                      <SelectItem key={m} value={String(m)} className="text-xs font-semibold">
                        {String(m).padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
