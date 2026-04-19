"use client";

import React, { FC } from "react";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility, otherwise use standard string concat

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  success?: boolean;
  error?: boolean;
  hint?: string;
}

const Input: FC<InputProps> = ({
  type = "text",
  className = "",
  disabled = false,
  success = false,
  error = false,
  hint,
  ...props
}) => {
  return (
    <div className="relative w-full group">
      <input
        type={type}
        disabled={disabled}
        className={cn(
          // --- BASE LAYOUT ---
          "h-12 w-full appearance-none rounded-xl px-4 text-sm font-medium transition-all outline-none",
          
          // --- LIGHT MODE: SLATE NEUTRALS ---
          "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-sm",
          "hover:border-slate-300 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5",
          
          // --- DARK MODE: DEPTH & CONTRAST ---
          "dark:bg-[#121214] dark:border-slate-800/60 dark:text-white dark:placeholder:text-slate-600",
          "dark:hover:border-slate-700 dark:focus:border-blue-500/40 dark:focus:ring-blue-500/5",

          // --- ERROR STATE ---
          error && [
            "border-rose-300 dark:border-rose-900/50 text-rose-600 dark:text-rose-400",
            "focus:border-rose-500 focus:ring-rose-500/5"
          ],

          // --- SUCCESS STATE ---
          success && [
            "border-emerald-300 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400",
            "focus:border-emerald-500 focus:ring-emerald-500/5"
          ],

          // --- DISABLED STATE ---
          disabled && "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800",

          className
        )}
        {...props}
      />

      {/* Optional Hint Text */}
      {hint && (
        <p
          className={cn(
            "mt-1.5 px-1 text-[11px] font-medium tracking-tight animate-in fade-in slide-in-from-top-1",
            error ? "text-rose-500" : success ? "text-emerald-500" : "text-slate-500"
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;