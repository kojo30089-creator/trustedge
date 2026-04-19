"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ArrowUpRight, 
  Wallet, 
  Bitcoin, 
  Activity, 
  Lock, 
  Globe,
  Database,
  BarChart3
} from "lucide-react";
import Link from "next/link";

// --- Sub-component: Asset Sparkline (Draws the line chart dynamically) ---
const Sparkline = ({ points, color, delay }: { points: string, color: string, delay: number }) => (
  <svg className="h-8 w-24 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
    <motion.path 
      d={points}
      fill="none" 
      stroke={color} 
      strokeWidth="1.5"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, delay, ease: "easeInOut" }}
    />
    {/* Subtle gradient fill below the line */}
    <motion.path 
      d={`${points} L 100 30 L 0 30 Z`}
      fill={`url(#gradient-${color})`}
      opacity="0.1"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 0.1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, delay }}
    />
    <defs>
      <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
    </defs>
  </svg>
);

// --- Sub-component: Tabular Data Row ---
const AssetRow = ({ icon: Icon, symbol, name, price, change, trend, points, delay }: any) => {
  const isPositive = trend === "up";
  const color = isPositive ? "#10b981" : "#e51837"; // Emerald or Brand Red

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="group grid grid-cols-4 md:grid-cols-5 items-center p-4 border-b border-slate-200 dark:border-white/5 hover:bg-slate-100/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
    >
      <div className="col-span-2 md:col-span-1 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black text-slate-500 transition-colors">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">{symbol}</p>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{name}</p>
        </div>
      </div>
      
      <div className="hidden md:block col-span-1 text-left">
        <Sparkline points={points} color={color} delay={delay + 0.2} />
      </div>

      <div className="col-span-1 text-right md:text-left font-mono text-sm text-slate-900 dark:text-white">
        {price}
      </div>

      <div className="col-span-1 text-right flex flex-col items-end">
        <div className={`text-sm font-mono ${isPositive ? 'text-emerald-500' : 'text-[#e51837]'}`}>
          {change}
        </div>
      </div>

      <div className="hidden md:flex col-span-1 justify-end">
        <div className="h-6 w-6 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:border-slate-400 dark:group-hover:border-white/30 transition-all">
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </div>
    </motion.div>
  );
};

