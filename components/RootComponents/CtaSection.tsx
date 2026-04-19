"use client";

import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, TerminalSquare, ShieldAlert, Power } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-slate-50 dark:bg-[#030712] border-y border-slate-200 dark:border-white/5 transition-colors duration-500">
      
      {/* Structural Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-slate-900 dark:text-white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 px-4 md:px-6">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative bg-white dark:bg-[#050a15] border border-slate-200 dark:border-white/10 shadow-2xl transition-colors duration-500 group"
        >
          {/* Terminal Corner Accents */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#e51837] z-20" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#e51837] z-20" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#e51837] z-20" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#e51837] z-20" />

          {/* Top Command Bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/50 transition-colors">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <TerminalSquare className="h-3 w-3" /> System_Auth_Gateway
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono text-emerald-500 uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              2,042 Active Nodes
            </div>
          </div>

          <div className="relative px-6 py-16 md:px-16 md:py-24 text-center overflow-hidden">
            
            {/* Background Scanning Line */}
            <motion.div 
              animate={{ y: ["-100%", "400%"] }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
              className="absolute left-0 right-0 top-0 h-32 bg-gradient-to-b from-transparent via-[#e51837]/5 to-transparent pointer-events-none z-0"
            />

            <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
              
              <div className="flex items-center justify-center h-16 w-16 mb-8 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-[#e51837] transition-colors shadow-[0_0_30px_rgba(229,24,55,0.1)]">
                <Power className="h-6 w-6" strokeWidth={1.5} />
              </div>

              {/* Headline */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 dark:text-white mb-6 uppercase transition-colors duration-500">
                Engage Unified <br />
                <span className="text-slate-500">Telemetry.</span>
              </h2>

              {/* Subtext */}
              <p className="text-sm font-mono text-slate-600 dark:text-slate-400 mb-12 max-w-xl leading-relaxed uppercase transition-colors duration-500">
                Bypass legacy infrastructure. Command global assets and logistics from a singular, high-frequency terminal. Initialize your operating system now.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                {/* Primary Action */}
                <Link
                  href="/signup"
                  className="
                    group relative w-full sm:w-auto flex items-center justify-center gap-4
                    bg-[#e51837] px-8 py-5 text-xs font-mono font-bold text-white uppercase tracking-widest
                    transition-all duration-300 hover:bg-[#ce1632] overflow-hidden
                  "
                >
                  <span className="relative z-10">Initialize Protocol</span>
                  <ArrowUpRight className="relative z-10 h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  {/* Glitch Hover Effect */}
                  <div className="absolute inset-0 h-full w-full bg-white/20 -translate-x-full group-hover:animate-shimmer skew-x-12" />
                </Link>

                {/* Secondary Action */}
                <Link
                  href="/signin"
                  className="
                    group w-full sm:w-auto flex items-center justify-center gap-4
                    border border-slate-300 dark:border-white/20 bg-transparent px-8 py-5 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest
                    transition-all duration-300 hover:bg-slate-100 dark:hover:bg-white/5
                  "
                >
                  Authenticate
                </Link>
              </div>

              {/* System Disclaimer */}
              <div className="mt-12 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-white/10 px-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] transition-colors">
                <ShieldAlert className="h-3 w-3 text-amber-500" />
                <span>SYS.NOTE: Authorization does not require initial capital deployment.</span>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}