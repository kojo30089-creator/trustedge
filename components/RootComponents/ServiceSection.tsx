"use client";

import { motion } from "framer-motion";
import {
  Rocket,
  LineChart,
  Wallet,
  Bitcoin,
  Bell,
  Truck,
  ArrowUpRight,
  TerminalSquare,
  Database
} from "lucide-react";
import Link from "next/link";

// Added technical telemetry to replace the generic marketing feel
const systemModules = [
  {
    icon: Rocket,
    title: "Fractional Tech Equity",
    description: "Direct exposure to global innovators like Tesla, SpaceX, and Neuralink. We handle the decentralized share ledgers; you capture the growth.",
    sysId: "MOD_01",
    metric: "Micro-Share",
    metricLabel: "Allocation"
  },
  {
    icon: Bitcoin,
    title: "Cryptographic Portfolios",
    description: "A unified execution engine for spot trading, long-term cold storage, and DeFi yield generation across multiple chains.",
    sysId: "MOD_02",
    metric: "Multi-Chain",
    metricLabel: "Architecture"
  },
  {
    icon: Truck,
    title: "Logistics Telemetry",
    description: "Bridge the physical and digital. Link real-world freight shipments to your investment profiles with live geo-spatial map tracking.",
    sysId: "MOD_03",
    metric: "Real-Time",
    metricLabel: "Tracking Ping"
  },
  {
    icon: LineChart,
    title: "Live Analytics Feed",
    description: "Real-time P&L views aggregating fiat deposits, digital asset values, and physical shipment inventory into a single pane of glass.",
    sysId: "MOD_04",
    metric: "< 12ms",
    metricLabel: "Data Latency"
  },
  {
    icon: Bell,
    title: "Automated Triggers",
    description: "System-level push alerts for dividend distributions, liquidity unlocks, shipment arrivals, and KYC clearance status updates.",
    sysId: "MOD_05",
    metric: "Instant",
    metricLabel: "Execution"
  },
  {
    icon: Wallet,
    title: "Multi-Sig Custody",
    description: "Enterprise-grade wallet management utilizing multi-party computation (MPC), strict withdrawal parameters, and immutable audit trails.",
    sysId: "MOD_06",
    metric: "MPC-CMP",
    metricLabel: "Security Standard"
  },
];

const MatrixModule = ({ module, index }: any) => {
  const Icon = module.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative flex flex-col bg-white dark:bg-[#0a0a0a] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors duration-500 overflow-hidden min-h-[320px]"
    >
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-transparent group-hover:border-[#e51837] transition-colors duration-300" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-transparent group-hover:border-[#e51837] transition-colors duration-300" />
      
      <div className="p-8 flex-1 flex flex-col">
        
        {/* Module Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black text-slate-500 group-hover:text-[#e51837] group-hover:border-[#e51837]/30 transition-colors">
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#e51837] uppercase tracking-widest mb-1">
                {module.sysId}
              </div>
              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Status: Active
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight uppercase">
          {module.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium dark:font-light leading-relaxed mb-8 flex-1">
          {module.description}
        </p>

        {/* Extracted Telemetry Data */}
        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/10 flex items-end justify-between">
          <div>
            <div className="text-lg font-light text-slate-900 dark:text-white tracking-tight">{module.metric}</div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{module.metricLabel}</div>
          </div>
          
          <div className="h-8 w-8 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:border-slate-400 dark:group-hover:border-white/30 transition-all cursor-pointer">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default function ServiceSection() {
  return (
    <section id="services" className="relative py-24 lg:py-32 overflow-hidden bg-slate-50 dark:bg-[#030712] border-t border-slate-200 dark:border-white/5 transition-colors duration-500">
      
      {/* Structural Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="modules-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-slate-900 dark:text-white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#modules-grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        
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
                System Directory // Active Components
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-slate-900 dark:text-white uppercase"
            >
              A unified engine for <br />
              <span className="text-slate-500">Modern Wealth.</span>
            </motion.h2>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-slate-500 border border-slate-200 dark:border-white/10 p-3 bg-white dark:bg-[#0a0a0a]"
          >
            <Database className="h-4 w-4 text-[#e51837]" />
            <span>6 Modules Online</span>
          </motion.div>
        </div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-sm font-mono text-slate-600 dark:text-slate-400 leading-relaxed mb-16 max-w-2xl uppercase border-l-2 border-[#e51837] pl-4"
        >
          From fractional equity ledgers to blockchain assets and global logistics, command your entire portfolio infrastructure from a single pane of glass.
        </motion.p>

        {/* --- MODULES MATRIX (The Grid) --- */}
        <div className="w-full bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 shadow-2xl transition-colors duration-500 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px]">
          {systemModules.map((module, index) => (
            <MatrixModule key={index} module={module} index={index} />
          ))}
        </div>

        {/* --- BOTTOM CTA --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex justify-center"
        >
          <Link
            href="/signup"
            className="
              group relative flex items-center justify-between gap-6 
              border border-slate-900 dark:border-white bg-slate-900 dark:bg-white 
              text-white dark:text-slate-900 px-8 py-4 font-mono text-xs uppercase tracking-widest 
              hover:bg-[#e51837] hover:border-[#e51837] hover:text-white transition-colors duration-300
            "
          >
            <TerminalSquare className="h-4 w-4" />
            <span className="relative z-10">Explore Protocol Capabilities</span>
            <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}