// --- Sub-component: Structural Feature Module ---
const ProtocolModule = ({ icon: Icon, title, desc, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="flex flex-col border-r last:border-r-0 border-slate-200 dark:border-white/10 p-8 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
  >
    <div className="flex items-center gap-4 mb-6">
      <div className="flex h-10 w-10 items-center justify-center border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black text-slate-900 dark:text-white transition-colors">
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-bold tracking-widest uppercase text-slate-900 dark:text-white">
        {title}
      </h3>
    </div>
    <p className="text-xs font-mono leading-relaxed text-slate-500 uppercase">
      {desc}
    </p>
  </motion.div>
);

export default function InvestInCrypto() {
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
        <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="h-2 w-2 bg-[#e51837] animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-[#e51837] uppercase tracking-[0.2em]">
                Module 03 // Tokenized Economy
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter uppercase">
              Live Market Depth.
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-slate-500 border border-slate-200 dark:border-white/10 p-3 bg-white dark:bg-[#0a0a0a]">
            <Database className="h-4 w-4 text-[#e51837]" />
            <span>Connection: Secure // 0.04ms</span>
          </div>
        </div>

        {/* --- THE MATRIX INTERFACE --- */}
        <div className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] shadow-2xl transition-colors duration-500">
          
          {/* Top Command Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/50 transition-colors">
            <div className="flex gap-2">
              <div className="h-2 w-2 bg-slate-300 dark:bg-slate-700" />
              <div className="h-2 w-2 bg-slate-300 dark:bg-slate-700" />
              <div className="h-2 w-2 bg-slate-300 dark:bg-slate-700" />
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity className="h-3 w-3" /> Live Feed
            </div>
          </div>

          <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-white/10">
            
            {/* LEFT PANEL: Order Book / Asset Feed (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col">
              {/* Table Header */}
              <div className="grid grid-cols-4 md:grid-cols-5 items-center p-4 border-b border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-transparent transition-colors">
                <div className="col-span-2 md:col-span-1">Asset</div>
                <div className="hidden md:block col-span-1">7D Trend</div>
                <div className="col-span-1 text-right md:text-left">Price (USD)</div>
                <div className="col-span-1 text-right">24H Vol</div>
                <div className="hidden md:block col-span-1 text-right">Action</div>
              </div>

              {/* Data Rows */}
              <div className="flex flex-col">
                <AssetRow 
                  delay={0.1} icon={Bitcoin} symbol="BTC" name="Bitcoin" 
                  price="$64,230.00" change="+2.45%" trend="up"
                  points="M 0 20 Q 20 15, 40 25 T 70 10 T 100 5" 
                />
                <AssetRow 
                  delay={0.2} icon={Wallet} symbol="ETH" name="Ethereum" 
                  price="$3,450.20" change="+1.82%" trend="up"
                  points="M 0 25 Q 15 20, 30 25 T 60 15 T 100 10" 
                />
                <AssetRow 
                  delay={0.3} icon={BarChart3} symbol="SOL" name="Solana" 
                  price="$145.60" change="-0.54%" trend="down"
                  points="M 0 10 Q 25 15, 50 10 T 75 25 T 100 28" 
                />
                <AssetRow 
                  delay={0.4} icon={Activity} symbol="LINK" name="Chainlink" 
                  price="$18.90" change="+5.12%" trend="up"
                  points="M 0 28 Q 20 20, 40 25 T 80 5 T 100 2" 
                />
              </div>

              {/* Action Bar */}
              <div className="p-4 bg-slate-50 dark:bg-black/30 mt-auto flex justify-between items-center transition-colors">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  Showing 4 of 12,402 Assets
                </span>
                <Link href="/markets" className="text-xs font-bold text-[#e51837] uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
                  Full Market Data <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* RIGHT PANEL: Institutional Analysis (5 Cols) */}
            <div className="lg:col-span-5 p-8 flex flex-col justify-between relative overflow-hidden bg-slate-100 dark:bg-black/50 transition-colors">
              
              {/* Background scanning line */}
              <motion.div 
                animate={{ y: ["0%", "100%", "0%"] }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-[#e51837]/5 to-transparent pointer-events-none"
              />

              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-8 w-8 border border-[#e51837]/30 bg-[#e51837]/10 flex items-center justify-center text-[#e51837]">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Institutional Logic</h3>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Execution Strategy</p>
                  </div>
                </div>

                <p className="text-sm font-mono text-slate-600 dark:text-slate-400 leading-relaxed mb-8 uppercase">
                  Our strategies combine active high-frequency trading with long-term holdings in DeFi protocols and Layer-1 infrastructure. Capture market upside with zero emotional interference.
                </p>

                {/* Big Metric */}
                <div className="border-l-2 border-[#e51837] pl-4 mb-12">
                  <div className="text-4xl font-light text-slate-900 dark:text-white tracking-tighter mb-1">$2.4B+</div>
                  <div className="text-[10px] font-mono text-[#e51837] uppercase tracking-widest">Daily Execution Volume</div>
                </div>
              </div>

              <Link href="/signup" className="group relative flex items-center justify-between border border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-4 font-mono text-xs uppercase tracking-widest hover:bg-[#e51837] hover:border-[#e51837] hover:text-white transition-colors">
                <span>Initialize Portfolio</span>
                <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>

          </div>

          {/* --- BOTTOM MODULES (Features) --- */}
          <div className="grid md:grid-cols-3 border-t border-slate-200 dark:border-white/10">
            <ProtocolModule 
              delay={0.2} icon={Database} title="Smart Insights" 
              desc="Live balances combine deposits, profit, and share values into one calculated net worth." 
            />
            <ProtocolModule 
              delay={0.3} icon={Globe} title="Logistics Integration" 
              desc="Track physical shipments alongside your digital portfolio. View ETA estimates instantly." 
            />
            <ProtocolModule 
              delay={0.4} icon={Lock} title="Admin Controls" 
              desc="Manage KYC status, withdrawal limits, and tiered permissions from a single panel." 
            />
          </div>

        </div>
      </div>
    </section>
  );
}