"use client";

import React, { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

const Label: FC<LabelProps> = ({ htmlFor, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={twMerge(
        // Base Layout: Tighter bottom margin for better field association
        "mb-1 block select-none",
        
        // Typography: Slightly smaller (xs), bolder (semibold), and professional tracking
        "text-[11px] md:text-xs font-semibold uppercase tracking-wider",
        
        // Light Mode: Slate tones feel more premium than pure grey
        "text-slate-500",
        
        // Dark Mode: Elevated contrast with slate-400 for better legibility on deep backgrounds
        "dark:text-slate-400",

        // User-defined overrides
        className
      )}
    >
      {children}
    </label>
  );
};

export default Label;