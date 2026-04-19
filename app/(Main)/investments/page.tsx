"use client";

import { motion, Variants } from "framer-motion";
import CoinFetch from "@/components/Investment/CoinFetch";
import { Info, TrendingUp } from "lucide-react";

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function InvestmentPage() {
  return (
    <motion.main
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="max-w-6xl mx-auto space-y-8 md:space-y-12 pb-16 pt-4 md:pt-8 px-4 sm:px-6 md:px-8"
    >

      {/* --- 1. HERO SECTION --- */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-semibold mb-4 md:mb-6">
            <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Live Markets
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tighter text-slate-900 dark:text-white mb-3 md:mb-4">
            Explore Assets
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg max-w-xl leading-relaxed">
            Track the most traded crypto pairs and spot opportunities. Prices are sourced in real-time directly from global exchanges.
          </p>
        </div>

        {/* Soft Status Indicator */}
        <div className="flex items-center gap-3 bg-white dark:bg-[#121214] px-4 py-2.5 md:px-5 md:py-3 rounded-[20px] md:rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100 dark:border-slate-800/60 shrink-0 w-full md:w-auto mt-2 md:mt-0">
          <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-emerald-500"></span>
          </span>
          <div>
            <p className="text-[10px] md:text-xs text-slate-400 font-medium uppercase tracking-wider">Market Status</p>
            <p className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Open 24/7</p>
          </div>
        </div>
      </motion.div>

      {/* --- 2. DATA TABLE WRAPPER --- */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">

        {/* Soft Header */}
        <div className="px-5 pt-6 pb-5 md:px-10 md:pt-8 md:pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-transparent">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white">Tradable Pairs</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">Select any asset to open its trading terminal.</p>
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-500 bg-white dark:bg-slate-800 px-3 py-1.5 md:px-4 md:py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 w-fit">
            <Info className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-500" />
            <span>Click to Invest</span>
          </div>
        </div>

        {/* The Component payload */}
        <div className="p-2 md:p-6 min-h-[400px] md:min-h-[500px]">
          <CoinFetch />
        </div>

      </motion.div>

    </motion.main>
  );
}