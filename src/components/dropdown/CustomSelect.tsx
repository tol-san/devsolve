import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option<T> {
  value: T;
  label: string;
  sublabel?: string;
}

interface CustomSelectProps<T extends string> {
  label: string;
  value: T;
  onChange: (val: T) => void;
  options: Option<T>[];
}

export function CustomSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 px-4 flex items-center justify-between rounded-xl border bg-white text-slate-800 text-sm font-medium transition-all cursor-pointer ${
          isOpen
            ? "border-blue-500 ring-4 ring-blue-500/10 shadow-sm"
            : "border-slate-200 hover:border-slate-300 shadow-sm"
        }`}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-500" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 py-1.5 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/60 animate-in fade-in-50 zoom-in-95 duration-100">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left text-sm transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-blue-50/80 text-blue-600 font-semibold"
                    : "text-slate-700 hover:bg-slate-50 font-medium"
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="w-4 h-4 text-blue-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}