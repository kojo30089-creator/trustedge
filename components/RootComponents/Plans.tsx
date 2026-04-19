"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TerminalSquare, ShieldCheck, ArrowRight, Activity, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

const PlanContent = [
  {
    type: "Starter",
    amount: "1,000",
    description: "Initial liquidity testing environment.",
    offers: [
      { param: "Max Allocation", value: "$3,000" },
      { param: "Referral Yield", value: "2.0%" },
      { param: "Target ROI", value: "10.0%" },
      { param: "Accrual Rate", value: "3.0% / Day" }
    ],
    highlight: false,
    sysId: "T-01"
  },
  {
    type: "Standard",
    amount: "5,000",
    description: "Optimized growth architecture.",
    offers: [
      { param: "Max Allocation", value: "$15,000" },
      { param: "Referral Yield", value: "4.0%" },
      { param: "Target ROI", value: "15.0%" },
      { param: "Accrual Rate", value: "5.0% / Day" }
    ],
    highlight: true,
    sysId: "T-02"
  },
  {
    type: "Premium",
    amount: "10,000",
    description: "Advanced wealth accumulation.",
    offers: [
      { param: "Max Allocation", value: "$30,000" },
      { param: "Referral Yield", value: "6.0%" },
      { param: "Target ROI", value: "20.0%" },
      { param: "Accrual Rate", value: "7.0% / Day" }
    ],
    highlight: false,
    sysId: "T-03"
  },
  {
    type: "Elite",
    amount: "50,000",
    description: "Maximum institutional leverage.",
    offers: [
      { param: "Max Allocation", value: "$150,000" },
      { param: "Referral Yield", value: "10.0%" },
      { param: "Target ROI", value: "30.0%" },
      { param: "Accrual Rate", value: "10.0% / Day" }
    ],
    highlight: false,
    sysId: "T-04"
  },
];

export default function Plans() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-slate-50 dark:bg-[#030712] transition-colors duration-500 border-t border-slate-200 dark:border-white/5">
      
      {/* Structural Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="matrix-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-slate-900 dark:text-white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#matrix-grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* --- TERMINAL HEADER --- */}
        <div className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-6 flex items-center gap-3"
            >
              <div className="h-2 w-2 bg-[#e51837] animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-[#e51837] uppercase tracking-[0.2em]">
                System Directive // Capital Allocation
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-slate-900 dark:text-white uppercase"
            >
              Deployment <br />
              <span className="text-slate-500">Protocols.</span>
            </motion.h2>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-slate-500 border border-slate-200 dark:border-white/10 p-3 bg-white dark:bg-[#0a0a0a]"
          >
            <Activity className="h-4 w-4 text-[#e51837]" />
            <span>Select Active Tier</span>
          </motion.div>
        </div>

        {/* --- DEPLOYMENT MATRIX (The 1px Grid) --- */}
        <div className="w-full bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 shadow-2xl transition-colors duration-500 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px]">
          
          {PlanContent.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`
                group relative flex flex-col transition-colors duration-500
                ${plan.highlight ? 'bg-slate-50 dark:bg-[#0a0a0a]' : 'bg-white dark:bg-[#050a15] hover:bg-slate-50 dark:hover:bg-[#0a0a0a]'}
              `}
            >
              {/* Highlight Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] transition-colors duration-300 ${plan.highlight ? 'bg-[#e51837]' : 'bg-transparent group-hover:bg-[#e51837]/50'}`} />

              <div className="p-8 flex-1 flex flex-col">
                
                {/* Protocol Header */}
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <Database className="h-3 w-3" /> {plan.sysId}
                  </div>
                  {plan.highlight && (
                     <div className="text-[10px] font-mono font-bold text-[#e51837] uppercase tracking-widest bg-[#e51837]/10 px-2 py-1 border border-[#e51837]/20">
                       Optimal Node
                     </div>
                  )}
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                    {plan.type}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-widest min-h-[32px]">
                    {plan.description}
                  </p>
                </div>

                {/* Base Requirement (Price) */}
                <div className="mb-10 pb-8 border-b border-slate-200 dark:border-white/10">
                  <div className="text-[10px] font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-2">Base Entry</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-light text-slate-500">$</span>
                    <span className="text-4xl font-light text-slate-900 dark:text-white tracking-tighter">
                      {plan.amount}
                    </span>
                  </div>
                </div>

                {/* Technical Parameters (Replaces checkmarks) */}
                <div className="space-y-4 mb-10 flex-1">
                  {plan.offers.map((offer, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-mono border-b border-slate-100 dark:border-white/5 pb-2 last:border-0 last:pb-0">
                      <span className="text-slate-500 uppercase tracking-widest">{offer.param}</span>
                      <span className={`font-bold ${plan.highlight ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {offer.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Initialization Button */}
                <Button
                  className={`
                    w-full h-12 rounded-none font-mono text-xs uppercase tracking-widest transition-all duration-300
                    ${plan.highlight
                      ? "bg-[#e51837] hover:bg-[#ce1632] text-white"
                      : "bg-transparent border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                    }
                  `}
                  asChild
                >
                  <Link href="/signup" className="flex items-center justify-center gap-2">
                    {plan.highlight ? "Initialize System" : "Select Protocol"}
                    {plan.highlight && <ArrowRight className="h-4 w-4" />}
                  </Link>
                </Button>

              </div>
            </motion.div>
          ))}
        </div>

        {/* System Verification Tag */}
        <div className="mt-12 flex justify-center">
           <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-white/10 px-4 py-2 bg-white dark:bg-[#0a0a0a]">
             <ShieldCheck className="h-4 w-4 text-emerald-500" />
             <span>Contracts secured via multi-sig protocol. Instant liquidity upon confirmation.</span>
           </div>
        </div>

      </div>
    </section>
  );
}