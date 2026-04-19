"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeTogglerTwo() {
  const { toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Environment Mode"
      className="group relative flex h-8 w-[4.5rem] shrink-0 items-center rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 p-1 transition-colors duration-500 hover:bg-slate-300/50 dark:hover:bg-white/10 shadow-inner"
    >
      {/* Background Track Icons (Always visible, faintly in the background) */}
      <div className="absolute inset-0 flex justify-between items-center px-2.5 pointer-events-none">
        <Sun className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600 transition-colors" strokeWidth={1.5} />
        <Moon className="h-3 w-3 text-slate-400 dark:text-slate-600 transition-colors" strokeWidth={1.5} />
      </div>

      {/* The Sliding Thumb */}
      <div className="relative z-10 flex h-6 w-8 items-center justify-center rounded-full bg-white dark:bg-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.5)] ring-1 ring-black/5 dark:ring-white/10 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] dark:translate-x-8">
        
        {/* Active Sun Icon (Fades out in dark mode) */}
        <Sun 
          className="absolute h-3.5 w-3.5 text-slate-800 transition-opacity duration-500 dark:opacity-0" 
          strokeWidth={2} 
        />
        
        {/* Active Moon Icon (Fades in in dark mode) */}
        <Moon 
          className="absolute h-3 w-3 text-white opacity-0 transition-opacity duration-500 dark:opacity-100" 
          strokeWidth={2} 
        />
        
      </div>
    </button>
  );
}