"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  value?: string;
  onChange?: (event: { target: { name: string; value: string } }) => void;
  onValueChange?: (value: string) => void;
  className?: string;
  name?: string;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select option",
  onChange,
  onValueChange,
  className = "",
  name,
  value = "",
  disabled,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onValueChange?.(selectedValue);
    onChange?.({
      target: {
        name: name || "",
        value: selectedValue,
      },
    });
  };

  return (
    <div className="relative group w-full">
      <select
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          // Base Layout
          "h-12 w-full appearance-none rounded-xl px-4 py-2.5 pr-10 text-sm font-medium transition-all outline-none",
          // Light Mode Colors & Shadows
          "bg-white border-slate-200 text-slate-900 shadow-sm hover:border-slate-300 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5",
          // Dark Mode Colors
          "dark:bg-[#121214] dark:border-slate-800/60 dark:text-white dark:hover:border-slate-700 dark:focus:border-blue-500/40",
          // Placeholder State
          !value && "text-slate-400 dark:text-slate-500 font-normal",
          // Disabled State
          disabled && "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900",
          className
        )}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-slate-900 dark:text-white bg-white dark:bg-[#1c1c1f]"
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Custom Chevron - Positions it perfectly and ignores mouse events so the select still opens */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-600 transition-transform group-focus-within:rotate-180 duration-200">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );
};

export default Select;