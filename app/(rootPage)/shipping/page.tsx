"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Package, 
  Globe, 
  ShieldCheck, 
  ArrowRight, 
  Search,
  Anchor,
  Plane,
  Activity,
  Radar,
  Box,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { companyName } from "@/lib/data/info";

// --- SYSTEM CONSTANTS ---
const MONO_LABEL = "text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.3em]";
const MONO_DATA = "font-mono font-medium tracking-tighter";
const SIGNAL_RED = "#e51837";

export default function LogisticsProtocol() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) router.push(`/tracking?id=${trackingId}`);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#030508] transition-colors duration-700 overflow-x-hidden">
      
      {/* --- BACKGROUND GRID --- */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="log-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#log-grid)" />
        </svg>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          
          <div className="space-y-12 relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="h-2 w-2 bg-[#e51837] animate-pulse rounded-full" />
              <span className={MONO_LABEL}>System // Global_Asset_Relay</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.9] uppercase"
            >
              Physical <br />
              <span className="text-slate-400 dark:text-slate-600">Integrity.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[11px] font-mono text-slate-500 uppercase tracking-widest leading-relaxed max-w-md border-l-2 border-[#e51837] pl-8"
            >
              {companyName} provides a unified cryptographic bridge between physical freight and digital liquidity. Real-time telemetry for high-value asset transit and automated settlement protocols.
            </motion.p>

            {/* COMMAND_SCAN WIDGET */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative max-w-md"
            >
              <form onSubmit={handleTrack} className="relative group">
                <div className="relative flex items-center bg-transparent border border-black/10 dark:border-white/10 rounded-xl overflow-hidden focus-within:border-[#e51837] transition-all duration-300">
                  <Search className="ml-4 h-4 w-4 text-slate-400" />
                  <input 
                    placeholder="LOCATE_NODE (e.g. SHP-8821)" 
                    className="w-full bg-transparent border-none focus:ring-0 text-[10px] font-mono h-14 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 uppercase"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                  />
                  <button type="submit" className="h-14 px-8 bg-slate-900 dark:bg-white text-white dark:text-black font-mono font-black text-[10px] uppercase tracking-widest hover:bg-[#e51837] dark:hover:bg-[#e51837] dark:hover:text-white transition-all">
                    Initialize_Scan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Visual: The Telemetry Map */}
          <div className="relative h-[550px] hidden lg:flex items-center justify-center p-8 bg-slate-50 dark:bg-white/[0.01] rounded-[3rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl">
            <Radar className="absolute top-10 right-10 h-6 w-6 text-[#e51837] opacity-20 animate-pulse" />
            
            {/* Vector Map Path */}
            <svg className="absolute inset-0 w-full h-full opacity-40">
              <path 
                d="M 100,400 Q 300,100 600,200" 
                fill="none" 
                stroke={SIGNAL_RED} 
                strokeWidth="1" 
                strokeDasharray="4 8" 
                className="animate-[dash_20s_linear_infinite]" 
              />
              <path 
                d="M 150,450 Q 400,200 550,150" 
                fill="none" 
                stroke="currentColor" 
                className="text-slate-300 dark:text-white/10" 
                strokeWidth="1" 
              />
            </svg>

            {/* Floating Telemetry Node */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-72 bg-white dark:bg-black border border-slate-200 dark:border-white/10 p-6 shadow-2xl rounded-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className={MONO_LABEL}>Node_Status: Active</span>
                </div>
                <Activity className="h-3 w-3 text-emerald-500" />
              </div>
              <div className="space-y-4">
                <div>
                   <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Target_Vector</p>
                   <p className="text-lg font-black dark:text-white tracking-tighter uppercase">London // LHR-04</p>
                </div>
                <div className="h-px w-full bg-slate-100 dark:bg-white/5" />
                <div className="flex justify-between items-end">
                   <div>
                      <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">ETA_Relay</p>
                      <p className="text-sm font-mono font-bold text-emerald-500 uppercase">T-Minus 42H</p>
                   </div>
                   <Plane className="h-4 w-4 text-slate-300" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- PROTOCOL FEATURES (1PX GRID) --- */}
      <section className="py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className={MONO_LABEL}>Supply_Chain // Integrity</span>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">System Flow.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10">
            {[
              { icon: ShieldCheck, title: "SECURE_CUSTODY", desc: "Bonded warehouse protocols utilizing IoT environmental sensors and multi-sig security clearance." },
              { icon: Activity, title: "TELEM_REALTIME", desc: "Sub-millisecond latency updates via global mesh network for high-value asset positioning." },
              { icon: Box, title: "SMART_ROUTING", desc: "Automated vector optimization using heuristic data analysis to minimize transit friction." }
            ].map((feature, i) => (
              <div key={i} className="group p-10 bg-white dark:bg-[#030508] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-[#e51837] transition-colors mb-8">
                  <feature.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-4">{feature.title}</h3>
                <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TRANSPORT VECTORS --- */}
      <section className="py-24 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            
            <div className="space-y-10">
              <div>
                <span className={MONO_LABEL}>Transit_Modules</span>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Multi-Modal.</h2>
              </div>
              <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed max-w-sm border-l-2 border-slate-200 dark:border-white/10 pl-8">
                Deployment across air, sea, and ground vectors with integrated customs protocol clearing.
              </p>
              
              <div className="space-y-2">
                {[
                  { icon: Plane, label: "AIR_FREIGHT", sub: "Priority // 1-3 Days" },
                  { icon: Anchor, label: "OCEAN_CARGO", sub: "Bulk // 15-30 Days" },
                  { icon: Activity, label: "GROUND_LOG", sub: "Terminal // Last Mile" },
                ].map((mode, i) => (
                  <div key={i} className="flex items-center gap-6 p-5 border border-slate-200 dark:border-white/5 bg-white dark:bg-black group hover:border-[#e51837] transition-all">
                    <div className="h-10 w-10 bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-[#e51837]">
                      <mode.icon className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest">{mode.label}</h4>
                      <p className="text-[9px] font-mono text-slate-500 uppercase">{mode.sub}</p>
                    </div>
                    <ChevronRight className="ml-auto h-3 w-3 text-slate-300 group-hover:text-[#e51837] transition-all" />
                  </div>
                ))}
              </div>
            </div>

            {/* CTA: Billing Node */}
            <div className="relative rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-black p-12 text-center shadow-2xl">
               <div className="absolute inset-0 bg-radial from-[#e51837]/5 via-transparent to-transparent opacity-50" />
               
               <div className="relative z-10 flex flex-col items-center">
                 <div className="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center mb-8">
                    <Activity className="h-7 w-7 text-[#e51837]" strokeWidth={1.5} />
                 </div>
                 <h3 className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase tracking-[0.4em] mb-4">Unified_Settlement</h3>
                 <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed mb-10 max-w-xs">
                   Liquidity clearing is managed internally. Transit costs are settled via automated cryptographic deduction from your active vault balance.
                 </p>
                 <Button className="h-14 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold tracking-widest uppercase text-[10px] px-12 hover:bg-[#e51837] dark:hover:bg-[#e51837] dark:hover:text-white transition-all duration-300">
                   Establish Relay
                 </Button>
               </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}