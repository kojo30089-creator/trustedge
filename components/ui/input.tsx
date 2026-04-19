"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        /* 1. THE FOUNDATION: Absolute transparency & Luxury Sizing */
        "flex w-full bg-transparent px-4 py-3.5 text-sm transition-all duration-300 outline-none",
        "h-auto min-h-[48px] rounded-xl border border-black/10 dark:border-white/10 shadow-sm",
        
        /* 2. TYPOGRAPHY: High contrast for values, soft for placeholders */
        "text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600",
        
        /* 3. INTERACTIVE STATES: Precision brand-red focus ring */
        "focus:border-[#e51837] focus:ring-2 focus:ring-[#e51837]/20 dark:focus:border-[#e51837]",
        
        /* 4. DISABLED & FILE STATES */
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-slate-900 dark:file:text-white",
        
        /* 5. SELECTION & ERROR */
        "selection:bg-[#e51837]/20 selection:text-[#e51837]",
        "aria-invalid:border-[#e51837] aria-invalid:ring-[#e51837]/20",
        
        className
      )}
      {...props}
    />
  )
}

export { Input }