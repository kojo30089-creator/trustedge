"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  Handshake, 
  Target, 
  ArrowRight,
  TerminalSquare,
  Activity,
  CheckCircle2
} from "lucide-react";

const protocolSteps = [
  {
    id: "01",
    title: "Outstanding Team",
    description: "We are 70+ investment professionals, including 24 partners with decade-long tenure, devoted to hands-on value creation.",
    icon: Users,
    metrics: [
      { label: "Headcount", value: "70+" },
      { label: "Partner Tenure", value: "10Y+" }
    ],
    status: "Verified"
  },
  {
    id: "02",
    title: "Collaborative Style",
    description: "We partner with leadership rather than dictate. We align incentives to build cultures obsessed with long-term growth.",
    icon: Handshake,
    metrics: [
      { label: "Execution Mode", value: "Sync" },
      { label: "Target Vector", value: "Long-Term" }
    ],
    status: "Active"
  },
  {
    id: "03",
    title: "Alignment of Interest",
    description: "We put real skin in the game. Transparent communication and shared objectives build our strongest relationships.",
    icon: Target,
    metrics: [
      { label: "Capital Deployed", value: "Co-Invest" },
      { label: "Objective", value: "Shared" }
    ],
    status: "Locked"
  },
];

// --- Sub-Component: Protocol Module ---
const ProtocolModule = ({ step, index }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="group relative flex flex-col bg-white dark:bg-[#0a0a0a] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors duration-500 overflow-hidden"
    >
      {/* Top Active Border Indicator */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-slate-200 dark:bg-white/10 group-hover:bg-[#e51837] transition-colors duration-300" />

      <div className="p-8 flex-1 flex flex-col">
        
        {/* Header Area */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black text-slate-500 group-hover:text-[#e51837] group-hover:border-[#e51837]/30 transition-colors">
              <step.icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Phase [{step.id}]
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-emerald-500">
            <CheckCircle2 className="h-3 w-3" />
            {step.status}
          </div>
        </div>

        {/* Content Area */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight uppercase">
          {step.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium dark:font-light leading-relaxed mb-8">
          {step.description}
        </p>

        {/* Extracted Metrics / Telemetry */}
        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 gap-4">
          {step.metrics.map((metric: any, i: number) => (
            <div key={i}>
              <div className="text-lg font-light text-slate-900 dark:text-white tracking-tight">{metric.value}</div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{metric.label}</div>
            </div>
          ))}
        </div>

      </div>

      {/* Hover Action Bar */}
      <div className="px-8 py-4 bg-slate-100 dark:bg-black/50 border-t border-slate-200 dark:border-white/10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-widest">
          Expand Protocol Details
        </span>
        <ArrowRight className="h-4 w-4 text-[#e51837]" />
      </div>
    </motion.div>
  );
};

export default function HowWeWork() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-slate-50 dark:bg-[#030712] border-t border-slate-200 dark:border-white/5 transition-colors duration-500">
      
      {/* Structural Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="protocol-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-slate-900 dark:text-white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#protocol-grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* --- TERMINAL HEADER --- */}
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
                System Directive // Operational DNA
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-slate-900 dark:text-white uppercase"
            >
              Built for long-term <br />
              <span className="text-slate-500">partnerships.</span>
            </motion.h2>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-slate-500 border border-slate-200 dark:border-white/10 p-3 bg-white dark:bg-[#0a0a0a]"
          >
            <TerminalSquare className="h-4 w-4 text-[#e51837]" />
            <span>Protocol Status: Active</span>
          </motion.div>
        </div>

        {/* Subtitle / Description */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-sm font-mono text-slate-600 dark:text-slate-400 leading-relaxed mb-12 max-w-2xl uppercase border-l-2 border-[#e51837] pl-4"
        >
          We do not merely deploy capital. We execute hands-on value creation, align structural incentives, and build alongside founders across all market cycles.
        </motion.p>

        {/* --- PROTOCOL PIPELINE (The Grid) --- */}
        {/* Flawless 1px borders using gap-[1px] and a container background */}
        <div className="relative w-full bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 shadow-xl transition-colors duration-500 grid grid-cols-1 md:grid-cols-3 gap-[1px]">
          
          {/* Animated Pipeline Connector Line (Runs across the top of the grid) */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-transparent z-20 pointer-events-none overflow-hidden">
            <motion.div 
              className="h-full w-1/3 bg-[#e51837] shadow-[0_0_10px_#e51837]"
              animate={{ x: ["-100%", "300%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {protocolSteps.map((step, idx) => (
            <ProtocolModule key={step.id} step={step} index={idx} />
          ))}

        </div>

      </div>
    </section>
  );
}