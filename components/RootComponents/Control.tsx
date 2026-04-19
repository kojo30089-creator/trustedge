"use client";

import { motion } from "framer-motion";
import { 
  ArrowUpRight, 
  Box, 
  Activity, 
  MapPin, 
  Crosshair,
  TerminalSquare,
  Globe
} from "lucide-react";
import Link from "next/link";

// --- Sub-Component: Terminal Log Entry ---
const LogEntry = ({ time, event, status, isAlert = false }: any) => (
  <div className="flex gap-4 py-3 border-b border-slate-200 dark:border-white/5 last:border-0 font-mono text-[10px] md:text-xs">
    <span className="text-slate-400 dark:text-slate-600 shrink-0">[{time}]</span>
    <span className={`flex-1 ${isAlert ? 'text-[#e51837]' : 'text-slate-600 dark:text-slate-400'}`}>
      {`> `}{event}
    </span>
    <span className={`shrink-0 uppercase tracking-widest ${status === 'OK' ? 'text-emerald-500' : status === 'WARN' ? 'text-amber-500' : 'text-[#e51837]'}`}>
      {status}
    </span>
  </div>
);

// --- Sub-Component: Equity Stream Row ---
const EquityRow = ({ ticker, shares, price, trend }: any) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-default transition-colors">
    <div>
      <p className="text-sm font-bold text-slate-900 dark:text-white">{ticker}</p>
      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{shares} Units</p>
    </div>
    <div className="text-right">
      <p className="text-sm font-mono text-slate-900 dark:text-white">{price}</p>
      <p className={`text-[10px] font-mono uppercase tracking-widest ${trend.startsWith('+') ? 'text-emerald-500' : 'text-[#e51837]'}`}>
        {trend}
      </p>
    </div>
  </div>
);

