"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { LockKeyhole, Globe, Activity, Network, ArrowUpRight } from "lucide-react";
import { companyName } from "@/lib/data/info";

// --- Theme-Aware Spotlight Card ---
const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => { setIsFocused(true); setOpacity(1); };
  const handleBlur = () => { setIsFocused(false); setOpacity(0); };
  const handleMouseEnter = () => { setOpacity(1); };
  const handleMouseLeave = () => { setOpacity(0); };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      /* Outer shell: acts as the border reveal */
      className={`relative overflow-hidden rounded-[20px] bg-slate-200 dark:bg-slate-800 shadow-xl dark:shadow-2xl transition-colors duration-500 ${className}`}
    >
      {/* 1. The Border Spotlight (Brand color glow on the border) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[20px] opacity-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(229,24,55,0.4), transparent 40%)`,
        }}
      />
      
      {/* 2. The Inner Content Container (Switches from White to Deep Black) */}
      <div className="absolute inset-[1px] rounded-[19px] bg-white dark:bg-[#030712] z-10 transition-colors duration-500" />

      {/* 3. The Inner Background Spotlight (Soft glow over the content) */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity: opacity * 0.5,
          background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(229,24,55,0.08), transparent 40%)`,
        }}
      />

      {/* 4. The Hidden Grid Pattern (Revealed by the spotlight) */}
      <div 
        className="absolute inset-0 z-10 opacity-0 transition-opacity duration-500 pointer-events-none mix-blend-multiply dark:mix-blend-screen"
        style={{
          opacity: opacity * 0.4,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%23e51837' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          maskImage: `radial-gradient(400px circle at ${position.x}px ${position.y}px, black, transparent)`,
          WebkitMaskImage: `radial-gradient(400px circle at ${position.x}px ${position.y}px, black, transparent)`
        }}
      />

      {/* Actual Content */}
      <div className="relative z-20 h-full p-8 flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};

export default function Description() {
  return (
    <section className="relative w-full bg-slate-50 dark:bg-[#030712] py-24 lg:py-32 border-t border-slate-200 dark:border-white/5 overflow-hidden transition-colors duration-500">
      
      {/* Ambient background glow (Adjusts opacity based on theme) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(229,24,55,0.03),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(229,24,55,0.05),transparent_50%)] pointer-events-none transition-colors duration-500" />

      <div className="container relative mx-auto px-6 z-10">

        {/* --- HEADER --- */}
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-6 flex items-center gap-3"
            >
              <div className="h-2 w-2 bg-[#e51837] animate-pulse" />
              <span className="text-xs font-mono font-semibold text-[#e51837] uppercase tracking-[0.2em]">
                System Capabilities
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tighter text-slate-900 dark:text-white transition-colors duration-500"
            >
              Architecture built for <br />
              <span className="text-slate-500">absolute control.</span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-md text-sm text-slate-600 dark:text-slate-400 font-medium dark:font-light leading-relaxed border-l-2 border-[#e51837]/30 pl-6 transition-colors duration-500"
          >
            {companyName } bypasses standard dashboard logic. We merge algorithmic investing, cold-storage security, and global telemetry into a single, high-frequency terminal.
          </motion.p>
        </div>

        {/* --- KINETIC SPOTLIGHT GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Card 1: Wide */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="col-span-1 md:col-span-8 h-[380px]"
          >
            <SpotlightCard>
              <div className="flex justify-between items-start mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white backdrop-blur-md transition-colors duration-500">
                  <Activity className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-light text-slate-900 dark:text-white tracking-tight transition-colors duration-500">0.04ms</div>
                  <div className="text-[10px] font-mono text-[#e51837] uppercase tracking-widest">Execution Latency</div>
                </div>
              </div>
              
              <div className="mt-auto">
                <h3 className="mb-3 text-2xl font-bold dark:font-semibold text-slate-900 dark:text-white tracking-tight transition-colors duration-500">Algorithmic Precision</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium dark:font-light max-w-lg mb-6 transition-colors duration-500">
                  Deploy capital using institutional-grade models. Access fractional shares of top-tier assets and build a diversified portfolio with as little as $10, backed by microsecond market telemetry.
                </p>
                <div className="flex items-center text-xs font-mono text-slate-500 uppercase tracking-widest group-hover:text-[#e51837] dark:group-hover:text-white transition-colors cursor-pointer w-max">
                  <span className="mr-2">Initialize Module</span> <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>

              {/* Abstract Visual inside the card */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-32 opacity-10 dark:opacity-20 pointer-events-none hidden lg:block transition-opacity duration-500">
                <svg viewBox="0 0 100 50" className="w-full h-full stroke-[#e51837] fill-none" strokeWidth="0.5">
                  <path d="M0,25 Q15,5 25,25 T50,25 T75,25 T100,25" className="animate-[dash_3s_linear_infinite]" strokeDasharray="4 4" />
                  <path d="M0,35 Q20,45 35,25 T65,15 T100,35" stroke="currentColor" className="text-slate-300 dark:text-white" strokeWidth="0.2" />
                </svg>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Card 2: Tall */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="col-span-1 md:col-span-4 h-[380px]"
          >
            <SpotlightCard>
              <div className="flex justify-between items-start mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white backdrop-blur-md transition-colors duration-500">
                  <LockKeyhole className="h-5 w-5" strokeWidth={1.5} />
                </div>
              </div>
              <div className="mt-auto">
                <h3 className="mb-3 text-xl font-bold dark:font-semibold text-slate-900 dark:text-white tracking-tight transition-colors duration-500">Cryptographic Custody</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium dark:font-light mb-6 transition-colors duration-500">
                  Sleep soundly knowing your assets are protected by enterprise-grade encryption and cold storage protocols.
                </p>
                <div className="text-xl font-light text-slate-900 dark:text-white border-l-2 border-[#e51837] pl-3 transition-colors duration-500">SHA-256 <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Encryption Standard</span></div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Card 3: Tall */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="col-span-1 md:col-span-4 h-[380px]"
          >
            <SpotlightCard>
               <div className="flex justify-between items-start mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white backdrop-blur-md transition-colors duration-500">
                  <Globe className="h-5 w-5" strokeWidth={1.5} />
                </div>
              </div>
              <div className="mt-auto">
                <h3 className="mb-3 text-xl font-bold dark:font-semibold text-slate-900 dark:text-white tracking-tight transition-colors duration-500">Global Liquidity Pools</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium dark:font-light mb-6 transition-colors duration-500">
                  Bypass regional restrictions. Our architecture connects directly to global liquidity providers for optimal entry points.
                </p>
                <div className="text-xl font-light text-slate-900 dark:text-white border-l-2 border-emerald-500 pl-3 transition-colors duration-500">$4.2B+ <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Accessible Capital</span></div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Card 4: Wide */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
            className="col-span-1 md:col-span-8 h-[380px]"
          >
            <SpotlightCard>
              <div className="flex justify-between items-start mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white backdrop-blur-md transition-colors duration-500">
                  <Network className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="text-right">
                   <div className="flex items-center gap-2 justify-end">
                     <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                     <div className="text-2xl font-light text-slate-900 dark:text-white tracking-tight transition-colors duration-500">99.99%</div>
                   </div>
                  <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mt-1">System Uptime</div>
                </div>
              </div>
              
              <div className="mt-auto">
                <h3 className="mb-3 text-2xl font-bold dark:font-semibold text-slate-900 dark:text-white tracking-tight transition-colors duration-500">Unified Data Telemetry</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium dark:font-light max-w-lg mb-6 transition-colors duration-500">
                  Shatter data silos. View your portfolio performance overlaid with macroeconomic indicators and live shipment tracking in a single, uncompromised pane of glass.
                </p>
                <div className="flex items-center text-xs font-mono text-slate-500 uppercase tracking-widest group-hover:text-[#e51837] dark:group-hover:text-white transition-colors cursor-pointer w-max">
                  <span className="mr-2">View Analytics</span> <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

        </div>
      </div>
    </section>
  );
}