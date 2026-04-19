"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { 
  CheckSquare, 
  TrendingUp, 
  Layers, 
  Activity,
  Maximize,
  Crosshair,
  Database
} from "lucide-react";
import { companyName } from "@/lib/data/info";

// --- Sub-components ---

const TelemetryBox = ({ label, value, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="flex flex-col p-6 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 transition-colors"
  >
    <div className="flex items-center gap-2 mb-4">
       <div className="h-1.5 w-1.5 bg-[#e51837]" />
       <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">{label}</p>
    </div>
    <p className="text-4xl font-light text-slate-900 dark:text-white tracking-tighter">{value}</p>
  </motion.div>
);

const ProtocolRow = ({ text, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-start gap-4 py-3 border-b border-slate-200 dark:border-white/5 group"
  >
    <div className="mt-0.5 h-4 w-4 rounded-none bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-400 group-hover:bg-[#e51837] group-hover:text-white transition-colors">
      <CheckSquare className="h-3 w-3" />
    </div>
    <span className="text-xs font-mono text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors uppercase leading-relaxed">
      {text}
    </span>
  </motion.div>
);

export default function Chance() {
  const stats = [
    { title: "Active Deployments", value: "74+" },
    { title: "Protocols Backed", value: "6+" },
    { title: "Verified Exits", value: "35+" },
  ];

  const protocols = [
    "Investors own the underlying protocol equity",
    "Profit directly from token price appreciation",
    "Earn passive yield from on-chain validation",
    "Smart-contract backed execution transparency",
  ];

  return (
    <section className="relative px-4 md:px-6 py-24 lg:py-32 overflow-hidden bg-slate-50 dark:bg-[#030712] border-t border-slate-200 dark:border-white/5 transition-colors duration-500">
      
      {/* Structural Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="frontier-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-slate-900 dark:text-white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#frontier-grid)" />
        </svg>
      </div>

      <div className="container mx-auto relative z-10">
        
        {/* --- TERMINAL HEADER --- */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-200 dark:border-white/10 pb-8">
          <div className="space-y-4 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3"
            >
              <div className="h-2 w-2 bg-[#e51837] animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-[#e51837] uppercase tracking-[0.2em]">
                Module 04 // Asset Vectors
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-slate-900 dark:text-white uppercase"
            >
              Own the next wave of <br />
              <span className="text-slate-500">value creation.</span>
            </motion.h2>
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-md text-sm font-mono text-slate-600 dark:text-slate-400 leading-relaxed uppercase border-l-2 border-[#e51837] pl-4"
          >
            Blockchain assets represent the infrastructure of tomorrow. {companyName } enables you to capture, hold, and compound value directly from the networks powering the new financial era.
          </motion.p>
        </div>

        {/* --- MAIN CONTENT SPLIT --- */}
        <div className="grid lg:grid-cols-12 gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 shadow-2xl transition-colors duration-500">
          
          {/* LEFT: TECHNICAL IMAGE VIEWPORT (7 Cols) */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 relative bg-slate-100 dark:bg-[#0a0a0a] min-h-[500px] flex flex-col"
          >
            {/* Viewport Top Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                <Database className="h-3 w-3" /> Visual_Stream_01
              </div>
              <Maximize className="h-3 w-3 text-slate-400" />
            </div>

            {/* The Image Container (Strict framing, no rounded corners) */}
            <div className="relative flex-1 overflow-hidden group">
              {/* Corner Framing Elements */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#e51837] z-20 transition-transform duration-500 group-hover:-translate-x-1 group-hover:-translate-y-1" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#e51837] z-20 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#e51837] z-20 transition-transform duration-500 group-hover:-translate-x-1 group-hover:translate-y-1" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#e51837] z-20 transition-transform duration-500 group-hover:translate-x-1 group-hover:translate-y-1" />

              {/* Crosshair Center (Subtle) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-30 text-[#e51837] pointer-events-none">
                <Crosshair className="h-8 w-8" strokeWidth={1} />
              </div>

              <Image
                src="/images/body/content-left-02.jpg"
                alt="Blockchain infrastructure visual"
                width={900}
                height={650}
                className="w-full h-full object-cover object-center filter grayscale contrast-125 dark:brightness-75 group-hover:grayscale-0 transition-all duration-700"
              />
              
              {/* Data Overlay Box */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-0 left-0 right-0 border-t border-white/20 bg-black/80 backdrop-blur-md p-4"
              >
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/30">
                         <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-widest">Network Telemetry</p>
                        <p className="text-[10px] font-mono text-emerald-500">Consensus Active</p>
                      </div>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-mono text-emerald-500">+24.8%</p>
                     <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest">24h Vol</p>
                   </div>
                </div>
                {/* Technical Progress Bar */}
                <div className="flex gap-1 h-1 w-full opacity-70">
                  {[...Array(20)].map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0.2 }}
                      animate={{ opacity: i < 15 ? 1 : 0.2 }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className={`flex-1 ${i < 15 ? 'bg-emerald-500' : 'bg-white/20'}`} 
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>


          {/* RIGHT: DETAILS & STATS DATA PANE (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#050a15] flex flex-col transition-colors">
            
            {/* Context Box */}
            <div className="p-8 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                Sustainable <br/>On-Chain Execution.
              </h3>
              <p className="text-sm font-mono text-slate-600 dark:text-slate-400 leading-relaxed uppercase">
                Our strategies isolate infrastructure yield, early allocation tranches, and high-conviction protocols. Capital deployed here participates in the structural upside of the networks themselves.
              </p>
            </div>

            {/* Protocols List */}
            <div className="p-8 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-6">
                <Layers className="h-4 w-4 text-[#e51837]" />
                <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest">Execution Parameters</span>
              </div>
              <div className="flex flex-col gap-2">
                {protocols.map((protocol, i) => (
                  <ProtocolRow key={i} text={protocol} delay={0.2 + (i * 0.1)} />
                ))}
              </div>
            </div>

            {/* Highlight Metric Box */}
            <div className="bg-[#e51837] text-white p-6 flex items-start gap-4">
              <div className="h-10 w-10 bg-black/20 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm uppercase tracking-widest mb-1">Own the Infrastructure.</p>
                <p className="text-[10px] font-mono text-white/80 uppercase">Capture systemic value from every protocol transaction.</p>
              </div>
            </div>

            {/* Telemetry Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-[1px] bg-slate-200 dark:bg-white/10">
              {stats.slice(0, 2).map((stat, i) => (
                <TelemetryBox key={i} label={stat.title} value={stat.value} delay={0.6 + (i * 0.1)} />
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}