export default function Control() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-slate-50 dark:bg-[#030712] border-t border-slate-200 dark:border-white/5 transition-colors duration-500">
      
      {/* Schematic Background */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hud-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" className="text-slate-900 dark:text-white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hud-grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-6 flex items-center gap-3"
            >
              <div className="h-2 w-2 bg-[#e51837] animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-[#e51837] uppercase tracking-[0.2em]">
                System Core // Unified OS
              </span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-slate-900 dark:text-white uppercase"
            >
              Control over <br />
              <span className="text-slate-500">Pixels & Packages.</span>
            </motion.h2>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <Link href="/dashboard" className="group relative flex items-center justify-between border border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-[#e51837] hover:border-[#e51837] hover:text-white transition-colors">
              <span>Engage System</span>
              <ArrowUpRight className="ml-4 h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* --- THE HUD ARCHITECTURE --- */}
        {/* We use a grid with a background color and 1px gap to create flawless internal borders */}
        <div className="w-full bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 shadow-2xl transition-colors duration-500 grid grid-cols-1 lg:grid-cols-12 gap-[1px]">
          
          {/* TOP BAR: Micro Stats (Spans full 12 cols) */}
          <div className="col-span-1 lg:col-span-12 bg-slate-100 dark:bg-[#050a15] p-4 flex flex-wrap items-center justify-between transition-colors">
             <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
               <Crosshair className="h-4 w-4 text-[#e51837]" /> Global Telemetry Active
             </div>
             <div className="flex gap-8 text-[10px] font-mono uppercase tracking-widest">
                <div className="flex flex-col"><span className="text-slate-400 dark:text-slate-600">Net Worth</span><span className="text-slate-900 dark:text-white text-sm font-bold">$124,592.00</span></div>
                <div className="flex flex-col"><span className="text-slate-400 dark:text-slate-600">Data Latency</span><span className="text-emerald-500 text-sm font-bold">0.02ms</span></div>
                <div className="hidden sm:flex flex-col"><span className="text-slate-400 dark:text-slate-600">Active Nodes</span><span className="text-slate-900 dark:text-white text-sm font-bold">14</span></div>
             </div>
          </div>

          {/* LEFT PANE: Equity Stream (3 Cols) */}
          <div className="col-span-1 lg:col-span-3 bg-white dark:bg-[#0a0a0a] flex flex-col transition-colors">
            <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <Activity className="h-3 w-3" /> Equity Stream
            </div>
            <div className="p-4 flex-1 flex flex-col">
               <EquityRow ticker="TSLA" shares="15.0" price="$3,420.50" trend="+1.2%" />
               <EquityRow ticker="AAPL" shares="42.5" price="$7,810.20" trend="+0.8%" />
               <EquityRow ticker="NVDA" shares="8.0" price="$6,920.00" trend="-0.4%" />
               <EquityRow ticker="BTC" shares="0.45" price="$28,903.50" trend="+4.2%" />
            </div>
          </div>

          {/* CENTER PANE: Global Geo-Spatial Router (6 Cols) */}
          <div className="col-span-1 lg:col-span-6 bg-slate-50 dark:bg-[#050a15] relative overflow-hidden flex flex-col transition-colors min-h-[400px]">
            <div className="absolute inset-x-0 top-0 p-4 flex items-center justify-between z-20 pointer-events-none">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                <Globe className="h-3 w-3" /> Geo-Spatial Router
              </div>
              <div className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-mono uppercase tracking-widest border border-emerald-500/20">
                Tracking: 3 Shipments
              </div>
            </div>

            {/* Abstract SVG Map & Routes */}
            <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
              <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible">
                {/* Subtle Map Grid overlay inside the SVG */}
                <pattern id="map-dots" width="2" height="2" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.5" className="fill-slate-300 dark:fill-white/10" />
                </pattern>
                <rect width="100" height="60" fill="url(#map-dots)" />

                {/* Logistics Routes */}
                <motion.path 
                  d="M 20 40 Q 40 20, 60 30 T 90 20" 
                  fill="none" stroke="#e51837" strokeWidth="0.4" strokeDasharray="1 1"
                  className="opacity-50"
                />
                <motion.path 
                  d="M 30 50 Q 50 30, 70 40" 
                  fill="none" stroke="#10b981" strokeWidth="0.4" strokeDasharray="1 1"
                  className="opacity-50"
                />

                {/* Animated Data Packets traveling the routes */}
                <motion.circle r="1" fill="#e51837"
                  animate={{ offsetDistance: ["0%", "100%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  style={{ offsetPath: 'path("M 20 40 Q 40 20, 60 30 T 90 20")' }}
                />
                <motion.circle r="1" fill="#10b981"
                  animate={{ offsetDistance: ["0%", "100%"] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 1 }}
                  style={{ offsetPath: 'path("M 30 50 Q 50 30, 70 40")' }}
                />

                {/* Hub Nodes */}
                <circle cx="20" cy="40" r="1.5" className="fill-slate-900 dark:fill-white" />
                <circle cx="90" cy="20" r="1.5" className="fill-slate-900 dark:fill-white" />
                <circle cx="30" cy="50" r="1.5" className="fill-slate-900 dark:fill-white" />
                <circle cx="70" cy="40" r="1.5" className="fill-slate-900 dark:fill-white" />
                
                {/* Active Ping */}
                <motion.circle cx="90" cy="20" r="4" className="stroke-[#e51837] fill-none" strokeWidth="0.2"
                  animate={{ scale: [1, 2.5], opacity: [1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </svg>
            </div>

            {/* Scanning Line */}
            <motion.div 
              animate={{ y: ["0%", "400%"] }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute left-0 right-0 h-1/4 bg-gradient-to-b from-transparent via-[#e51837]/5 to-transparent pointer-events-none z-20"
            />
          </div>

          {/* RIGHT PANE: Logistics Terminal (3 Cols) */}
          <div className="col-span-1 lg:col-span-3 bg-white dark:bg-[#0a0a0a] flex flex-col transition-colors">
            <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <TerminalSquare className="h-3 w-3" /> Event Log
            </div>
            <div className="p-4 flex-1 flex flex-col overflow-hidden">
               <LogEntry time="14:02:41" event="Dividend Credited (AAPL)" status="OK" />
               <LogEntry time="13:45:11" event="Freight #8832 Dispatched" status="OK" />
               <LogEntry time="11:20:05" event="Customs Clearance (DXB)" status="WARN" />
               <LogEntry time="09:15:22" event="Asset Liquidation (NVDA)" status="OK" />
               <LogEntry time="08:02:10" event="Unauthorized Login Attempt" status="ERR" isAlert={true} />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}