"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  Layers,
  ShieldCheck,
  Landmark,
  ArrowRight,
  Activity,
  TerminalSquare
} from "lucide-react";
import { companyName } from "@/lib/data/info";

const features = [
  {
    id: 0,
    title: "Elite Intelligence",
    description: "Our proprietary algorithms aggregate on-chain data, sentiment analysis, and macro-economic indicators to spot opportunities before the market moves.",
    icon: BrainCircuit,
    metric: "12ms",
    metricLabel: "Aggregation Speed",
    statusColor: "bg-[#e51837]" // Brand Red
  },
  {
    id: 1,
    title: "Unique Asset Classes",
    description: "Access a curated selection of tokenized real-world assets (RWAs), pre-market allocations, and high-yield DeFi instruments usually reserved for institutions.",
    icon: Layers,
    metric: "$400B+",
    metricLabel: "Market Access",
    statusColor: "bg-blue-500"
  },
  {
    id: 2,
    title: "Military-Grade Security",
    description: "Your capital is safeguarded by MPC cryptography, time-locked withdrawals, and 24/7 active threat monitoring.",
    icon: ShieldCheck,
    metric: "MPC-CMP",
    metricLabel: "Cryptographic Standard",
    statusColor: "bg-emerald-500"
  },
  {
    id: 3,
    title: "Institutional Backing",
    description: "We are supported by tier-1 venture firms with over $400B in assets under management, ensuring deep liquidity and long-term solvency.",
    icon: Landmark,
    metric: "Tier-1",
    metricLabel: "Liquidity Providers",
    statusColor: "bg-amber-500"
  },
];

export default function KineticBladeArchitecture() {
  // Default to the first blade being open
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative py-24 lg:py-32 w-full bg-slate-50 dark:bg-[#030712] transition-colors duration-500 border-t border-slate-200 dark:border-white/5 overflow-hidden">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="blade-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-slate-900 dark:text-white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blade-grid)" />
        </svg>
      </div>

      <div className="container relative mx-auto px-4 md:px-6 z-10">

        {/* HEADER */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-6 flex items-center gap-3"
            >
              <div className="flex gap-1">
                <div className="h-2 w-2 bg-[#e51837] animate-pulse" />
                <div className="h-2 w-2 bg-slate-300 dark:bg-slate-700" />
              </div>
              <span className="text-xs font-mono font-semibold text-[#e51837] uppercase tracking-[0.2em]">
                System Architecture
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-slate-900 dark:text-white"
            >
              Why we lead the <br />
              <span className="text-slate-500">new economy.</span>
            </motion.h2>
          </div>
        </div>

        {/* --- KINETIC SERVER BLADES --- */}
        {/* Mobile: Standard vertical stack. Desktop: Horizontal expanding Flex panels */}
        <div className="flex flex-col lg:flex-row h-auto lg:h-[600px] w-full gap-2 lg:gap-4">
          
          {features.map((feature, index) => {
            const isActive = activeIndex === index;

            return (
              <motion.div
                key={feature.id}
                layout
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                // This is the magic. Inactive = flex-1 (narrow). Active = flex-[3] (wide).
                className={`
                  relative overflow-hidden rounded-2xl border cursor-pointer flex flex-col transition-colors duration-500
                  ${isActive 
                    ? "lg:flex-[3.5] bg-white dark:bg-[#0a0a0a] border-slate-300 dark:border-white/10 shadow-2xl" 
                    : "lg:flex-[1] bg-slate-100 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/[0.05]"
                  }
                  h-[400px] lg:h-full
                `}
                transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
              >
                
                {/* --- INACTIVE / COMPRESSED STATE (Desktop Only) --- */}
                {/* Visible only when collapsed, creates the vertical text server blade look */}
                <div className={`
                  hidden lg:flex absolute inset-0 flex-col items-center justify-between py-8 transition-opacity duration-300
                  ${isActive ? "opacity-0 pointer-events-none" : "opacity-100"}
                `}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 text-slate-500">
                    <feature.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  
                  {/* Vertical Text */}
                  <div className="flex-1 flex items-center justify-center">
                    <span 
                      className="text-xl font-bold tracking-widest text-slate-400 dark:text-slate-500 whitespace-nowrap rotate-180" 
                      style={{ writingMode: 'vertical-rl' }}
                    >
                      {feature.title}
                    </span>
                  </div>

                  <span className="text-sm font-mono font-bold text-slate-400 dark:text-slate-600">
                    0{feature.id + 1}
                  </span>
                </div>

                {/* --- ACTIVE / EXPANDED STATE --- */}
                {/* Fades in when the blade expands */}
                <div className={`
                  absolute inset-0 flex flex-col transition-opacity duration-500 delay-100
                  ${isActive ? "opacity-100" : "opacity-0 lg:opacity-0"}
                  ${!isActive && "max-lg:opacity-100"} // Keep visible on mobile where it doesn't compress
                `}>
                  
                  {/* Top Header of the Blade */}
                  <div className="p-6 md:p-8 flex items-start justify-between border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white`}>
                        <feature.icon className="h-6 w-6" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                          <TerminalSquare className="h-3 w-3" /> Module 0{feature.id + 1}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                          {feature.title}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Status Indicator */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${feature.statusColor}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${feature.statusColor}`}></span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-widest">Active</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between overflow-hidden">
                    
                    <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium dark:font-light max-w-lg">
                      {feature.description}
                    </p>

                    {/* Bottom Data Section */}
                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 flex items-end justify-between">
                      
                      {/* Metric Display */}
                      <div>
                        <div className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mb-1">
                          {feature.metric}
                        </div>
                        <div className={`text-[10px] font-mono uppercase tracking-widest text-[#e51837]`}>
                          {feature.metricLabel}
                        </div>
                      </div>

                      {/* Fake Equalizer / Telemetry Visual */}
                      <div className="hidden sm:flex items-end gap-1 h-12 w-32">
                        {[40, 70, 45, 90, 60, 100, 50, 80, 30].map((height, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: "10%" }}
                            animate={{ height: isActive ? `${height}%` : "10%" }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.1 }}
                            className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-t-sm"
                            style={{ 
                              backgroundColor: isActive ? 'var(--e51837)' : '',
                              opacity: isActive ? 0.5 : 1
                            }}
                          />
                        ))}
                      </div>

                    </div>
                  </div>
                  
                </div>
              </motion.div>
            );
          })}

        </div>
      </div>
    </section>
  );
}